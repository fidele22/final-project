import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaSpinner, FaCheckCircle, FaBars, FaTimes } from 'react-icons/fa';
import MakeRequistFuel from './fuelrequest'; 
import ViewfuelStatus from './fuelrequeststatus';
import ReceivedDecision from './fuelapprovedrequest';
import '../contentCss/requisitionPageLinks.css';

const UserFuelRequesition = () => {
  const [activeComponent, setActiveComponent] = useState('MakeRequisition'); // Default active component
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  // Custom hook to detect clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };

  const handleNavigation = (component) => {
    setActiveComponent(component);
    setIsDropdownOpen(false); // Close dropdown when a link is clicked
  };

  return (
    <div className="requistion">
      <div className="fuel-request-links" ref={dropdownRef}>
        <div className="dropdown-toggle" onClick={toggleDropdown}>
          {isDropdownOpen ? <FaTimes /> : <FaBars />} {/* Change icon based on visibility */}
          <span>Menu</span>
        </div>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            
            <button className='view-requisition' onClick={() => handleNavigation('MakeRequisition')}>
              <FaEye /> Make Requisition for fuel
            </button>
            
            <button className='make-fuel-order' onClick={() => handleNavigation('fuel-request-status')}>
              <FaSpinner color='brown' /> Fuel Requisition Status
            </button>

            <button className='recieved-item' onClick={() => handleNavigation('approved-requisition')}>
              <FaCheckCircle color='green' /> Approved requisition
            </button>
          </div>
        )}
      </div>

      {activeComponent === 'MakeRequisition' ? (
        <MakeRequistFuel />
      ) : activeComponent === 'fuel-request-status' ? (
        <ViewfuelStatus />
      ) : activeComponent === 'approved-requisition' ? (
        <ReceivedDecision />
      ) : (
        <div>
          <p>Navigate to what you want to look.</p>
        </div>
      )}
    </div>
  );
};

export default UserFuelRequesition;