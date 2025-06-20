// ServiceForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './rolestyling.css'; // Assuming you use external CSS

const ServiceForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/roles/addRole`, formData);
      console.log('Service created:', response.data);
      alert('Role added Successfully');
      setFormData({ name: '', description: '' });
      if (onClose) onClose(); // Close after successful submission
      
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Adding role Failed!!');
    }
  };

  return (
    <div className='add-role'>
      <div className="add-role-form">
        <button className="close-button" onClick={onClose}><FaTimes /></button>
        <h2>Add New Role</h2>
        <form onSubmit={handleSubmit}>
          <div className='loginsignup-fields'>
            <div className='flex-container'>
              <div className='left'>
                <label>Role Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className='right'>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />
              </div>
            </div>
          </div>
          <button type="submit">Add Role</button>
        </form>
      </div>
         <ToastContainer />
    </div>
  );
};

export default ServiceForm;
