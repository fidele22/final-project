import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import RepairOrder from './repairRequisition';
import ApprovedRepairOrder  from './repairRequisitionApproved';




const LogisticFuelOrder = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); 

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('viewRepairOrder')} >
          <FaEye /> repair requisitions
        </button>
   
        <button className='make-fuel-order' onClick={() => setActiveComponent('verifiedRepairOrder')}>
          <FaSpinner color='brown'/> Approved repair requisition
        </button>

        <button className='recieved-item' onClick={() => setActiveComponent('recievedFuelorder')}>
          <FaCheckCircle color='green'/> Rejected repair requisition
        </button> 
      </div>

      {activeComponent === 'viewRepairOrder' ? (
        <RepairOrder/>
      )  : activeComponent === 'verifiedRepairOrder' ? (
        <ApprovedRepairOrder />
      )  : activeComponent === 'approvedFuelOrder' ? (
        <ApprovedRepairOrder />
      ) :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default LogisticFuelOrder;

