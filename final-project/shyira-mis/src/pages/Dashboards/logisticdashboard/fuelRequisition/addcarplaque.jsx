import React, { useState } from 'react';
import Swal from 'sweetalert2'; 
import './registercar.css'
import '../addItem/additem.css'
function CarRegistrationForm() {
  const [formData, setFormData] = useState({
    registerNumber: '',
    modeOfVehicle: '',
    dateOfReception: '',
    depart: '',
    destination:'',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/forms-data/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        Swal.fire ({
          title: 'Success!',
          text: 'Car registered successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
       
        setFormData({
          registerNumber: '',
          modeOfVehicle: '',
          dateOfReception: '',
          depart: '',
          destination:'',
        });
      } else {
        Swal.fire ({
          title: 'Error!',
          text: 'Failed to register car',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
       
      
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while registering the car.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='addcar'>
      <div >
        <label>Register Number (Plaque):</label>
        <input
          type="text"
          name="registerNumber"
          value={formData.registerNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Mode of Vehicle:</label>
        <input
          type="text"
          name="modeOfVehicle"
          value={formData.modeOfVehicle}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Date of Reception:</label>
        <input
          type="date"
          name="dateOfReception"
          value={formData.dateOfReception}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Depart:</label>
        <input
          type="text"
          name="depart"
          value={formData.depart}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Destination:</label>
        <input
          type="text"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Register Car</button>
    </form>
  );
}

export default CarRegistrationForm;
