import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");
  const [isloading, setisloading] = useState(false);
  const navigate = useNavigate();

  // REMOVED: useEffect and fetchallItems. You do not need to fetch inventory before logging in!

  const handleLoading = async (e) => {
    e.preventDefault();
    setError("");
    setisloading(true);

    try {
      const response = await fetch("http://localhost:5000/backend/server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("username", data.username);
          
          // ADDED: This fixes the "undefined" shoptype issue on the admin pages!
          localStorage.setItem("shoptype", data.shoptype); 
        }
        navigate("/admin");
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your server.");
    } finally {
      setisloading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="p-50">
        <div className="bg-amber-200 lg:mx-100 p-10 py-20 rounded-4xl shadow-2xl ">
          <div className="flex-col ">
            <div className="flex justify-center">
              <div className="mb-10 text-center">
                <h2 className="text-sm font-sans">powered by</h2>
                <h1 className="text-4xl font-semibold">InfoZenX IT</h1>
              </div>
            </div>

            <div className="flex justify-center">
              <h2 className="text-2xl font-semibold mb-6">Login</h2>
            </div>
          </div>

          {error && (
            <div className="text-center font-bold" style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLoading}>
            <div style={{ marginBottom: "15px" }}>
              <label
                className="font-sans font-semibold text-gray-800"
                htmlFor="username"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Username:
              </label>
              <input
                className="hover:scale-101 hover:shadow-lg shadow-inner hover:bg-amber-100 duration-200 rounded-xl border border-orange-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                type="text"
                id="username"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                className="font-sans font-semibold text-gray-800"
                htmlFor="password"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Password:
              </label>
              <input
                className="hover:scale-101 hover:shadow-lg shadow-inner hover:bg-amber-100 duration-200 rounded-xl border border-orange-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>

            <div className="flex justify-center items-center">
              <button
                className="bg-green-600 text-white font-bold px-8 py-2 rounded-3xl hover:scale-110 duration-200 hover:bg-green-700 shadow-md"
                type="submit"
                disabled={isloading}
                style={{
                  cursor: isloading ? "not-allowed" : "pointer",
                }}
              >
                {isloading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;