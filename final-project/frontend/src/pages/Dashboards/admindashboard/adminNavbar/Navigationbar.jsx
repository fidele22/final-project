import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { FaHome, FaUser , FaList, FaClipboardList, FaBurn, FaSignOutAlt } from 'react-icons/fa';
import './Navigationbar.css';

const Navbar = ({ setCurrentPage, isMenuOpen, setIsMenuOpen }) => {
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
     <div className="nav-logo">
      <h1>Lmis</h1>
      </div>
      <ul>
        <li onClick={() => handleLinkClick('adminoverview')}><FaHome /> Overview</li>
        <li onClick={() => handleLinkClick('view-Users')}><FaUser  /> Users</li>
        <li onClick={() => handleLinkClick('user-roles')}><FaHome /> User Roles</li>
        <li onClick={() => handleLinkClick('view-service')}><FaList /> Services</li>
        <li onClick={() => handleLinkClick('view-position')}><FaClipboardList /> Positions</li>
        <li onClick={() => handleLinkClick('view-department')}><FaBurn /> Departments</li>
      </ul>

      <h2>Settings</h2>
      <ul>
        <li onClick={() => handleLinkClick('user-profile')}><FaUser  /> Profile</li>
        <li onClick={() => handleLinkClick('help-center')}><FaBurn /> Help Center</li>
        
      </ul>
    </div>
  );
};

export default Navbar;