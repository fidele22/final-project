// Notification.js
import { useState,React,useEffect } from 'react';
import './notification.css'; // Create a CSS file for styling

const Notification = ({ message, onClose,type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close after 3 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
    {message}
  </div>
  );
};

export default Notification;
