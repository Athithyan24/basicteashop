import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ShopAdministration() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username") || "User";

  const [inventory, setInventory] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [shoptype, setShoptype] = useState("Loading....");

  const apiHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/app/me", {
        headers: apiHeaders, // FIX: Changed 'header' to 'headers'
      });
      if (response.ok) {
        const data = await response.json();
        setShoptype(data.shoptype);
      }
    } catch (err) {
      console.error("Failed to fetch Profile:", err);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("shoptype");
    navigate("/");
  };

  const addToBill = (item) => {
    // Check if we have enough stock before adding to bill
    const existingItem = billItems.find((bItem) => bItem._id === item._id);
    const currentBillQty = existingItem ? existingItem.billQty : 0;

    if (currentBillQty >= item.quantity) {
      alert(`Not enough stock! Only ${item.quantity} available.`);
      return;
    }

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

  // NEW: Function to send the checkout request to the backend
  const handlePrintBill = async () => {
    if (billItems.length === 0) return alert("Bill is empty!");

    try {
      const response = await fetch("http://localhost:5000/app/checkout", {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({ billItems }),
      });

      if (response.ok) {
        alert("Transaction Successful! Stock updated.");
        setBillItems([]); // Clear the bill for the next customer
        fetchInventory(); // Refresh stock quantities on the screen
      } else {
        const data = await response.json();
        alert(`Checkout failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  const billTotal = billItems.reduce(
    (sum, item) => sum + item.price * item.billQty,
    0
  );

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchInventory();
    fetchProfile();
    // Removed fetchUsers() because billing page doesn't need to see other admins
  }, [navigate, token]);

  return (
    <div className="max-w-[1800px] mx-auto my-5 px-5 font-sans relative">
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3 mb-6">
        <div>
          <h1 className="m-0 text-3xl font-bold text-blue-800">
            {role === "shopadmin" && currentUsername
              ? `${currentUsername} - ${shoptype}`
              : "Admin Dashboard"}
          </h1>
          <p className="m-0 text-gray-500">Billing Counter</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition"
          >
            Back to Inventory
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* INVENTORY LIST (Takes up more space now since Add Stock is gone) */}
        <div className="w-full xl:w-2/3">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Available Items</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.length === 0 ? (
              <p className="text-gray-500 italic">No stock available. Please add items from the Inventory page.</p>
            ) : (
              inventory.map((item) => (
                <div 
                  onClick={() => addToBill(item)} 
                  key={item._id} 
                  className="cursor-pointer flex flex-col justify-between p-4 border border-gray-200 rounded shadow-sm bg-white hover:shadow-md hover:border-blue-300 transition"
                >
                  <div>
                    <strong className="text-lg block truncate">{item.name}</strong>
                    <span className="text-md font-bold text-green-700">₹{item.price}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <span className={`font-semibold ${item.quantity > 0 ? 'text-gray-600' : 'text-red-500'}`}>
                      {item.quantity > 0 ? `Qty: ${item.quantity}` : "Out of Stock"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BILLING SECTION (Receipt) */}
        <div className="w-full xl:w-1/3 flex justify-center sticky top-5">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl border border-gray-200 font-mono text-sm relative">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold uppercase tracking-widest">{shoptype || "YOUR SHOP"}</h2>
              <p className="text-gray-500 mt-1 uppercase">Cashier: {currentUsername}</p>
              <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

            <div className="flex justify-between font-bold mb-2 uppercase text-xs text-gray-600">
              <span className="w-1/2">Item</span>
              <span className="w-1/4 text-center">Qty</span>
              <span className="w-1/4 text-right">Amt</span>
            </div>
            
            <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

            <div className="min-h-[150px] max-h-[400px] overflow-y-auto mb-4">
              {billItems.length === 0 ? (
                <p className="text-center text-gray-400 italic mt-10">Scan or click items to add...</p>
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
                className={`w-full py-3 text-white font-bold rounded transition-colors ${billItems.length > 0 ? 'bg-gray-900 hover:bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
                onClick={handlePrintBill}
                disabled={billItems.length === 0}
              >
                PRINT BILL & CHECKOUT
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