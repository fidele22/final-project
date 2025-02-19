import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ViewVerifiedRequisition from './ViewRequisition'; 
import ItemRequisitionStatus from '../../logisticdashboard/UserRequisitions/itemRequestStatus';



const UserRequisitionItem = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
      <button className='view-requisition' onClick={() => setActiveComponent('VerifiedItemRequisition')} >
          <FaEye /> Verified requisition
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('ItemRequisitionstatus')}>
          <FaSpinner color='brown'/> Item Requisition status
        </button>
       
      </div>

      {activeComponent === 'VerifiedItemRequisition' ? (
        <ViewVerifiedRequisition />
      )  : activeComponent === 'ItemRequisitionstatus' ? (
        <ItemRequisitionStatus />
      ) :(
        <div>
     <ItemRequisitionStatus />
        </div>
      )}

    </div>
  );
};

export default UserRequisitionItem;

