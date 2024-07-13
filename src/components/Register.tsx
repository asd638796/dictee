import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjust the path as needed

const Register = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User registered successfully');
      navigate('/login');
    } catch (error) {
        console.error('Error registering user', error);
        alert('Error registering user');
    }


  };

  return (
    <div className="auth-root">
      <div className="auth-container">
        <h2>Register</h2>
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
          <div className='form-group'>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button className='auth-button' type="submit">Register</button>
        </form>
        <p className='auth-p'>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
