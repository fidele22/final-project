import React, { useState } from 'react';
import { FaHome, FaPlus, FaFileExcel,FaTrash , FaList, FaBoxOpen, FaClipboardCheck, 
  FaClipboardList, FaChartBar, FaUser, FaSignOutAlt,FaLifeRing ,FaGasPump } from 'react-icons/fa';
import './Dafnavigationbar.css';
import axios from 'axios';

const Navbar = ({ setCurrentPage }) => {
  const [dropdownsOpen, setDropdownsOpen] = useState({
    request: false,
    requisitions: false,
    fuelrequest:false,
    userRequest:false
  });

  const toggleDropdown = (dropdownName) => {
    setDropdownsOpen((prevState) => ({
      ...prevState,
      [dropdownName]: !prevState[dropdownName],
    }));
  };



  return (
    <div className="navigation">
     <div className="nav-logo">
      <h1>Lmis</h1>
      </div>
      <ul>
        <li onClick={() => setCurrentPage('overview')}><FaHome /> Overview</li>
        <li onClick={() => setCurrentPage('view-stock-items')}> <FaList /> stock Items</li>
        <li onClick={() => setCurrentPage('view-logistic-request')}><FaClipboardList /> Logistic Item requisition</li>
        <li onClick={() => setCurrentPage('fuel-logistic-request')}><FaGasPump /> Logistic Fuel requisition</li>
        <li onClick={() => setCurrentPage('repair-logistic-request')}><FaGasPump /> Logistic Repair requisition</li>
        <li onClick={() => setCurrentPage('user-request')}><FaBoxOpen />User itemrequisition</li>
        <li onClick={() => setCurrentPage('fuel-requisition')}><FaClipboardCheck /> User Fuel Requisition </li>
      </ul>
      
      <u><h2>Settings</h2></u>
      <ul>
        <li onClick={() => setCurrentPage('user-profile')}>< FaUser /> Profile</li>
        <li onClick={() => setCurrentPage('help-center')}> <FaLifeRing />Help Center</li>
      
      </ul>
    </div>
  );
};

export default Navbar;
