// src/CarForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './carformdata.css'
const CarForm = () => {
  const [carOptions, setCarOptions] = useState([]);
  const [carPlaque, setCarPlaque] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [remainingLiters, setRemainingLiters] = useState('');

  const fetchOptions = async () => {
    try {
      const carResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/forms-data/cars`);
      setCarOptions(carResponse.data);
    } catch (error) {
      console.error("Error fetching car options:", error);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCarData = { registerNumber: carPlaque, kilometersCovered: kilometers, remainingLiters: remainingLiters };
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/save-data`, newCarData);
      alert('Car kilometer covered and remaining liters saved');
      console.log('Car data submitted:', newCarData);
  
      // Clear the form after successful submission
      setCarPlaque('');
      setKilometers('');
      setRemainingLiters('');
  
    } catch (error) {
      // Handle error response from the backend
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Show the error message from the backend
      } else {
        alert('Error saving car kilometer covered and remaining liters');
      }
      console.error("Error submitting:", error);
    }
  };

  return (
    <div className="form-car">

   
    <form onSubmit={handleSubmit}>
    <div className="form-group"> 
        <label htmlFor="carPlaque">Plaque of Car:</label> 
        <select id="carPlaque" value={carPlaque} 
        onChange={(e) => setCarPlaque(e.target.value)} required > 

        <option value="">Select Plaque</option> 
        {carOptions.map((car) => (<option key={car._id} value={car.registerNumber}> 
            {car.registerNumber} </option> ))} 
            </select> 
    </div>

      <div>
        <label htmlFor="kilometers">Kilometers Covered:</label>
        <input
          type="number"
          id="kilometers"
          value={kilometers}
          onChange={(e) => setKilometers(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="remainingliters">Remaining Liters:</label>
        <input
          type="number"
          id="remainingliters"
          value={remainingLiters}
          onChange={(e) => setRemainingLiters(e.target.value)}
          required
        />
      </div>

      <button type="submit">Submit</button>
    </form>
    </div>
  );
};

export default CarForm;