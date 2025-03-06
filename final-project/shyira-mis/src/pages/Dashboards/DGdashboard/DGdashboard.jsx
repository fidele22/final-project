import React, { useState,useEffect } from 'react';
import Navigation from '../navbar/Navbar'
import Footer from '../footer/Footer'
import Navbar from '../navsidebar/leftNavigationbar';
import Overview from './Overview';
import ViewRequest from './userRequisition/RequestVerified'
import ViewLogisticRequest from './requestOfLogistic/OrderPage'
import FuelRequisition from './userfuelRequisition/fuelRequisitionPages'
import UserRequestRecieved from '../logisticdashboard/receivedRequisitions/itemRequestReceived'
import ViewItems from './StockItem/viewitems'
import ItemStockReport from './Stockreport/itemReport';
import FuelReport from './Stockreport/FuelReport';
import FuelStock from './Stockreport/FuelFullReport'
import FuelLogisticRequest from './LogisticFuelOrders/logisticFuelOrderPages'
import RepairLogisticRequest from './logisticRepairRequest/repairRequisitionPage'
import DafProfile from '../UserProfile/profile'
import HelpCenter from '../helpcenter/helpcenter'
import './DafDashboard.css';


const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [privileges, setPrivileges] = useState([]);

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
     case 'view-request':
          return <ViewRequest />;
   
      case 'view-stock-items':
          return <ViewItems/>
      case 'user-request-recieved':
         return <UserRequestRecieved />  
      case 'view-logistic-request':
          return <ViewLogisticRequest />
      case 'fuel-logistic-request':
          return <FuelLogisticRequest /> 
      case 'repair-logistic-request':
         return<RepairLogisticRequest />       
      case 'fuel-requisition':
          return <FuelRequisition />;
                    
      case 'report':
        return <ItemStockReport />;
    case 'fuel-report':
        return <FuelReport />;   
    case 'fuel-stock':
        return <FuelStock />; 

      case 'user-profile':
          return <DafProfile />;  
      case 'help-center':
          return <HelpCenter />;

      default:
        return <Overview />;
    }
  };

  return (
    <div className="dg-dashboard">
      <Navigation />
      <Navbar setCurrentPage={setCurrentPage} privileges={privileges}
     />
      <div className="dg-content-page">
      <div className="dgcontent">
        {renderContent()}
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
