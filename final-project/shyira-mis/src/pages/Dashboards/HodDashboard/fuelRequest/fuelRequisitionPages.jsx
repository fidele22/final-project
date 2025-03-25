import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import MakeRequistFuel from './fuelrequest'; 
import ViewfuelStatus from './fuelrequeststatus';
import ReceivedDecision from './fuelapprovedrequest';



//import ItemRequisitionStatus from './RequisitionStatus';


const UserFuelRequesition = () => {

  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="fuel-request-links">
      <button className='view-requisition' onClick={() => setActiveComponent('MakeRequisition')} >
          <FaEye /> Make Requisition for fuel
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('fuel-request-status')}>
          <FaSpinner color='brown'/> Fuel Requisition Status
        </button>

        <button className='recieved-item' onClick={() => setActiveComponent('approved-requisition')}>
          <FaCheckCircle color='green'/> Approved requisition
        </button>
       
      </div>

      {activeComponent === 'MakeRequisition' ? (
        <MakeRequistFuel />
      ) : activeComponent === 'fuel-request-status' ? (
        <ViewfuelStatus />
      )  : activeComponent === 'approved-requisition' ? (
        <ReceivedDecision />
      )  :(
        <div>
    <MakeRequistFuel />
        </div>
      )}

    </div>
  );
};

export default UserFuelRequesition;

