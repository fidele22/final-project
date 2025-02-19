import React, { useState } from 'react';
import { FaHome, FaList, FaBoxOpen, FaUser,FaPlus,FaGasPump,FaClipboardList,
  FaChartBar,FaClipboardCheck, FaLifeRing } from 'react-icons/fa';
import './navigationbar.css';

const Navbar = ({ setCurrentPage, privileges }) => {
  const [dropdownsOpen, setDropdownsOpen] = useState({
    request: false,
    requisitions: false,
    requisitionsstatus: false,
    fuelrequisitionsstatus: false,
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
        {privileges.includes('view_overview') && (
          <li onClick={() => setCurrentPage('overview')}><FaHome /> Overview</li>
        )}
        {privileges.includes('view_items') && (
          <li onClick={() => setCurrentPage('view-items')}><FaList /> Available Items</li>
        )}
        {privileges.includes('request_item') && (
          <li onClick={() => setCurrentPage('requisition')}><FaBoxOpen /> Request Item</li>
        )}
        {privileges.includes('request_fuel') && (
          <li onClick={() => setCurrentPage('fuel-request')}><FaBoxOpen /> Request Fuel</li>
        )}
        {privileges.includes('update_car_data') && (
          <li onClick={() => setCurrentPage('fill-cardata')}><FaBoxOpen /> Update Car Data</li>
        )}

        {/* links supposed to logistic role */}

        {privileges.includes('Manage_item_stock') && (
          <li onClick={() => setCurrentPage('manage-items-stock')}> <FaList /> Manage Item stock </li>
        )}
        {privileges.includes('Make_item_order') && (
          <li onClick={() => setCurrentPage('make-order')}><FaClipboardCheck /> Order Supplies  </li>
        )}
        {privileges.includes('view_request_item') && (
          <li onClick={() => setCurrentPage('item-requisition')}><FaClipboardCheck /> Item Requisition</li>
        )}
        {privileges.includes('view_request_fuel') && (
          <li onClick={() => setCurrentPage('fuel-requisition')}><FaClipboardCheck /> Fuel Requisition</li>
        )}
        {privileges.includes('View_car_data') && (
          <li onClick={() => setCurrentPage('view-cars')}> <FaChartBar /> view cars data</li>
        )}
        {privileges.includes('view_fuel_stock') && (
         <li onClick={() => setCurrentPage('fuel-stock')}><FaPlus /> Fuel stock</li>
        )}
        

         {/*links supposed to go on daf  */}
     
        {privileges.includes('view-stock-items') && (
           <li onClick={() => setCurrentPage('view-stock-items')}> <FaList /> stock Items</li>
        )}
        {privileges.includes('verify-logistic-item-request') && (
             <li onClick={() => setCurrentPage('view-logistic-request')}><FaBoxOpen /> Logistic Item Requisition </li>
        )}
        {privileges.includes('Verify-logistic-fuel-request') && (
                <li onClick={() => setCurrentPage('Fuel-logistic-Order')}><FaGasPump /> Logistic Fuel Requisition </li>
        )}
        {privileges.includes('Repair-logistic-request') && (
               <li onClick={() => setCurrentPage('Repair-logistic-Order')}><FaGasPump /> Logistic Repair Requisition </li>
        )} 
       {privileges.includes('Approve-user-item-request') && (
         <li onClick={() => setCurrentPage('user-item-request')}><FaClipboardList /> User Item Requisition</li>  
        )}

       {privileges.includes('Approve-user-fuel-request') && (
        <li onClick={() => setCurrentPage('user-fuel-request')}><FaGasPump />  User Fuel Requisition</li>
        )}   

             {/*links supposed to go on DG  */}

        {privileges.includes('Approve-logistic-request') && (
         <li onClick={() => setCurrentPage('view-logistic-request')}><FaClipboardList /> Logistic Item requisition</li>
        )}
        {privileges.includes('approve-fuel-logistic-request') && (
                   <li onClick={() => setCurrentPage('fuel-logistic-request')}><FaGasPump /> Logistic Fuel requisition</li>
        )}
        {privileges.includes('approve-repair-logistic-request') && (
          <li onClick={() => setCurrentPage('repair-logistic-request')}><FaGasPump /> Logistic Repair requisition</li>
        )}
        {privileges.includes('view-user-requisition') && (
          <li onClick={() => setCurrentPage('user-request')}><FaBoxOpen />User item requisition</li>
        )}
        {privileges.includes('View-user-fuel-request') && (
        <li onClick={() => setCurrentPage('fuel-requisition')}><FaClipboardCheck /> User Fuel Requisition </li>
        )}

        {/* links shared  */}
        {privileges.includes('view_item_report') && (
          <li onClick={() => setCurrentPage('report')}><FaChartBar /> Item Report</li>
        )} 
        {privileges.includes('view_fuel_report') && (
          <li onClick={() => setCurrentPage('fuel-report')}><FaChartBar /> Fuel Report </li>
        )}  
       </ul>
    </div>
  );
};

export default Navbar;