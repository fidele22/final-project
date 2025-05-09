import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ViewUserRequistFuel from './fuelRequisitionverified'; 
import UserFuelRequestStatus from '../../logisticdashboard/fuelRequisition/fuelRequisitionStatus';
import RejectedUserFuelRequest from './rejecteduserfuelrequest'
import RecievedUserFuelRequest from './recieveduserfuelRequest'


const UserFuelRequesition = () => {

  
  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="logistic-navigate-buttons">
      <button className='view-requisition' onClick={() => setActiveComponent('MakeRequisition')} >
          <FaEye /> Verified fuel requesition
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('fuel-request-status')}>
          <FaSpinner color='brown'/> user fuel requesition status
        </button>

      </div>

      {activeComponent === 'MakeRequisition' ? (
        <ViewUserRequistFuel />
      ) : activeComponent === 'fuel-request-status' ? (
        <UserFuelRequestStatus />
      ) :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default UserFuelRequesition;

