import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import './Auth.css'

const Register = (): React.JSX.Element => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (

        <div className='auth-container'>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor="password">Password</label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="text"
                        id="confirm-password"
                        name="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;