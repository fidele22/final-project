import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye , FaEdit,FaSpinner, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import UserFuelRequest from './userFuelRequisition'; 
import UserItemRequest from './userItemRequisition';



const UserRequesition = () => {

  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components

  return (
    <div className="requistion">
      <div className="logistic-navigate-buttons">
      <button className='view--item-requisition' onClick={() => setActiveComponent('item-requisition')} >
          <FaEye /> Item requisitions
        </button>
        
        <button className='make-fuel-order' onClick={() => setActiveComponent('fuel-requisitions')}>
          <FaSpinner color='brown'/> Fuel Requisitions
        </button>

       
      </div>

      {activeComponent === 'fuel-requisitions' ? (
        <UserFuelRequest />
      ) : activeComponent === 'item-requisition' ? (
        <UserItemRequest />
      )  :(
        <div>
        <UserItemRequest />
        </div>
      )}

    </div>
  );
};

export default UserRequesition;

