import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  // Retrieve the currentTab and token from sessionStorage
  const currentTab = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${currentTab}`);

  // If no token is found, redirect to the login page
  if (!token) {
    return <Navigate to="/" />;
  }

  // If token is present, render the protected component
  return <Component {...rest} />;
};

export default ProtectedRoute;
