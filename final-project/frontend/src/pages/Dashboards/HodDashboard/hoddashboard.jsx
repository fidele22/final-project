import React, { useState, useEffect,useRef } from 'react';
import TopNavigation from '../navbar/Navbar';
import Footer from '../footer/Footer';
import LeftNavbar from '../navsidebar/leftNavigationbar';
import Overview from './Overview';
import MakeRequest from './request/requisitionPagesLinks';
import FuelRequestPages from './fuelRequest/fuelRequisitionPages';
import Items from './items/viewItems';
import CarMontlyData from './cardata/cardata'
import UserProfile from '../UserProfile/profile';
import HelpCenter from '../helpcenter/helpcenter';
import './hodDashboard.css';

const HodDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [privileges, setPrivileges] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false); // State for navigation visibility
  const navRef = useRef(); 

  useEffect(() => {
    const tabId = sessionStorage.getItem('currentTab');
    console.log('Current tab ID:', tabId); // Debugging log

    if (tabId) {
      const storedPrivileges = sessionStorage.getItem(`privileges_${tabId}`);
      console.log('Stored privileges:', storedPrivileges); // Debugging log

      if (storedPrivileges) {
        try {
          const parsedPrivileges = JSON.parse(storedPrivileges); // Parse the stored privileges
          setPrivileges(parsedPrivileges); // Update state with parsed privileges
        } catch (error) {
          console.error('Error parsing privileges from sessionStorage:', error);
          setPrivileges([]); // Set to an empty array if parsing fails
        }
      } else {
        console.warn('Privileges not found in sessionStorage');
        setPrivileges([]); // Set to an empty array if no privileges are found
      }
    } else {
      console.warn('No tab ID found in sessionStorage');
      setPrivileges([]); // Set to an empty array if no tab ID is found
    }
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'view-items':
        return <Items />;
      case 'fuel-request':
        return <FuelRequestPages />;
      case 'requisition':
        return <MakeRequest />;
      case 'user-profile':
        return <UserProfile />;
      case 'monthly_car_data':
        return <CarMontlyData />; 
      case 'help_center':
        return <HelpCenter />;
      default:
        return <Overview />;
    }
  };

  const toggleNav = () => {

    setIsNavVisible(!isNavVisible); // Toggle the navigation visibility

  };


  const closeNav = () => {

    setIsNavVisible(false); // Function to close the navigation

  };


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (navRef.current && !navRef.current.contains(event.target)) {

        closeNav(); // Close navigation if clicked outside

      }

    };


    document.addEventListener('mousedown', handleClickOutside);

    return () => {

      document.removeEventListener('mousedown', handleClickOutside);

    };

  }, []);
  return (
    <div className="daf-dashboards">
      <TopNavigation setCurrentPage={setCurrentPage} toggleNav={toggleNav}  isNavVisible={isNavVisible}   />
      
      <div className="content-navbar">
        <LeftNavbar setCurrentPage={setCurrentPage} isVisible={isNavVisible} 
        privileges={privileges} closeNav={closeNav}  />
      </div>
      <div className='contents-page'>
          {renderContent()}
        </div>
     <div className="footer-page">
        <Footer />
      </div>
  

    </div>
  );
};

export default HodDashboard;