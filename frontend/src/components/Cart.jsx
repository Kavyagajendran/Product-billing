import { Trash2, Weight } from 'lucide-react';

export default function Cart({ cart, onUpdateWeight, onRemoveItem, onUpdatePrice, onUpdateName, onUpdateQuantity }) {
  if (cart.length === 0) return null;

  return (
    <div className="table-container animate-fade-in">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Rate (/50g)</th>
            <th>Quantity</th>
            <th>Weight</th>
            <th className="text-right">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td className="font-bold">
                <input
                  type="text"
                  className="form-input font-bold"
                  style={{ width: '150px', padding: '0.5rem', marginBottom: 0, fontWeight: 'bold' }}
                  value={item.name}
                  onChange={(e) => onUpdateName && onUpdateName(index, e.target.value)}
                  placeholder="Product Name"
                />
                {item.appliedPricingType === 'custom' && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>Custom Price</span>
                )}
                {item.appliedPricingType === 'discount' && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem' }}>Discounted</span>
                )}
                {item.appliedPricingType === 'manual' && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>Manual Override</span>
                )}
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-input"
                  style={{ width: '80px', padding: '0.5rem', marginBottom: 0 }}
                  value={item.appliedPricePer50g !== undefined ? item.appliedPricePer50g : (item.pricePer50g || 0)}
                  onChange={(e) => onUpdatePrice && onUpdatePrice(index, Number(e.target.value))}
                  placeholder="Rate"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ width: '70px', padding: '0.5rem', marginBottom: 0 }}
                  value={item.quantity || 1}
                  onChange={(e) => onUpdateQuantity && onUpdateQuantity(index, Number(e.target.value))}
                  placeholder="Qty"
                />
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    style={{ width: '100px', padding: '0.5rem', marginBottom: 0 }}
                    value={item.inputWeight || ''}
                    onChange={(e) => onUpdateWeight(index, Number(e.target.value), item.unit || 'g')}
                    placeholder="Weight"
                  />
                  <select
                    className="form-input"
                    style={{ width: '70px', padding: '0.5rem', marginBottom: 0 }}
                    value={item.unit || 'g'}
                    onChange={(e) => onUpdateWeight(index, item.inputWeight || 0, e.target.value)}
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </td>
              <td className="text-right font-bold" style={{ color: 'var(--primary)' }}>
                {(item.totalPrice || 0).toFixed(2)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => onRemoveItem(index)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
