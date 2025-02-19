import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ViewFuelOrder from './pendingfuelOrder'; 
import FuelOrderStatus from '../../logisticdashboard/OrderSupply/fuelOrderstatus';




const LogisticFuelOrder = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('viewFuelOrder')} >
          <FaEye /> View logistic fuel requisition
        </button>
  
        <button className='make-fuel-order' onClick={() => setActiveComponent('FuelOrderstatus')}>
          <FaSpinner color='brown'/> Logistic fuel requisition status
        </button>

        
       
      </div>

      {activeComponent === 'viewFuelOrder' ? (
        <ViewFuelOrder />
      )  : activeComponent === 'FuelOrderstatus' ? (
        <FuelOrderStatus />

      )   :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default LogisticFuelOrder;

