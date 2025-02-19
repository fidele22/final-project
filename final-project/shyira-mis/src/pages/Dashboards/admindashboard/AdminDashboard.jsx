import React, { useState } from 'react';
import { FaHome, FaUser , FaList, FaClipboardList, FaBurn, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import Navbar from './adminNavbar/Navigationbar';
import Navigation from '../navbar/Navbar';
import Footer from '../footer/Footer';
import AdminOverview from './AdminOverview';
import ViewUser  from './user/users';
import UserRole from './roles/viewRoles';
import ViewS from './service/ViewServices';
import ViewP from './position/viewPosition';
import ViewD from './department/viewDepartment';
import UserProfile from '../UserProfile/profile';
import './css/adminDashboard.css';
import HelpCenter from '../helpcenter/helpcenter';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('adminoverview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'adminoverview':
        return <AdminOverview />;
      case 'view-Users':
        return <ViewUser  />;
      case 'user-roles':
        return <UserRole />;
      case 'view-service':
        return <ViewS />;
      case 'view-position':
        return <ViewP />;
      case 'view-department':
        return <ViewD />;
      case 'user-profile':
        return <UserProfile />;
      case 'help-center':
        return <HelpCenter />  
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className={`admin-dashboard ${isMenuOpen ? 'open' : ''}`}>
      
      <div>
      <Navigation setCurrentPage={setCurrentPage} />
      
        <div className="menu-toggle" onClick={handleMenuToggle}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      <Navbar setCurrentPage={setCurrentPage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      <div className="Admincontent-page">
        <div className="Admincontent">
          {renderContent()}
       
        </div>
        <Footer />
      </div>
    
    </div>
  );
};

export default AdminDashboard;