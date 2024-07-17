import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './Auth.css';

const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send request to your backend to create session
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: user.uid }),
        credentials: 'include'  // Important for sending cookies
      });

      if (response.ok) {
        login(); // Simply set the authenticated state
        alert('User logged in successfully');
        navigate('/app');
      } else {
        const errorData = await response.json();
        console.error('Error logging in', errorData);
        alert('Error logging in: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error logging in', error);
      alert('Error logging in');
    }
  };




  return (
    <div className="auth-root">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor="username">Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className='auth-button' type="submit">Login</button>
        </form>
        <p className='auth-p'>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
