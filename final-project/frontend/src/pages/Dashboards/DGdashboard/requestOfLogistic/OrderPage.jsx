import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle,
   FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import VerifiedOrder from './verifiedLogisticRequest'; 
import Orderstatus from '../../dafdashboard/requestOfLogistic/ItemLogisticRequestStatus';





const UserFuelRequesition = () => {


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('verifiedOrder')} >
          <FaEye /> Verified requisition
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('Orderstatus')}>
          <FaSpinner color='brown'/> requisition status
        </button>
       
      </div>

      {activeComponent === 'verifiedOrder' ? (
        <VerifiedOrder />
      ) : activeComponent === 'Orderstatus' ? (
        <Orderstatus />
      ) :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default UserFuelRequesition;

