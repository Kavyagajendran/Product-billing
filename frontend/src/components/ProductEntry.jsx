import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Save, Download, ScanLine, Edit, Trash2 } from 'lucide-react';
import Barcode from 'react-barcode';

export default function ProductEntry() {
  const [formData, setFormData] = useState({
    name: '',
    pricePer50g: '',
    barcode: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateId = () => {
    const newId = 'PROD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, barcode: newId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    setGeneratedProduct(null);

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, {
          name: formData.name,
          pricePer50g: Number(formData.pricePer50g),
          barcode: formData.barcode
        });
        setStatus({ type: 'success', message: 'Product updated successfully!' });
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/products', {
          name: formData.name,
          pricePer50g: Number(formData.pricePer50g),
          barcode: formData.barcode
        });
        setStatus({ type: 'success', message: 'Product added successfully!' });
        setGeneratedProduct({ name: formData.name, barcode: formData.barcode });
      }
      setFormData({ name: '', pricePer50g: '', barcode: '' });
      fetchProducts();
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error saving product' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      pricePer50g: product.pricePer50g,
      barcode: product.barcode
    });
    setGeneratedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const downloadBarcode = () => {
    const canvas = document.querySelector(".barcode-container canvas");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${generatedProduct?.name || 'product'}-barcode.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
        <PackagePlus size={32} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      {status.message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="e.g. Premium Coffee Beans"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Price for 50g</label>
          <input
            type="number"
            step="0.01"
            name="pricePer50g"
            value={formData.pricePer50g}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="e.g. 5.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Product ID / Barcode</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="form-input"
              style={{ flex: 1 }}
              required
              placeholder="e.g. P001 or scan/type barcode"
            />
            <button 
              type="button" 
              className="btn" 
              onClick={handleGenerateId}
              style={{ whiteSpace: 'nowrap', backgroundColor: '#e5e7eb', color: '#374151' }}
            >
              Auto-Generate
            </button>
          </div>
          <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
            This identifier will be encoded into the 1D barcode.
          </small>
        </div>

        <div className="flex gap-2" style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Save Product & Generate Barcode')}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="btn" 
              style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151' }} 
              onClick={() => { setEditingId(null); setFormData({name:'', pricePer50g:'', barcode:''}); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {generatedProduct && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          backgroundColor: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ScanLine size={20} color="var(--primary)" />
            Generated Barcode
          </h3>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            <strong>{generatedProduct.name}</strong> (ID: {generatedProduct.barcode})
          </p>
          
          <div className="barcode-container" style={{ display: 'inline-block', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <Barcode 
              value={generatedProduct.barcode} 
              format="CODE128"
              renderer="canvas"
            />
          </div>

          <div>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={downloadBarcode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={18} />
              Download Barcode
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Added Products
        </h3>
        {products.length === 0 ? (
          <p className="text-muted">No products added yet.</p>
        ) : (
          <div className="table-container">
            <table className="table" style={{ verticalAlign: 'middle' }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Barcode / ID</th>
                  <th>Price (per 50g)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td className="font-bold">{p.name}</td>
                    <td>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <Barcode 
                          value={p.barcode} 
                          format="CODE128" 
                          height={30} 
                          width={1.5} 
                          displayValue={false} 
                          margin={0}
                        />
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>{p.barcode}</span>
                    </td>
                    <td>{(p.pricePer50g || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleEdit(p)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                        title="Edit product"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
