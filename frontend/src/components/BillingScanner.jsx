import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';
import { Scan, ShoppingCart, Calculator, PlusCircle, User } from 'lucide-react';
import Cart from './Cart';
import Invoice from './Invoice';

export default function BillingScanner() {
  const [cart, setCart] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Customer Dynamic Pricing States
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
  const [customerPrices, setCustomerPrices] = useState([]);
  
  const scannerRef = useRef(null);
  const cartRef = useRef(cart);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Initial Fetches
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
      
    axios.get('http://localhost:5000/api/customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.error("Error fetching customers:", err));
  }, []);

  // Fetch Custom Prices when Customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find(c => c._id === selectedCustomerId);
      setSelectedCustomerObj(cust || null);
      
      axios.get(`http://localhost:5000/api/customer-prices/${selectedCustomerId}`)
        .then(res => setCustomerPrices(res.data))
        .catch(err => console.error("Error fetching custom prices:", err));
    } else {
      setSelectedCustomerObj(null);
      setCustomerPrices([]);
    }
  }, [selectedCustomerId, customers]);

  // Recalculate Cart when Pricing Tier Changes
  useEffect(() => {
    if (cart.length > 0) {
      setCart(prevCart => prevCart.map(item => {
        const { totalPrice, appliedPricingType, appliedPricePer50g } = calculateItemPrice(item, item.weightInGrams);
        return { ...item, totalPrice, appliedPricingType, appliedPricePer50g };
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerObj, customerPrices]);

  const calculateItemPrice = (baseProduct, weightInGrams, quantity = 1) => {
    let appliedPrice = baseProduct.pricePer50g;
    let pricingType = 'base';

    if (selectedCustomerObj) {
      // 1. Check Custom Price
      const customPriceObj = customerPrices.find(cp => cp.productId && cp.productId._id === baseProduct._id);
      if (customPriceObj) {
        appliedPrice = customPriceObj.customPrice;
        pricingType = 'custom';
      } else if (selectedCustomerObj.discount > 0) {
        // 2. Check Discount
        appliedPrice = appliedPrice * (1 - (selectedCustomerObj.discount / 100));
        pricingType = 'discount';
      }
    }

    const pricePerGram = appliedPrice / 50;
    const totalPrice = pricePerGram * weightInGrams * quantity;
    return { totalPrice, appliedPricingType: pricingType, appliedPricePer50g: appliedPrice };
  };

  useEffect(() => {
    if (isScannerOpen && !showInvoice) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          formatsToSupport: [ Html5QrcodeSupportedFormats.CODE_128 ]
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [isScannerOpen, showInvoice]);

  const addProductToCart = (product) => {
    const existingItemIndex = cartRef.current.findIndex(item => item._id === product._id);
    if (existingItemIndex >= 0) {
      alert(`${product.name} is already in the cart.`);
    } else {
      const { totalPrice, appliedPricingType, appliedPricePer50g } = calculateItemPrice(product, 0, 1);
      setCart(prev => [...prev, { 
        ...product, 
        inputWeight: 0, 
        unit: 'g', 
        weightInGrams: 0, 
        quantity: 1,
        totalPrice, 
        appliedPricingType,
        appliedPricePer50g
      }]);
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    if (scannerRef.current) scannerRef.current.pause(true);

    try {
      const response = await axios.get(`http://localhost:5000/api/products/${decodedText}`);
      addProductToCart(response.data);
    } catch (error) {
      console.error("Product not found:", error);
      alert(`Product not found for barcode: ${decodedText}`);
    } finally {
      if (scannerRef.current) setTimeout(() => scannerRef.current.resume(), 2000);
    }
  };

  const onScanFailure = (error) => { /* ignore */ };

  const handleAddCustomItem = () => {
    setCart(prev => [...prev, {
      _id: 'CUSTOM-' + Date.now(),
      name: '',
      pricePer50g: 0,
      appliedPricePer50g: 0,
      appliedPricingType: 'manual',
      inputWeight: 0,
      unit: 'g',
      weightInGrams: 0,
      quantity: 1,
      totalPrice: 0
    }]);
  };

  const handleManualAdd = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p._id === selectedProductId);
    if (product) {
      addProductToCart(product);
      setSelectedProductId("");
    }
  };

  const handleUpdateWeight = (index, inputValue, unit) => {
    const newCart = [...cart];
    const item = newCart[index];
    item.inputWeight = inputValue;
    item.unit = unit;
    
    const weightInGrams = unit === 'kg' ? inputValue * 1000 : inputValue;
    item.weightInGrams = weightInGrams;
    
    // Use the applied price if it exists (e.g. from manual override), otherwise calculate
    const currentPricePer50g = item.appliedPricePer50g !== undefined ? item.appliedPricePer50g : calculateItemPrice(item, weightInGrams, item.quantity || 1).appliedPricePer50g;
    const pricePerGram = currentPricePer50g / 50;
    
    item.totalPrice = pricePerGram * weightInGrams * (item.quantity || 1);
    
    setCart(newCart);
  };

  const handleUpdatePrice = (index, newPricePer50g) => {
    const newCart = [...cart];
    const item = newCart[index];
    
    item.appliedPricePer50g = newPricePer50g;
    item.appliedPricingType = 'manual';

    const pricePerGram = newPricePer50g / 50;
    item.totalPrice = pricePerGram * item.weightInGrams * (item.quantity || 1);
    
    setCart(newCart);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const newCart = [...cart];
    const item = newCart[index];
    
    item.quantity = newQuantity;

    const currentPricePer50g = item.appliedPricePer50g !== undefined ? item.appliedPricePer50g : calculateItemPrice(item, item.weightInGrams, newQuantity).appliedPricePer50g;
    const pricePerGram = currentPricePer50g / 50;
    
    item.totalPrice = pricePerGram * item.weightInGrams * newQuantity;
    
    setCart(newCart);
  };

  const handleUpdateName = (index, newName) => {
    const newCart = [...cart];
    newCart[index].name = newName;
    setCart(newCart);
  };

  const handleRemoveItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleGenerateBill = async () => {
    if (cart.length === 0) return;
    const invalidItems = cart.filter(item => item.weightInGrams <= 0);
    if (invalidItems.length > 0) {
      alert("Please enter a valid weight for all items.");
      return;
    }
    setShowInvoice(true);
  };

  const resetBilling = () => {
    setCart([]);
    setShowInvoice(false);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (showInvoice) {
    return <Invoice 
      cart={cart} 
      totalAmount={totalAmount} 
      onNewBill={resetBilling} 
      customerId={selectedCustomerObj?._id}
      customerName={selectedCustomerObj?.name}
    />;
  }

  return (
    <div className="grid grid-cols-2">
      {/* Input Section */}
      <div className="glass-panel">
        
        {/* Customer Selection */}
        <div style={{ marginBottom: '2.5rem', backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem', color: '#166534' }}>
            <User size={20} />
            <h3 style={{ margin: 0 }}>Customer Pricing Tier</h3>
          </div>
          <select 
            className="form-input" 
            style={{ marginBottom: 0, borderColor: '#86efac' }}
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">-- Standard Retail (No specific customer) --</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} {c.discount > 0 ? `(${c.discount}% OFF)` : ''} - {c.customerType}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <Scan size={28} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Add Products</h2>
        </div>

        {/* Manual Addition */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label text-muted" style={{ fontWeight: 'bold' }}>Manual Selection</label>
          <div className="flex gap-2">
            <select 
              className="form-input" 
              style={{ flex: 1, marginBottom: 0 }}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Choose a product from database --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Base: {(p.pricePer50g || 0).toFixed(2)}/50g)
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary" 
              onClick={handleManualAdd}
              disabled={!selectedProductId}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PlusCircle size={18} /> Add
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />
        
        {/* Scanner Section */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <label className="form-label text-muted" style={{ fontWeight: 'bold', margin: 0 }}>Barcode Scanner</label>
            {!isScannerOpen ? (
              <button 
                className="btn" 
                onClick={() => setIsScannerOpen(true)} 
                style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
              >
                Start Scanner
              </button>
            ) : (
              <button 
                className="btn" 
                onClick={() => setIsScannerOpen(false)} 
                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
              >
                Stop Scanner
              </button>
            )}
          </div>

          {isScannerOpen ? (
            <div id="reader" style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}></div>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
              <Scan size={40} color="#9ca3af" style={{ margin: '0 auto 1rem auto' }} />
              <p className="text-muted">Camera is inactive. Click <strong>Start Scanner</strong> to scan 1D barcodes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="glass-panel">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <div className="flex items-center gap-4">
            <ShoppingCart size={28} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Current Bill</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="btn" 
              onClick={handleAddCustomItem}
              style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <PlusCircle size={16} /> Add Custom Item
            </button>
            <span style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
              {cart.length} items
            </span>
          </div>
        </div>

        <Cart 
          cart={cart} 
          onUpdateWeight={handleUpdateWeight} 
          onRemoveItem={handleRemoveItem}
          onUpdatePrice={handleUpdatePrice}
          onUpdateName={handleUpdateName}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {cart.length > 0 ? (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <span className="text-xl text-muted">Total Amount:</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {totalAmount.toFixed(2)}
              </span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }} onClick={handleGenerateBill}>
              Generate Final Bill
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
            <p>Cart is empty. Add a product to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
