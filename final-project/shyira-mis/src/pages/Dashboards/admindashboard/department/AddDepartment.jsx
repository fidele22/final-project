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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/departments/addDepart`, formData);
      console.log('Department created:', response.data);
      alert('Department added Successfuly')
      setFormData({ name: '', description: '' }); // Clear form after submission
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Adding Department Failed!!')
    }
  };

  return (
    <div className='add-service'>
     
      <div className="add-service-form">
      <h2>Add New Department</h2>
      <form onSubmit={handleSubmit}>
      <div className='loginsignup-fields'>
            <div className='flex-container'>
              <div className='left'>
                <label>Department Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className='right'>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />
              </div>
             </div>
            </div>
        <button type="submit">Add Department</button>
      </form>
      </div>
      
    </div>
  );
};

export default ServiceForm;
