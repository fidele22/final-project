import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import VeiwUserRequisition from './ViewRequisition'; 
import ItemRequisitionStatus from './itemRequestStatus';


const UserRequesition = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
        <button className='make-fuel-order' onClick={() => setActiveComponent('requisitionStatus')}>
          <FaSpinner color='brown'/> Item Requisition status
        </button>
        <button className='view-requisition' onClick={() => setActiveComponent('view')}>
          <FaEye /> View Requisition
        </button>
     
       
      </div>

      {activeComponent === 'view' ? (
        <VeiwUserRequisition />
      ) : activeComponent === 'requisitionStatus' ? (
        <ItemRequisitionStatus />
      ) :(
        <div>
   <ItemRequisitionStatus />
        </div>
      )}

    </div>
  );
};

export default UserRequesition;

