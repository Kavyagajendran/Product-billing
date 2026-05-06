import { useState } from 'react';
import { PackageSearch, FileText, Users } from 'lucide-react';
import ProductEntry from './ProductEntry';
import BillsDashboard from './BillsDashboard';
import CustomerManagement from './CustomerManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex gap-4" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
        <button 
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('products')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}
        >
          <PackageSearch size={20} />
          Products Management
        </button>
        <button 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('customers')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}
        >
          <Users size={20} />
          Customers
        </button>
        <button 
          className={`btn ${activeTab === 'bills' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('bills')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}
        >
          <FileText size={20} />
          Bills & Sales
        </button>
      </div>

      <div>
        {activeTab === 'products' && <ProductEntry />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'bills' && <BillsDashboard />}
      </div>
    </div>
  );
}
