import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Eye, X, Calendar, DollarSign, Trash2, Filter } from 'lucide-react';

export default function BillsDashboard() {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterCustomerId, setFilterCustomerId] = useState('');

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills');
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bills/${id}`);
      fetchBills(); // Refresh the list
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Error deleting bill. Make sure your backend server is restarted!");
    }
  };

  const filteredBills = filterCustomerId 
    ? bills.filter(bill => bill.customerId === filterCustomerId)
    : bills;

  // Group bills by month-year
  const groupedBills = filteredBills.reduce((acc, bill) => {
    const date = new Date(bill.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = { bills: [], grandTotal: 0 };
    }
    acc[monthYear].bills.push(bill);
    acc[monthYear].grandTotal += bill.totalAmount;
    
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center text-muted" style={{ padding: '3rem' }}>Loading bills...</div>;
  }

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-4">
          <FileText size={32} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Sales Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-muted" />
          <select 
            className="form-input" 
            style={{ marginBottom: 0, minWidth: '200px', backgroundColor: '#f9fafb' }}
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
          >
            <option value="">All Customers & Retail</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(groupedBills).length === 0 ? (
        <p className="text-muted text-center" style={{ padding: '3rem 0' }}>No bills generated yet.</p>
      ) : (
        Object.entries(groupedBills).map(([monthYear, data]) => (
          <div key={monthYear} style={{ marginBottom: '3rem' }}>
            {/* Month Header & Grand Total */}
            <div 
              className="flex items-center justify-between" 
              style={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary)',
                marginBottom: '1rem'
              }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={24} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{monthYear}</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted text-sm font-bold">GRAND TOTAL</span>
                <span className="font-bold" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
                  {data.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bills Table for this month */}
            <div className="table-container">
              <table className="table" style={{ verticalAlign: 'middle' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Bill ID</th>
                    <th className="text-left">Customer</th>
                    <th>Total Items</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bills.map((bill) => (
                    <tr key={bill._id}>
                      <td>{new Date(bill.date).toLocaleString()}</td>
                      <td className="text-muted" style={{ fontSize: '0.875rem' }}>{bill._id.slice(-8).toUpperCase()}</td>
                      <td style={{ fontWeight: '500', color: bill.customerName ? '#047857' : '#6b7280' }}>
                        {bill.customerName || 'Retail'}
                      </td>
                      <td>{bill.items.length} items</td>
                      <td className="text-right font-bold">
                        {bill.totalAmount.toFixed(2)}
                      </td>
                      <td className="text-center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn" 
                          onClick={() => setSelectedBill(bill)}
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            fontSize: '0.875rem', 
                            backgroundColor: '#e5e7eb', 
                            color: '#374151',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Eye size={16} /> View
                        </button>
                        <button 
                          onClick={() => handleDeleteBill(bill._id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete bill"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Bill Details Modal/Overlay */}
      {selectedBill && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', position: 'relative' }}>
            <button 
              onClick={() => setSelectedBill(null)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginTop: 0, borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>Bill Details</h2>
            
            <div className="flex justify-between text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
              <span>ID: {selectedBill._id}</span>
              <span>{new Date(selectedBill.date).toLocaleString()}</span>
            </div>

            <div className="table-container" style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Weight</th>
                    <th>Rate (/50g)</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{item.name}</td>
                      <td>{item.weightInGrams}g</td>
                      <td className="text-muted">{(item.pricePer50g || 0).toFixed(2)}</td>
                      <td className="text-right font-bold">{(item.totalPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center" style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem' }}>
              <span className="font-bold text-muted">Total Amount</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {selectedBill.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
