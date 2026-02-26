import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import settingsicon from '../src/assets/cogwheel.png'; 

const AdminPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const currentUsername = localStorage.getItem('username') || 'User';

  const [supplierPhoneNum, setSupPhoNo]=useState('');
  const [inventory, setInventory] = useState([]);
  const [shoptype, setShopType]=useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchInventory(); 
  }, [navigate, token]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/app/inventory', { headers: apiHeaders });
      if (response.ok) {
        const data = await response.json();
        setInventory(data); 
      } else {
        console.error("Failed to fetch. Token might be expired.");
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const newItemData = {
      sup_no: parseInt(supplierPhoneNum),
      name: newItemName,
      price: parseFloat(newItemPrice),
      quantity: parseInt(newItemQuantity, 10),
      shoptype: shoptype
    };

    try {
      const response = await fetch('http://localhost:5000/app/inventory', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(newItemData)
      });

      if (response.ok) {
        await fetchInventory();
        setNewItemName('');
        setNewItemPrice('');
        setNewItemQuantity('');
        setSupPhoNo('')
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const updateQuantity = async (id, amount) => {
    try {
      const response = await fetch(`http://localhost:5000/app/inventory/${id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ amount }) 
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setInventory(inventory.map(item => item._id === id ? { ...item, quantity: updatedItem.quantity } : item));
      } else {
        alert("You don't have permission to edit this item.");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/app/users', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      if (response.ok) {
        alert(`Shop Admin '${newUsername}' created successfully!`);
        setNewUsername('');
        setNewPassword('');
        setIsUserModalOpen(false);
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="max-w-175 mx-auto my-10 font-sans relative">
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3 mb-5">
        <div>
          {role === 'superadmin' ? (
            <>
              <h1 className="m-0 text-3xl font-bold">InfoZenx Admin Dashboard</h1>
              <p className="m-0 text-gray-500">
                Welcome, {currentUsername} | Role: <span className="uppercase font-bold text-blue-500">{role}</span>
              </p>
            </>
          ) : (
            <> <h1 className="m-0 text-3xl font-bold">
  {role === 'shopadmin' && currentUsername
    ? `${currentUsername} ${shoptype}`
    : 'Admin Dashboard'}
</h1>
              
              <p className="m-0 text-gray-500">
                Owner: {currentUsername}
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {role === 'superadmin' && (
            <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              + New Shop Admin
            </button>
          )}

          <button onClick={() => setIsModalOpen(true)} className="bg-transparent border-none cursor-pointer hover:scale-110 transition-transform" title="Add New Stock Item">
            <img src={settingsicon} alt="Settings" className="w-8 h-8" />
          </button>
          
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3">Current Stock</h3>
      <div className="flex flex-col gap-3">
        {inventory.length === 0 ? (
          <p className="text-gray-500 italic">Your stock is empty. Add some items!</p>
        ) : (
          inventory.map((item) => (
            <div key={item._id} className="flex justify-between items-center p-3 border border-gray-300 rounded-md shadow-sm">
              <div className="flex flex-col w-1/3">
                <strong className="text-lg">{item.name}</strong>
                {/* FIXED: We are now displaying item.sup_no and item.shoptype directly from the database! */}
                <span className="text-xs text-gray-600">Shop: {item.shoptype}</span>
                {role === 'superadmin' && (
                  <span className="text-xs text-blue-500">Supplier No: {item.sup_no}</span>
                )}
                {role === 'superadmin' && item.owner && (
                  <span className="text-xs text-blue-500">Owner: {item.owner.username || 'Unknown'}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-gray-500 text-sm">Price: ${Number(item.price || 0).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">Qty: {item.quantity}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => updateQuantity(item._id, -1)} className="px-3 py-1 text-base border border-gray-300 rounded hover:bg-gray-100 transition-colors">-</button>
                  <button onClick={() => updateQuantity(item._id, 1)} className="px-3 py-1 text-base border border-gray-300 rounded hover:bg-gray-100 transition-colors">+</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-100 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-xl font-bold">Add New Stock Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-xl cursor-pointer text-red-500 hover:text-red-700 transition-colors">✖</button>
            </div>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Shop type:</label>
                <input type="text" value={shoptype} onChange={(e) => setShopType(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Supplier No:</label>
                <input type="number" value={supplierPhoneNum} onChange={(e) => setSupPhoNo(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Item Name:</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">Price ($):</label>
                  <input type="number" step="0.01" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">Initial Qty:</label>
                  <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
              <button type="submit" className="p-2.5 bg-green-500 text-white rounded cursor-pointer text-base mt-2 hover:bg-green-600 transition-colors">Save Item</button>
            </form>
          </div>
        </div>
      )}

      {isUserModalOpen && role === 'superadmin' && (
        <div className="fixed inset-0 w-screen h-screen bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-100 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-xl font-bold text-blue-600">Create Shop Admin</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="bg-transparent border-none text-xl cursor-pointer text-red-500 hover:text-red-700 transition-colors">✖</button>
            </div>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">New Username:</label>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <button type="submit" className="p-2.5 bg-blue-500 text-white rounded cursor-pointer text-base mt-2 hover:bg-blue-600 transition-colors">Create User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;