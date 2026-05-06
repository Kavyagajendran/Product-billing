import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Save, Trash2 } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState('Retail');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!name) return alert('Name is required');

    try {
      await axios.post('http://localhost:5000/api/customers', {
        name, phone, customerType, discount: Number(discount)
      });
      setName('');
      setPhone('');
      setCustomerType('Retail');
      setDiscount(0);
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert('Failed to add customer. Ensure backend is restarted.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '2rem' }}>
        <Users size={32} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Customer Management</h2>
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 className="flex items-center gap-2" style={{ marginTop: 0, marginBottom: '1rem', color: '#374151' }}>
          <UserPlus size={20} /> Add New Customer
        </h3>
        <form onSubmit={handleAddCustomer} className="grid grid-cols-2" style={{ gap: '1rem' }}>
          <div>
            <label className="form-label">Name *</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Customer Type</label>
            <select className="form-input" value={customerType} onChange={e => setCustomerType(e.target.value)}>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="form-label">Global Discount (%)</label>
            <input type="number" min="0" max="100" className="form-input" value={discount} onChange={e => setDiscount(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Save Customer
            </button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <table className="table" style={{ verticalAlign: 'middle' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Discount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center text-muted">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">No customers added yet.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c._id}>
                  <td className="font-bold">{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                      backgroundColor: c.customerType === 'VIP' ? '#fef08a' : c.customerType === 'Wholesale' ? '#e0e7ff' : '#f3f4f6',
                      color: c.customerType === 'VIP' ? '#854d0e' : c.customerType === 'Wholesale' ? '#3730a3' : '#374151'
                    }}>
                      {c.customerType}
                    </span>
                  </td>
                  <td>{c.discount}%</td>
                  <td className="text-center">
                    <button onClick={() => handleDeleteCustomer(c._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
