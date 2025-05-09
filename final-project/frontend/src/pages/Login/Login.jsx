import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FaLock, FaEnvelope,FaEye, FaEyeSlash } from 'react-icons/fa'; 
import axios from 'axios';
import './login.css'; // Adjust your CSS file path

const LoginPage = ({ onSwitchToSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false); // State to track whether it's sign-up or sign-in
  
  const handleSignUpClick = () => {
    setIsSignUp(true);
  };

  const handleSignInClick = () => {
    setIsSignUp(false);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // Add state for password visibility toggle
const [showPassword, setShowPassword] = useState(false);

// Toggle function
const togglePasswordVisibility = () => {
  setShowPassword(!showPassword);
};

  const navigate = useNavigate();

  const validateLoginForm = () => {
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (password.length < 1) {
      newErrors.password = 'Password required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {

    e.preventDefault();
  
    if (validateLoginForm()) {
  
      try {
  
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/login`, { email, password });
  
        console.log('Login response:', res.data); // Check what is returned
  
          // Set login status to true

          setIsLoggedIn(true);

          document.body.classList.add('logged-in'); // Add class to body
  
        const { token, role, privileges } = res.data; // Destructure privileges from response
  
  
        // Generate a unique key for the current tab
  
        const tabId = Date.now() + Math.random().toString(36);
  
  
        // Save the token in sessionStorage
  
        sessionStorage.setItem(`token_${tabId}`, token);
  
        
  
        // Save the privileges in sessionStorage
  
        sessionStorage.setItem(`privileges_${tabId}`, JSON.stringify(privileges)); // Store privileges as a string
  
        
  
        // Save the tab ID for reference in other parts of the app
  
        sessionStorage.setItem('currentTab', tabId);
  
        // Redirect to the appropriate dashboard based on role
        if (role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (role === 'LOGISTIC') {
          navigate('/LOGISTIC');
        } else if (role === 'ACCOUNTANT') {
          navigate('/ACCOUNTANT');
        } else if (role === 'DAF') {
          navigate('/DAF');
        } else if (role === 'DG') {
          navigate('/DG');
        } else if (role === 'HOD') {
          navigate('/HOD');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Invalid email or password');
      }
    }
  };

  return (
    <div className="form-container">
  <div className="login">

  
      <form onSubmit={handleSubmit}>
      <div className="overlay-container">
        
          <div className="overlay-left">
            <h2>Welcome Back to LEMS</h2>
            <p>To keep connected with us, please login with your personal credentials </p> <hr />
         
          </div>
          <div className="overlay-right">
          <img src="/image/lems.png" alt="" />
         
    
        </div>
      </div>
        <h1>User Login</h1>
        <div class="input-container ">
        <span className={`password-email-icon ${errors.password ? "password-email-icon-error" : ""}`}>
    {/* <FaEnvelope /> */}
  </span>
<input  type="email" class="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder=" Email address" />

{errors.email && <p className="error">{errors.email}</p>}

</div>
<div class="input-container">
  {/* Lock icon on the left */}
  <span className={`password-lock-icon ${errors.password ? "password-lock-icon-error" : ""}`}>
    {/* <FaLock /> */}
  </span>
<input type={showPassword ? 'email' : 'password'} class="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

<span onClick={togglePasswordVisibility} className={`password-view-login ${errors.password ? "password-view-login-error" : ""}`}>

    {showPassword ? <FaEyeSlash /> : <FaEye />}

</span>

{errors.password && <p className="error">{errors.password}</p>}
<p ><a href="/forgot-password">Forgot your password?</a></p>
</div>

 <div className='login-btn-section'>

 <button className="login-btn">Login</button>
        <p>If you don't have an account? <span onClick={onSwitchToSignUp}>Sign Up</span></p>
 </div>

      </form>
    </div>
    </div>
  );
};

export default LoginPage;