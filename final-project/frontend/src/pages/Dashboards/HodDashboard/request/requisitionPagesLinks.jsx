import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaSpinner, FaCheckCircle, FaBars, FaTimes } from 'react-icons/fa';
import MakeRequisition from './MakeRequist'; 
import ViewStatus from './itemRequisitionStatus';
import ApprovedRequisition from './approvedRequisition';
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

  const handleNavigation = (page) => {
    setActiveComponent(page);
    setIsDropdownOpen(false); // Close dropdown when a link is clicked
  };

  return (
    <div className="requistion">
      <div className="hodlinks" ref={dropdownRef}>
        <div className="link-button" onClick={toggleDropdown}>
          <div className="link-icon">
            {isDropdownOpen ? <FaTimes size={30} /> : <FaBars size={30} />} {/* Change icon based on visibility */}
            <button className="view-requisition">Menu</button>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div 
              className={`link-button ${activeComponent === 'MakeRequisition' ? 'active-button' : ''}`} 
              onClick={() => handleNavigation('MakeRequisition')}
            >
              <div className="link-icon">
                <FaPlus size={30} />
                <button className="view-requisition">Make Requisition</button>
              </div>
            </div>

            <div 
              className={`link-button ${activeComponent === 'status' ? 'active-button' : ''}`} 
              onClick={() => handleNavigation('status')}
            >
              <div className="link-icon">
                <FaSpinner color='brown' size={30} />
                <button className="make-fuel-order">View Requisition Status</button>
              </div>
            </div>

            <div 
              className={`link-button ${activeComponent === 'approved-requisition' ? 'active-button' : ''}`} 
              onClick={() => handleNavigation('approved-requisition')}
            >
              <div className="link-icon">
                <FaCheckCircle color='green' size={30} />
                <button className="recieved-item">Approved Requisition</button>
              </div>
            </div>
          </div>
        )}
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