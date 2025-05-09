import React, { useState, useEffect,useRef } from 'react';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';
import TopNavigation from '../navbar/Navbar';
import Footer from '../footer/Footer'
import LeftNavbar from '../navsidebar/leftNavigationbar';
import Overview from './Overview';
import ViewUserRequest from './UserItemRequisitions/parentPage';
import RecieveduserRequest from '../logisticdashboard/receivedRequisitions/itemRequestReceived';
import ViewLogisticRequest from './requestOfLogistic/orderpages';
import UserFuelRequest from './UserfuelRequest/userfuelrequestpage';
import LogisticFuelOrder from './LogisticFuelOrders/logisticFuelOrderPages';
import RepairLogisticOrder from './logisticRepairRequest/repairRequisitionPage';
import ViewItems from '../DGdashboard/StockItem/viewitems';
import ItemStockReport from './itemReport/itemReport';
import FuelStock from '../logisticdashboard/fuelRequisition/fuelStock';
import FuelReport from '../logisticdashboard/StockReport/FuelReport';
import DataVisualization from './dataAnalysis/itemRequisitionAnalysis';
import DafProfile from '../UserProfile/profile';
import './DafDashboard.css';
import HelpCenter from '../helpcenter/helpcenter';


const LogisticDashboard = () => {
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'user-item-request':
          return <ViewUserRequest />;
      case 'user-profile':
          return <DafProfile />;
      case 'recieved-requisition':
         return <RecieveduserRequest />
      case 'view-stock-items':
            return <ViewItems/>
      case 'view-logistic-request':
          return <ViewLogisticRequest />
      case 'Fuel-logistic-Order':
          return <LogisticFuelOrder />  
          
      case 'report':
          return <ItemStockReport />;
      case 'fuel-report':
          return <FuelReport />;   
      case 'fuel-stock':
          return <FuelStock />; 


     case 'Repair-logistic-Order':
      return <RepairLogisticOrder />     
     case 'user-fuel-request':
          return <UserFuelRequest />;
     case 'data_charts':
          return <DataVisualization />      
      case 'help_center':
        return <HelpCenter />    
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
    <div className={`admin-dashboard ${isMenuOpen ? 'open' : ''}`}>
    <div>
    <TopNavigation setCurrentPage={setCurrentPage} toggleNav={toggleNav}  isNavVisible={isNavVisible}   />
      <div className="menu-toggle" onClick={handleMenuToggle}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </div>
       <LeftNavbar setCurrentPage={setCurrentPage} isVisible={isNavVisible} 
        privileges={privileges} closeNav={closeNav}  />
     <div className='content-page'>
          {renderContent()}
        </div>
      <div className="footer-page">
        <Footer />
      </div>
  
  </div>
  );
};

export default LogisticDashboard;
