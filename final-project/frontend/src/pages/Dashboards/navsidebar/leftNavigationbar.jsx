import React, { useState ,useEffect,useRef} from 'react';
import { FaHome, FaList, FaBoxOpen, FaPlus, FaGasPump, FaClipboardList, 
  FaChartBar, FaClipboardCheck } from 'react-icons/fa';
import './navigationbar.css';

const LeftNavbar = ({ setCurrentPage, privileges, isVisible, closeNav }) => {

  const [activePage, setActivePage] = useState('');
  const navRef = useRef(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setActivePage(page);
    closeNav(); // Close nav after clicking a link
};

// Close navbar when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        if (isVisible && navRef.current && !navRef.current.contains(event.target)) {
            closeNav();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isVisible, closeNav]);

  return (
    <div ref={navRef} className={`navigation ${isVisible ? 'active' : 'hidden'}`}>
      <ul>
        {privileges.includes('view_overview') && (
          <li className={activePage === 'overview' ? 'active' : ''} onClick={() => handleNavigation('overview')}>
            <span><FaHome /></span> Overview
          </li>
        )}
        {privileges.includes('view_items') && (
          <li className={activePage === 'view-items' ? 'active' : ''} onClick={() => handleNavigation('view-items')}>
            <span><FaList /></span> Available Items
          </li>
        )}
        {privileges.includes('make_requisition_item') && (
          <li className={activePage === 'requisition' ? 'active' : ''} onClick={() => handleNavigation('requisition')}>
            <span><FaBoxOpen /></span> Request Item
          </li>
        )}
        {privileges.includes('make_requisition_fuel') && (
          <li className={activePage === 'fuel-request' ? 'active' : ''} onClick={() => handleNavigation('fuel-request')}>
            <span><FaBoxOpen /></span> Request Fuel
          </li>
        )}
        {privileges.includes('monthly_car_data') && (
          <li className={activePage === 'monthly_car_data' ? 'active' : ''} onClick={() => handleNavigation('monthly_car_data')}>
            <span><FaBoxOpen /></span> Update Car Data
          </li>
        )}

        {/* Logistic Role Links */}
        {privileges.includes('Manage_item_stock') && (
          <li className={activePage === 'manage-items-stock' ? 'active' : ''} onClick={() => handleNavigation('manage-items-stock')}>
            <span><FaList /></span> Manage Item Stock
          </li>
        )}
        {privileges.includes('Make_item_order') && (
          <li className={activePage === 'make-order' ? 'active' : ''} onClick={() => handleNavigation('make-order')}>
            <span><FaClipboardCheck /></span> Order Supplies
          </li>
        )}
        {privileges.includes('verify_users_item_request') && (
          <li className={activePage === 'item-requisition' ? 'active' : ''} onClick={() => handleNavigation('item-requisition')}>
            <span><FaClipboardCheck /></span> Item Requisition
          </li>
        )}
        {privileges.includes('verify_users_fuel_request') && (
          <li className={activePage === 'fuel-requisition' ? 'active' : ''} onClick={() => handleNavigation('fuel-requisition')}>
            <span><FaClipboardCheck /></span> Fuel Requisition
          </li>
        )}
        {privileges.includes('View_car_data') && (
          <li className={activePage === 'view-cars' ? 'active' : ''} onClick={() => handleNavigation('view-cars')}>
            <span><FaChartBar /></span> View Cars Data
          </li>
        )}
        {privileges.includes('view_fuel_stock') && (
          <li className={activePage === 'fuel-stock' ? 'active' : ''} onClick={() => handleNavigation('fuel-stock')}>
            <span><FaPlus /></span> Fuel Stock
          </li>
        )}

        {/* DAF Role Links */}
        {privileges.includes('view_stock_items') && (
          <li className={activePage === 'view-stock-items' ? 'active' : ''} onClick={() => handleNavigation('view-stock-items')}>
            <span><FaList /></span> Stock Items
          </li>
        )}
        {privileges.includes('verify_logistic_item_request') && (
          <li className={activePage === 'view-logistic-request' ? 'active' : ''} onClick={() => handleNavigation('view-logistic-request')}>
            <span><FaBoxOpen /></span> Logistic Item Requisition
          </li>
        )}
        {privileges.includes('Verify_logistic_fuel_request') && (
          <li className={activePage === 'Fuel-logistic-Order' ? 'active' : ''} onClick={() => handleNavigation('Fuel-logistic-Order')}>
            <span><FaGasPump /></span> Logistic Fuel Requisition
          </li>
        )}
        {privileges.includes('Repair_logistic_request') && (
          <li className={activePage === 'Repair-logistic-Order' ? 'active' : ''} onClick={() => handleNavigation('Repair-logistic-Order')}>
            <span><FaGasPump /></span> Logistic Repair Requisition
          </li>
        )}
            {privileges.includes('Approve_user_item_request') && (
          <li className={activePage === 'Approve-user-item-request' ? 'active' : ''} onClick={() => handleNavigation('user-item-request')}>
            <span><FaGasPump /></span>User item request
          </li>
        )}
             {privileges.includes('Approve_user_fuel_request') && (
          <li className={activePage === 'Approve-user-fuel-request' ? 'active' : ''} onClick={() => handleNavigation('user-fuel-request')}>
            <span><FaGasPump /></span>User fuel request
          </li>
        )}

        {/* DG Role Links */}
        {privileges.includes('Approve_logistic_request') && (
          <li className={activePage === 'view-logistic-request' ? 'active' : ''} onClick={() => handleNavigation('view-logistic-request')}>
            <span><FaClipboardList /></span> Logistic Item Requisition
          </li>
        )}
        {privileges.includes('approve_fuel_logistic_request') && (
          <li className={activePage === 'fuel-logistic-request' ? 'active' : ''} onClick={() => handleNavigation('fuel-logistic-request')}>
            <span><FaGasPump /></span> Logistic Fuel Requisition
          </li>
        )}
        {privileges.includes('approve_repair_logistic_request') && (
          <li className={activePage === 'repair-logistic-request' ? 'active' : ''} onClick={() => handleNavigation('repair-logistic-request')}>
            <span><FaGasPump /></span> Logistic Repair Requisition
          </li>
        )}
        {privileges.includes('view_user_requisition') && (
          <li className={activePage === 'user-request' ? 'active' : ''} onClick={() => handleNavigation('user-request')}>
            <span><FaBoxOpen /></span> User Item Requisition
          </li>
        )}

        {/* Shared Links */}
        {privileges.includes('view_item_report') && (
          <li className={activePage === 'report' ? 'active' : ''} onClick={() => handleNavigation('report')}>
            <span><FaChartBar /></span> Item Report
          </li>
        )}
        {privileges.includes('view_fuel_report') && (
          <li className={activePage === 'fuel-report' ? 'active' : ''} onClick={() => handleNavigation('fuel-report')}>
            <span><FaChartBar /></span> Fuel Report
          </li>
        )}
           {privileges.includes('view_data_charts') && (
          <li className={activePage === 'data_charts' ? 'active' : ''} onClick={() => handleNavigation('data_charts')}>
            <span><FaChartBar /></span> Data Visualization
          </li>
        )}
           {privileges.includes('view_help_center') && (
          <li className={activePage === 'help_center' ? 'active' : ''} onClick={() => handleNavigation('help_center')}>
            <span><FaChartBar /></span> Help Center
          </li>
        )}
      </ul>
    </div>
  );
};

export default LeftNavbar;
