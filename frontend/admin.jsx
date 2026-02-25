import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([
    { id: 1, name: 'Green Tea', price: 15.50, quantity: 50 },
    { id: 2, name: 'Black Tea', price: 12.00, quantity: 30 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItem = {
      id: Date.now(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      quantity: parseInt(newItemQuantity, 10)
    };

    setInventory([...inventory, newItem]);

    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity(0);
    setIsModalOpen(false); 
  };

  const updateQuantity = (id, amount) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + amount) };
      }
      return item;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'gray' }}>Welcome, InfoZenX Manager</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            title="Add New Stock Item"
          >
            ⚙️
          </button>

          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            Logout
          </button>
        </div>
      </div>

      <h3>Current Stock</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {inventory.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '18px' }}>{item.name}</strong>
              <div style={{ color: 'gray', fontSize: '14px' }}>Price: ${item.price.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Qty: {item.quantity}</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '5px 12px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>-</button>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '5px 12px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '25px', borderRadius: '8px', 
            width: '90%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Add New Stock Item</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'red' }}>
                ✖
              </button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Item Name:</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Price ($):</label>
                  <input type="number" step="0.01" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Initial Qty:</label>
                  <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '16px', marginTop: '5px' }}>
                Save Item
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;