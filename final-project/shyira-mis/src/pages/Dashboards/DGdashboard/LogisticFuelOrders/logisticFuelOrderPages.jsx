import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ViewFuelOrderStatus from '../../logisticdashboard/OrderSupply/fuelOrderstatus'; 
import VerifiedFuelOrder from './verifiedFuelOrder';
import RejectedFuelOrder from './rejectedfuelorder';



const LogisticFuelOrder = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('verifiedFuelOrder')} >
          <FaEye /> Verified logistic fuel requisition
        </button>

      <button className='view-requisition' onClick={() => setActiveComponent('viewFuelOrder')} >
          <FaEye /> logistic fuel requisition status
        </button>
        
    
       
      </div>

      {activeComponent === 'viewFuelOrder' ? (
        <ViewFuelOrderStatus />
      )  : activeComponent === 'verifiedFuelOrder' ? (
        <VerifiedFuelOrder />
      )  : activeComponent === 'rejectedFuelorder' ? (
        <RejectedFuelOrder />

      )   :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default LogisticFuelOrder;

