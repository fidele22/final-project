import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ApprovedRequest from '../../logisticdashboard/UserRequisitions/approvedRequest'; 
import RecievedRequest from '../../logisticdashboard/receivedRequisitions/itemRequestReceived';
import RejectedRequest from '../../logisticdashboard/receivedRequisitions/ItemRequestRejected'
//import RejectedOrder from '../requestDecision/rejectedRequisition'
//import ItemRequisitionStatus from './RequisitionStatus';


const UserRequesition = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('approved-requisition')} >
          <FaEye /> Approved requisition
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('recieved-requisition')}>
          <FaSpinner color='brown'/> Recieved Requisition
        </button>

        <button className='recieved-item' onClick={() => setActiveComponent('rejected-requisition')}>
          <FaTimesCircle color='red'/>  Rejected Requisition
        </button>
       
      </div>

      {activeComponent === 'approved-requisition' ? (
        <ApprovedRequest />
      ) : activeComponent === 'recieved-requisition' ? (
        <RecievedRequest />
      )  : activeComponent === 'rejected-requisition' ? (
        <RejectedRequest />
      )  :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default UserRequesition;

