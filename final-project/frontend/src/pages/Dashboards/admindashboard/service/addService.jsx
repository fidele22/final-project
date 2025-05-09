// ServiceForm.js
import React, { useState } from 'react';
import axios from 'axios';

const ServiceForm = () => {
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/services/addService`, formData);
      console.log('Service created:', response.data);
      alert('Service added Successfuly')
      setFormData({ name: '', description: '' }); // Clear form after submission
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Adding Service Failed!!')
    }
  };

  return (
    <div className='add-service'>
      <div className="add-service-form">
      <h2>Add New Service</h2>
      <form onSubmit={handleSubmit}>
      <div className='loginsignup-fields'>
            <div className='flex-container'>
              <div className='left'>
                <label>Service Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className='right'>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}  />
              </div>
             </div>
            </div>
        <button type="submit">Add Service</button>
      </form>
      </div>
      
    </div>
  );
};

export default ServiceForm;
