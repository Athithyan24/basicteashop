import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom'

const LoginPage=()=>{
    const [username, setusername]=useState('');
    const [password, setpassword]=useState('');
    const [error, setError]=useState('');
    const [isloading, setisloading]=useState(false);
    const navigate =useNavigate();

    const handleLoading=async(e)=>{
        e.preventDefault();
        setError('');
        setisloading(true);

        try{
            const response = await fetch('http://localhost:5000/backend/server',{method:'POST',
                headers:{
                'Content-Type':'application/json',
            },body:JSON.stringify({username, password})
        });

      const data = await response.json();

      if (response.ok) {

        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        navigate('/admin'); 
      } else {

        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {

      setError('Something went wrong. Please try again later.');
    } finally {
      setisloading(false); 
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
        <h2>powered by</h2>
        <h1>InfoZenX IT</h1>
      <h2>Login</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleLoading}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setusername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isloading}
          style={{ width: '100%', padding: '10px', cursor: isloading ? 'not-allowed' : 'pointer' }}
        >
          {isloading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;