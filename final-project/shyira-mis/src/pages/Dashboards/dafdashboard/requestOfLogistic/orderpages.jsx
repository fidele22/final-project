import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ViewOrder from './ItemLogisticRequestStatus'; 
import PendingOrder from './pendingitemrequisition';

//import ItemRequisitionStatus from './RequisitionStatus';


const LogisticOrder = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="links">
   
      <button className='view-requisition' onClick={() => setActiveComponent('pendingitemorder')} >
          <FaEye /> veiw pending requisitions
        </button>
      <button className='view-requisition' onClick={() => setActiveComponent('viewOrder')} >
          <FaEye /> View item requisition status
      </button>
            
       
       
      </div>

      {activeComponent === 'viewOrder' ? (
        <ViewOrder />
      )  : activeComponent === 'pendingitemorder' ? (
        <PendingOrder />
      )  :(
        <div>
    <p>Navigate to what you want to look.</p>
        </div>
      )}

    </div>
  );
};

export default LogisticOrder;

