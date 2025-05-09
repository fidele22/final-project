import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import VeiwfuelRequisition from './viewfuelRequest'; 
import FuelRequisitionRecieved from '../../dafdashboard/UserfuelRequest/recieveduserfuelRequest';
import FuelRequisitionapproved from  './approvedUserFuelRequest'; 
import FuelRequisitionRejected from '../../DGdashboard/userfuelRequisition/rejecteduserfuelrequest'
//import ItemRequisitionStatus from './RequisitionStatus';


const UserFuelRequesition = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('view')}>
          <FaEye /> View Fuel Requisition
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('approved')}>
          <FaSpinner color='brown'/> Fuel Requisition approved
        </button>

        <button className='recieved-item' onClick={() => setActiveComponent('recieved')}>
          <FaCheckCircle color='green'/> Fuel requisition Recieved
        </button>

        <button className='recieved-item' onClick={() => setActiveComponent('rejected')}>
          <FaTimesCircle color='red'/> Fuel Rejected
        </button>
       
      </div>

      {activeComponent === 'view' ? (
        <VeiwfuelRequisition />
      ) : activeComponent === 'approved' ? (
        <FuelRequisitionapproved />
      )  : activeComponent === 'recieved' ? (
        <FuelRequisitionRecieved />
      )  : activeComponent === 'rejected' ? (
        <FuelRequisitionRejected />
      )  :(
        <div>
        <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default UserFuelRequesition;

