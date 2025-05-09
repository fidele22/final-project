import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './stylingpages/Forgetpassword.css'; // Import CSS for styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // New state for message type

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/forgot-password`, { email });
      Swal.fire ({
        title: 'Success!',
        text: 'Reset password link successful sent to your email',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });// Set message type to success
    } catch (error) {
      console.error(error);
      
      Swal.fire ({
        title: 'Error!',
        text: 'Error of sending reset link',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
    }
  };

  return (
    <div className="forget-password-container">
      <h1>Forgot Password</h1>
      <label htmlFor="">Enter your login email address to receive a password reset link</label>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Get Reset Link</button>
      </form>
      {message && (
        <p className={messageType === 'success' ? 'success-message' : 'error-message'}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;