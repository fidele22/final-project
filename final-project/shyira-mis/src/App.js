
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import PrivateRoute from './Component/ProtectedRoute'
import Login from './pages/Login/parentLoginRegister'
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPasswordPage';
import AdminDashboard from './pages/Dashboards/admindashboard/AdminDashboard';
import ProtectedRoute from './Component/ProtectedRoute';
import LogisticDashboard from './pages/Dashboards/logisticdashboard/LogisticDashboard';
import DafDashboard from './pages/Dashboards/dafdashboard/dafdashboard'
import HodDashboard from './pages/Dashboards/HodDashboard/hoddashboard'
import DGDashboard from './pages/Dashboards/DGdashboard/DGdashboard'
import './App.css'

function App() {
  return (

    <Router>
      <div className='app'>
      
        <Routes>
        
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin-dashboard/*" element={<ProtectedRoute component={AdminDashboard} />} />
          <Route path="/logistic/*" element={<ProtectedRoute component={LogisticDashboard} />} /> 
          <Route path="/hod/*" element={<ProtectedRoute component={HodDashboard} />} />
          <Route path="/daf/*" element={<ProtectedRoute component={DafDashboard} />} />
          <Route path="/DG/*" element={<ProtectedRoute component={DGDashboard} />} />
          
        </Routes>
      </div>
    </Router>
  
   
  );
}

export default App;
