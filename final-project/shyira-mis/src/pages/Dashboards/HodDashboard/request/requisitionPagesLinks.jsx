import React, { useState } from 'react';
import { FaPlus, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import MakeRequisition from './MakeRequist'; 
import ViewStatus from './itemRequisitionStatus';
import ApprovedRequisition from './approvedRequisition';
import '../contentCss/requisitionPageLinks.css';

const UserFuelRequesition = () => {
  const [activeComponent, setActiveComponent] = useState('MakeRequisition'); // Default active

  return (
    <div className="requistion">
      <div className="hodlinks">
        <div 
          className={`link-button ${activeComponent === 'MakeRequisition' ? 'active-button' : ''}`} 
          onClick={() => setActiveComponent('MakeRequisition')}
        >
          <div className="link-icon">
            <FaPlus size={30} />
          
          <button className="view-requisition">Make Requisition</button>
        </div>
        </div>

        <div 
          className={`link-button ${activeComponent === 'status' ? 'active-button' : ''}`} 
          onClick={() => setActiveComponent('status')}
        >
          <div className="link-icon">
            <FaSpinner color='brown' size={30} />
         
          <button className="make-fuel-order">View Requisition Status</button>
          </div>
        </div>

        <div 
          className={`link-button ${activeComponent === 'approved-requisition' ? 'active-button' : ''}`} 
          onClick={() => setActiveComponent('approved-requisition')}
        >
          <div className="link-icon">
            <FaCheckCircle color='green' size={30} />
          
          <button className="recieved-item">Approved Requisition</button>
        </div>
        </div>
      </div>

      {activeComponent === 'MakeRequisition' ? (
        <MakeRequisition />
      ) : activeComponent === 'status' ? (
        <ViewStatus />
      ) : activeComponent === 'approved-requisition' ? (
        <ApprovedRequisition />
      ) : (
        <div>
          <p>Navigate to what you want to look.</p>
        </div>
      )}
    </div>
  );
};

export default UserFuelRequesition;
