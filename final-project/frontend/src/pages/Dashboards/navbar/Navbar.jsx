import React, { useState, useEffect } from 'react';
import { FaUser , FaSignOutAlt, FaChevronDown, FaBars,FaTimes,
FaBell,FaExclamationTriangle

 } from 'react-icons/fa'; // Import FaBars for the toggle icon
import './Navbar.css';
import axios from 'axios';

function TopNavbar({ setCurrentPage, toggleNav,isNavVisible}) {
  const [user, setUser ] = useState({}); // Initialize user as an empty object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const token = sessionStorage.getItem(`token_${tabId}`);
  const [dropdownOpen, setDropdownOpen] = useState(false);

const [lowStockItems, setLowStockItems] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);


useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
      const lowItems = response.data.filter(item => item.quantity < 5);
      setLowStockItems(lowItems);
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
    }
  };

  fetchUser();
  fetchLowStockItems(); // initial fetch

  const intervalId = setInterval(() => {
    fetchLowStockItems(); // auto-refresh every 30 seconds
  }, 30000);

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.user-dropdown') && !event.target.closest('.notification-icon-container')) {
      setDropdownOpen(false);
      setShowNotifications(false);
    }
  };

  document.addEventListener('click', handleOutsideClick);

  return () => {
    document.removeEventListener('click', handleOutsideClick);
    clearInterval(intervalId); // cleanup interval
  };
}, []);



  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/logout`);
      sessionStorage.clear();
      window.location.href = '/';
      window.history.pushState(null, null, '/');
      window.onpopstate = () => {
        window.location.href = '/';
      };
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error while logging out');
    }
  };

  return (
    <div className='Navbar'>
      <div className="logo">
        <h1>LEMS</h1>
        <p>Logistic Equipment Management System</p>
      </div>
      <div className="menu-navbar-toggle" onClick={toggleNav}>
      {isNavVisible ? <FaTimes /> : <FaBars />} {/* Toggle icon for opening the left navigation */}
      </div>
      <ul className='navbar-menu'>
        <li className="user-dropdown" onClick={toggleDropdown}>
          {user ? (
            <>
               <img
        src={
          user.profilePic
            ? `${process.env.REACT_APP_BACKEND_URL}${user.profilePic}`
            : `https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName}&backgroundColor=E3F2FD`
        }
        alt={`${user.firstName} ${user.lastName}`}
        className="profile-avatar"
      />
              <h3>{`${user.firstName} ${user.lastName}`}</h3> <FaChevronDown />
            </>
          ) : (
            <span>Loading...</span>
          )}
          {dropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li onClick={() => setCurrentPage('user-profile')}>
                  <FaUser  /> Profile
                </li>
                <li onClick={() => setShowLogoutConfirm(true)}>
            <FaSignOutAlt color='red' /> Logout
          </li>
              </ul>
            </div>
          )}
        </li>
      </ul>
    {user.role?.name === 'LOGISTIC'  && (
  <div className="notification-icon-container">
    <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
      <FaBell size={24} color="#333" />
      {lowStockItems.length > 0 && <span className="notification-badge">{lowStockItems.length}</span>}
    </div>
    {showNotifications && (
      <div className="notification-dropdown">
        <h4>Low Stock Alerts</h4>
        {lowStockItems.length === 0 ? (
          <p>No low stock items.</p>
        ) : (
          <ul>
            {lowStockItems.map((item) => (
              <li key={item._id}>
                {item.name} — {item.quantity} left
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
)}


         {/* Logout confirmation modal */}
         {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <FaExclamationTriangle className="logout-warning-icon" />
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className='confirm-logout' onClick={handleLogout}>Yes</button>
              <button className='cancel-logout' onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopNavbar;