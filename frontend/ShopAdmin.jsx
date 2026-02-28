import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ShopAdministration() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username") || "User";
  const shoptype = localStorage.getItem("shoptype") || "User"; 

  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]); 
  
  // Add Stock States
  const [supplierPhoneNum, setSupPhoNo] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");

  const [billItems, setBillItems] = useState([]);

  const apiHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchInventory();
    fetchUsers();
  }, [navigate, token]);

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:5000/app/inventory", {
        headers: apiHeaders,
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/app/users", {
        headers: apiHeaders,
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("failed to load user");
      }
    } catch (error) {
      console.error("Error fetching Users", error);
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
      shoptype: shoptype, 
    };

    try {
      const response = await fetch("http://localhost:5000/app/inventory", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(newItemData),
      });

      if (response.ok) {
        await fetchInventory();
        setNewItemName("");
        setNewItemPrice("");
        setNewItemQuantity("");
        setSupPhoNo("");
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const updateQuantity = async (id, amount) => {
    try {
      const response = await fetch(`http://localhost:5000/app/inventory/${id}`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setInventory((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, quantity: updatedItem.quantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

  const addToBill = (item) => {
    const existingItem = billItems.find((bItem) => bItem._id === item._id);
    if (existingItem) {
      setBillItems(
        billItems.map((bItem) =>
          bItem._id === item._id
            ? { ...bItem, billQty: bItem.billQty + 1 }
            : bItem
        )
      );
    } else {
      setBillItems([...billItems, { ...item, billQty: 1 }]);
    }
  };

  const billTotal = billItems.reduce(
    (sum, item) => sum + item.price * item.billQty,
    0
  );

  return (
    <div className="max-w-[1800px] mx-auto my-5 px-5 font-sans relative">
      
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3 mb-6">
        <div>
          <h1 className="m-0 text-3xl font-bold text-blue-800">
            {role === "shopadmin" && currentUsername
              ? `${currentUsername} ${shoptype}`
              : "Admin Dashboard"}
          </h1>
          <p className="m-0 text-gray-500">Owner: {currentUsername}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        <div className="w-full xl:w-1/4 bg-white border border-gray-200 rounded-lg p-5 shadow-sm sticky top-5">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Add New Stock</h3>
          
          <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Supplier No:</label>
              <input type="number" value={supplierPhoneNum} onChange={(e) => setSupPhoNo(e.target.value)} required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Item Name:</label>
              <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">Price (₹):</label>
                <input type="number" step="0.01" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">Init Qty:</label>
                <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded mt-2 hover:bg-blue-700 transition-colors">
              Save Item
            </button>
          </form>
        </div>

        <div className="w-full xl:w-2/4">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Current Inventory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.length === 0 ? (
              <p className="text-gray-500 italic">Your stock is empty.</p>
            ) : (
              inventory.map((item) => (
                <div key={item._id} className="flex flex-col justify-between p-4 border border-gray-200 rounded shadow-sm bg-white hover:shadow-md transition">
                  <div>
                    <strong className="text-lg block truncate">{item.name}</strong>
                    <span className="text-xs text-blue-600 block mb-1">Supplier: {item.sup_no}</span>
                    <span className="text-md font-medium text-gray-800">₹{item.price}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <span className="font-semibold text-gray-600">Qty: {item.quantity}</span>
                    <div className="flex gap-2">
                      <button onClick={() => updateQuantity(item._id, -1)} className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 font-bold">-</button>
                      <button onClick={() => updateQuantity(item._id, 1)} className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 font-bold">+</button>
                    </div>
                  </div>

                  <button onClick={() => addToBill(item)} className="mt-3 w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded font-bold hover:bg-green-500 hover:text-white transition-colors">
                    Add to Bill
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full xl:w-1/4 flex justify-center sticky top-5">
          
          <div className="w-full max-w-sm bg-white p-6 shadow-2xl border border-gray-200 font-mono text-sm relative">
            
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest">{shoptype || "YOUR SHOP"}</h2>
              <p className="text-gray-500 mt-1 uppercase">Owner: {currentUsername}</p>
              <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

            <div className="flex justify-between font-bold mb-2 uppercase text-xs text-gray-600">
              <span className="w-1/2">Item</span>
              <span className="w-1/4 text-center">Qty</span>
              <span className="w-1/4 text-right">Amt</span>
            </div>
            
            <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-4">
              {billItems.length === 0 ? (
                <p className="text-center text-gray-400 italic mt-10">Scan or add items...</p>
              ) : (
                billItems.map((billedItem, index) => (
                  <div key={index} className="flex justify-between mb-3 text-gray-800">
                    <div className="w-1/2 flex flex-col">
                      <span className="font-bold truncate" title={billedItem.name}>{billedItem.name}</span>
                      <span className="text-[10px] text-gray-500">₹{billedItem.price} each</span>
                    </div>
                    <span className="w-1/4 text-center">{billedItem.billQty}</span>
                    <span className="w-1/4 text-right font-bold">₹{(billedItem.price * billedItem.billQty).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

            <div className="flex justify-between items-center text-lg font-bold mb-6 text-gray-900">
              <span>TOTAL DUE:</span>
              <span>₹{billTotal.toFixed(2)}</span>
            </div>

            <div className="text-center text-xs text-gray-500 mb-6">
              <p>*** THANK YOU FOR SHOPPING ***</p>
              <p>Please come again</p>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <button 
                className="w-full py-2 bg-gray-900 text-white font-bold rounded hover:bg-black transition-colors"
                onClick={() => alert("Printing Receipt...")}
              >
                PRINT BILL
              </button>
              <button 
                className="w-full py-2 bg-red-100 text-red-600 font-bold rounded hover:bg-red-200 transition-colors"
                onClick={() => setBillItems([])}
              >
                VOID TRANSACTION
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}