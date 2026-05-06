import { useState } from 'react';
import axios from 'axios';
import { Printer, RefreshCw, CheckCircle, Tag } from 'lucide-react';

export default function Invoice({ cart, totalAmount, onNewBill, customerId, customerName }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveBill = async () => {
    setSaving(true);
    try {
      const billData = {
        customerId: customerId || null,
        customerName: customerName || null,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          weightInGrams: item.weightInGrams,
          quantity: item.quantity || 1,
          pricePer50g: item.appliedPricePer50g || item.pricePer50g,
          totalPrice: item.totalPrice,
          appliedPricingType: item.appliedPricingType || 'base'
        })),
        totalAmount
      };
      
      await axios.post('http://localhost:5000/api/bills', billData);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save bill", error);
      alert("Failed to save bill to database.");
    } finally {
      setSaving(false);
    }
  };

  const date = new Date().toLocaleString();

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Printable Area */}
      <div id="printable-invoice" style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', color: '#000' }}>
        <div className="flex justify-between items-start" style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#000' }}>INVOICE</h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Modern Retail Store</p>
            {customerName && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderLeft: '3px solid #10b981' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Customer: <span style={{ color: '#047857' }}>{customerName}</span></p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold">Date: <span style={{ fontWeight: 'normal' }}>{date}</span></p>
            <p className="font-bold">Invoice #: <span style={{ fontWeight: 'normal' }}>{Math.floor(Math.random() * 1000000)}</span></p>
          </div>
        </div>

        <table className="table" style={{ border: 'none' }}>
          <thead style={{ borderBottom: '2px solid #000' }}>
            <tr>
              <th style={{ backgroundColor: 'transparent', color: '#000' }}>Description</th>
              <th style={{ backgroundColor: 'transparent', color: '#000' }}>Qty</th>
              <th style={{ backgroundColor: 'transparent', color: '#000' }}>Weight</th>
              <th style={{ backgroundColor: 'transparent', color: '#000' }}>Rate (/50g)</th>
              <th className="text-right" style={{ backgroundColor: 'transparent', color: '#000' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td className="font-bold">
                  {item.name}
                  {item.appliedPricingType === 'custom' && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#d97706', backgroundColor: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Custom Price
                    </span>
                  )}
                  {item.appliedPricingType === 'discount' && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#047857', backgroundColor: '#d1fae5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Discounted
                    </span>
                  )}
                  {item.appliedPricingType === 'manual' && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Manual Override
                    </span>
                  )}
                </td>
                <td>{item.quantity || 1}</td>
                <td>{item.inputWeight || (item.weightInGrams === 0 ? '-' : item.weightInGrams)}{item.unit || 'g'}</td>
                <td>{(item.appliedPricePer50g || item.pricePer50g || 0).toFixed(2)}</td>
                <td className="text-right">{(item.totalPrice || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #f3f4f6' }}>
          <p className="text-muted">Thank you for your business!</p>
          <div className="text-right">
            <p className="text-xl">Total Amount:</p>
            <p className="text-2xl font-bold" style={{ color: '#000' }}>{totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center gap-4 mt-8 no-print">
        <button className="btn btn-secondary" onClick={onNewBill}>
          <RefreshCw size={18} /> New Bill
        </button>
        
        <div className="flex gap-4">
          {!saved ? (
            <button className="btn btn-primary" onClick={handleSaveBill} disabled={saving}>
              {saving ? 'Saving...' : 'Save to Database'}
            </button>
          ) : (
            <span className="flex items-center gap-4" style={{ color: '#10b981', fontWeight: 'bold' }}>
              <CheckCircle size={20} /> Saved
            </span>
          )}
          <button className="btn btn-secondary" onClick={handlePrint} style={{ backgroundColor: '#111827', color: 'white' }}>
            <Printer size={18} /> Print Invoice
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
