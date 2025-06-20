import React from 'react';
import './cardatacard.css';

const CarCard = ({ car, onEdit }) => {
  return (
    <div className="car-card">
      <h3>{car.registerNumber}</h3>
      <p><strong>Kilometers:</strong> {car.kilometersCovered}</p>
      <p><strong>Remaining Liters:</strong> {car.remainingLiters}</p>
      <p><strong>Registered On:</strong> {new Date(car.createdAt).toLocaleDateString()}</p>
      <button style={{backgroundColor:'rgb(124, 123, 123)'}} onClick={() => onEdit(car)}>Edit</button>
    </div>
  );
};

export default CarCard;
