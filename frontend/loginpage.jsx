import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");
  const [isloading, setisloading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    fetchallItems()
  },[])

  const fetchallItems=async()=>{
    try{
      const response=await fetch("http://localhost:5000/backend/server")
      const data = response.json();
      setInventory(data);
    }
    catch(error){
      console.error({message:"failed to fetch Data"}, error)
    }
  }

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
          localStorage.setItem("username", username);
        }
        navigate("/admin");
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setisloading(false);
    }
  };

  return (
    <div className="bg-amber-200 mx-120 my-20">
    <div
    className="p-50 "
  
    >
      <div className="flex-col flex">
      <div className="justify-center content-center mb-10">
        
      <h2 className="text-sm font-sans">powered by</h2>
      <h1 className="text-4xl font-semibold">InfoZenX IT</h1>
      </div>

      <div className="flex justify-center">
      <h2 className="text-2xl font-semibold">Login</h2>
      </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <form onSubmit={handleLoading}>
        <div style={{ marginBottom: "15px" }}>
          <label
            className="font-sans"
            htmlFor="username"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Username:
          </label>
          <input
            className="rounded-4xl border "
            type="text"
            id="username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            className="font-sans"
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Password:
          </label>
          <input
          className="border rounded-4xl "
            type="password"
            id="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div className="flex justify-center items-center">
        <button
         className="bg-green-500 px-5 rounded-3xl py-1"
          type="submit"
          disabled={isloading}
          style={{
            cursor: isloading ? "not-allowed" : "pointer",
          }}
        >
          {isloading ? "Logging in..." : "Login"}
        </button></div>
      </form>
    </div>
    </div>
  );
};

export default LoginPage;