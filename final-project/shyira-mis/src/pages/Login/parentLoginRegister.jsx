import React, { useState } from 'react';
import LoginForm from './Login';
import SignUpForm from './RegisterUser';
//import './stylingpages/loginForm.css'; // Adjust your CSS file path

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUpClick = () => {
    setIsSignUp(true);
  };

  const handleSignInClick = () => {
    setIsSignUp(false);
  };

  return (
    <div className={` ${isSignUp ? 'right-panel-active' : ''}`} id="container">
      {isSignUp ? (
        <SignUpForm onSwitchToLogin={handleSignInClick} />
      ) : (
        <LoginForm onSwitchToSignUp={handleSignUpClick} />
      )}
     
    </div>
  );
};

export default AuthForm;