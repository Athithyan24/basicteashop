import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsicon from "../src/assets/cogwheel.png";

const AdminPage = () => {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);

  const [adminName, setAdminName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!adminName || !newItemName || !newItemPrice) return;

    const newItem = {
      name: newItemName,
      price: parseFloat(newItemPrice),
      quantity: parseInt(newItemQuantity, 10),
    };
    try {
      const response = await fetch("http://localhost:5000/app/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        const SavedItems = await response.json();
        setInventory([...inventory, SavedItems]);

        setNewItemName("");
        setNewItemPrice("");
        setNewItemQuantity(0);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error({ message: "failed to input data" });
    }
  };

  const updateQuantity = async (id, amount) => {
    try {
      const response = await fetch(
        `http://localhost:5000/app/inventory/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        },
      );
      if (response.ok) {
        const updatedItem = await response.json();
        setInventory(
          inventory.map((item) => (item.id === id ? updatedItem : item)),
        );
      }
    } catch (error) {
      console.error({ message: "Failed to update item", error });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="max-w-150 mx-auto my-10 font-sans relative">
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-3 mb-5">
        <div>
          <h1 className="m-0 text-3xl font-bold">{adminName} Dashboard</h1>
          <p className="m-0 text-gray-500">Welcome, InfoZenX Manager</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-transparent border-none text-2xl cursor-pointer hover:scale-110 transition-transform"
            title="Add New Stock Item"
          >
            <img src={settingsicon} className="w-10" alt="Settings" />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3">Current Stock</h3>
      <div className="flex flex-col gap-3">
        {inventory.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center p-3 border border-gray-300 rounded-md shadow-sm"
          >
            <strong className="text-lg w-1/3">{item.name}</strong>

            <div className="flex-1">
              <div className="text-gray-500 text-sm">
                Price: ${Number(item.price || 0).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg font-bold">Qty: {item.quantity}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updateQuantity(item._id, 1)}
                  className="px-3 py-1 text-base border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-100 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-xl font-bold">Add New Stock Item</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-600 border-none text-xl cursor-pointer text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Enter Your Shop Name:
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <label className="block mb-1 text-sm font-medium">
                  Item Name:
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Price ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    Initial Qty:
                  </label>
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="p-2.5 bg-green-500 text-white rounded cursor-pointer text-base mt-2 hover:bg-green-600 transition-colors"
              >
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
