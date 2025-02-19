import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import VeiwfuelRequisition from './viewfuelRequest'; 
import FuelRequisitionStatus from './fuelRequisitionStatus';


const UserFuelRequesition = () => {

  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
        <button className='make-fuel-order' onClick={() => setActiveComponent('fuel-approved-request')}>
          <FaSpinner color='brown'/> Fuel Requisition status
        </button>
        
        <button className='view-requisition' onClick={() => setActiveComponent('view')}>
          <FaEye /> View Fuel Requisition
        </button>
        
       
      </div>

      {activeComponent === 'view' ? (
        <VeiwfuelRequisition />
      ) : activeComponent === 'fuel-approved-request' ? (
        <FuelRequisitionStatus />
      ) :(
        <div>
    <FuelRequisitionStatus />
        </div>
      )}

    </div>
  );
};

export default UserFuelRequesition;

