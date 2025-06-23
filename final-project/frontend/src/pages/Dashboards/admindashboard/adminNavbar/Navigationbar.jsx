import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { FaHome, FaUser , FaList, FaClipboardList, FaBurn, FaWarehouse,
  FaCog,FaCubes } from 'react-icons/fa';
import './Navigationbar.css';

const Navbar = ({ currentPage, setCurrentPage, isMenuOpen, setIsMenuOpen }) => {
  const navbarRef = useRef(null);


  const handleLinkClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false); // Close the navbar
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsMenuOpen]);

 return (
    <div ref={navbarRef} className={`adminavbar ${isMenuOpen ? 'open' : ''}`}>
      <div className="nav-logo"></div>

      <ul>
        <li 
          className={currentPage === 'adminoverview' ? 'active' : ''}
          onClick={() => handleLinkClick('adminoverview')}
        >
          <FaHome /><span></span>Overview
        </li>
        <li 
          className={currentPage === 'view-Users' ? 'active' : ''}
          onClick={() => handleLinkClick('view-Users')}
        >
          <FaUser /><span></span> Users
        </li>
        <li 
          className={currentPage === 'user-roles' ? 'active' : ''}
          onClick={() => handleLinkClick('user-roles')}
        >
          <FaHome /><span></span>User Roles
        </li>
        <li 
          className={currentPage === 'view-service' ? 'active' : ''}
          onClick={() => handleLinkClick('view-service')}
        >
          <FaList /><span></span>Services
        </li>
        <li 
          className={currentPage === 'view-position' ? 'active' : ''}
          onClick={() => handleLinkClick('view-position')}
        >
          <FaClipboardList /><span></span>Positions
        </li>
        <li 
          className={currentPage === 'view-department' ? 'active' : ''}
          onClick={() => handleLinkClick('view-department')}
        >
          <FaBurn /><span></span>Departments
        </li>
        <li 
          className={currentPage === 'item-truck' ? 'active' : ''}
          onClick={() => handleLinkClick('item-truck')}
        >
          <FaWarehouse /> <span></span> Item truck
        </li>
        <li 
          className={currentPage === 'monthly-cardata' ? 'active' : ''}
          onClick={() => handleLinkClick('monthly-cardata')}
        >
          <FaCubes /> <span></span> Monthly car info
        </li>
      </ul>

   {/* Settings link at the bottom */}
    <div className="nav-bottom">
      <ul>
        <li 
          className={currentPage === 'settings' ? 'active' : ''}
          onClick={() => handleLinkClick('settings')}
        >
          <FaCog  size={20}/><span></span> Settings
        </li>
      </ul>
    </div>
    </div>
  );
};


export default Navbar;