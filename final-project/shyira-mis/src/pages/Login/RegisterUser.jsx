import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import Notification from '../Dashboards/ModelMessage/notification'
import './registeruser.css';
//import './stylingpages/loginForm.css'; // Adjust your CSS file path

const SignUpForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    positionName: '',
    serviceName: '',
    departmentName: '',
    phone: '',
    email: '',
    signature: null,
    password: '',
    confirmPassword: '',
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/departments`);
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/positions`);
        setPositions(response.data);
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };
    fetchPositions();
  }, []);

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.positionName.trim()) newErrors.positionName = 'Position is required';
    if (!formData.departmentName.trim()) newErrors.departmentName = 'Department is required';
    if (!formData.serviceName.trim()) newErrors.serviceName = 'Service is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm Password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.signature) newErrors.signature = 'Signature is required';

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'signature' ? files[0] : value,
    });
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (validateRegisterForm()) {
      try {
        const formDataToSend = new FormData();
        for (const key in formData) {
          formDataToSend.append(key, formData[key]);
        }

        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/register`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log('User  registered:', response.data);
        setSuccessMessage('Registration successful!');
        setFormData({
          firstName: '',
          lastName: '',
          positionName: '',
          serviceName: '',
          departmentName: '',
          phone: '',
          email: '',
          signature: null,
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Error registering user:', error);
        setErrorMessage('Registration failed. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const closeNotification = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className="register-user-form">
      <div className="register-form">
      <form onSubmit={handleSubmitRegister}>
      <div className="overlay-container">
        
        <div className="overlay-left">
          <h2>Welcome to smart logistic equipment managment system (LEMS)</h2>
          <p>Create an account with your personal details and start your journey with us</p> <hr />
       
        </div>
        <div className="overlay-right">
        <img src="/image/lems.ppng" alt="" />
       
  
      </div>
    </div>
      <h1>User Registiration</h1>
 
        <div className="form-register-columns">
          
                    {/* Left Column */}
                    <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="">First name</label>
        <input type="tel" name="firstName" value={formData.firstName} onChange={handleChange} placeholder='First name'/>
        {registerErrors.firstName && <p className="error">{registerErrors.firstName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="">Last name</label>
        <input type="tel" name="lastName" value={formData.lastName} onChange={handleChange} placeholder='Last name' />
        {registerErrors.lastName && <p className="error">{registerErrors.lastName}</p>}
        </div>
      

        <div className="form-group">
          <label htmlFor="">Service</label>
        <select name="serviceName" value={formData.serviceName} onChange={handleChange}>
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service._id} value={service.name}>{service.name}</option>
          ))}
        </select>
        {registerErrors.serviceName && <p className="error">{registerErrors.serviceName}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="">Department</label>
        <select  name="departmentName" value={formData.departmentName} onChange={handleChange}>
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department._id} value={department.name}>{department.name}</option>
          ))}
        </select>
        {registerErrors.departmentName && <p className="error">{registerErrors.departmentName}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="">Password</label>
        <input type={showPassword ? 'tel' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder='Password' />
        <span onClick={togglePasswordVisibility} className="password-view-signup">
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
        {registerErrors.password && <p className="error">{registerErrors.password}</p>}
        </div>
        </div>
        <div className="form-column">
        <div className="form-group">
        <label htmlFor="">Phone number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder='Phone number' />
        {registerErrors.phone && <p className="error">{registerErrors.phone}</p>}
        </div>
       
        <div className="form-group">
          <label htmlFor="">Email address</label>
        <input type="tel" name="email" value={formData.email} onChange={handleChange} placeholder='Email address' />
        {registerErrors.email && <p className="error">{registerErrors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="">Position</label>
        <select  name="positionName" value={formData.positionName} onChange={handleChange}>
          <option value="">Select Position</option>
          {positions.map((position) => (
            <option key={position._id} value={position.name}>{position.name}</option>
          ))}
        </select>
        {registerErrors.positionName && <p className="error">{registerErrors.positionName}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="">Signature</label>
        <input type="file" name="signature" onChange={handleChange} />
        {registerErrors.signature && <p className="error">{registerErrors.signature}</p>}
        </div>
       
        <div className="form-group">
          <label htmlFor="">Confirm password</label>
        <input type={showPassword ? 'tel' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder='Confirm Password' />
        {registerErrors.confirmPassword && <p className="error">{registerErrors.confirmPassword}</p>}
       </div>
       </div>
       </div>
       <div className="registration-btn">
       <button className='register-btn' type="submit">Register</button>
        <p>If already have an account? Please <span onClick={onSwitchToLogin}>Login</span></p>
       </div>
       
      </form>
    </div>

    {/* {notifation message} */}
{successMessage && (
        <Notification message={successMessage} onClose={closeNotification} type="success" />
      )}
      {errorMessage && (
        <Notification message={errorMessage} onClose={closeNotification} type="error" />
      )}
    </div>
    
  );
};

export default SignUpForm;