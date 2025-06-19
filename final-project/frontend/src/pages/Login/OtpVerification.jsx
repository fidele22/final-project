// src/components/VerifyOTP.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import './OtpVerification.css';

const VerifyOTP = () => {
  const [otp, setOTP] = useState(new Array(6).fill(''));
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

 const handleChange = (element, index) => {
  const value = element.value.replace(/[^0-9]/g, '');
  if (value) {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOTP(newOtp);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  }
};

const handleKeyDown = (e, index) => {
  if (e.key === 'Backspace') {
    e.preventDefault(); // Prevent default behavior
    const newOtp = [...otp];

    // If current box is not empty, just clear it
    if (otp[index]) {
      newOtp[index] = '';
      setOTP(newOtp);
    } else if (index > 0) {
      // Move to previous box and clear it
      newOtp[index - 1] = '';
      setOTP(newOtp);

      const prevInput = e.target.parentNode.children[index - 1];
      prevInput.focus();
    }
  }
};

  const handleOTPVerification = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/profile/verify-2fa`, {
        email,
        code: otp.join(''),

      });
      // Proceed with login
        const { token, role, privileges } = res.data;
        const tabId = Date.now() + Math.random().toString(36);

        sessionStorage.setItem(`token_${tabId}`, token);
        sessionStorage.setItem(`privileges_${tabId}`, JSON.stringify(privileges));
        sessionStorage.setItem('currentTab', tabId);

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
     toast.error('Invalid or expired OTP');
    }
  };

  if (!email) {
    navigate('/');
    return null;
  }

  
  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify Your Identity</h2>
        <p>Protecting your account is our priority. Please confirm your identity by providing the code sent to your email address</p>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
      <input
      key={index}
      type="text"
      maxLength="1"
      value={digit}
      onChange={(e) => handleChange(e.target, index)}
      onKeyDown={(e) => handleKeyDown(e, index)}
      className="otp-box"
    />
    
          ))}
        </div>
              <>
          {/* Your JSX content */}
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </> 
        <div className="verify-buttons">
          <button className="cancel-btn" onClick={() => navigate('/')}>Cancel</button>
          <button className='verify-btn' onClick={handleOTPVerification}>Verify OTP</button>
        </div>
        <p className="info-text">
          It may take a minute to receive verification message. Haven’t received it yet? <span className="resend-link">Resend</span>
        </p>
      </div>
    </div>
    
  );
};

export default VerifyOTP;
