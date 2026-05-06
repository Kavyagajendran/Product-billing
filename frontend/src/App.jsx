import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import BillingScanner from './components/BillingScanner';
import { Store, Barcode } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar glass-panel">
          <div className="flex items-center gap-4">
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
              <Store size={24} />
            </div>
            <h2>Modern Billing</h2>
          </div>
          <div className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="flex items-center gap-4"><Barcode size={18} /> Billing</span>
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="flex items-center gap-4"><Store size={18} /> Admin</span>
            </NavLink>
          </div>
        </nav>

        <main className="animate-fade-in">
          <Routes>
            <Route path="/" element={<BillingScanner />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
