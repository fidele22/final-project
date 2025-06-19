import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

import '../css/AddUser.css';


const AddUser = ({ onClose }) => {


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


  const [departments, setDepartments] = useState([]);

  const [services, setServices] = useState([]);

  const [positions, setPositions] = useState([]);

  const [users, setUsers] = useState([]);


  // Fetch users function

  const fetchUsers = async () => {

    try {

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`);

      setUsers(response.data);

    } catch (error) {

      console.error('Error fetching users:', error);

    }

  };


  useEffect(() => {

    fetchUsers(); // Fetch users on component mount

  }, []);


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


  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === 'signature') {

      setFormData({ ...formData, [name]: files[0] });

    } else {

      setFormData({ ...formData, [name]: value });

    }

  };


  const handleSubmitRegisterUser  = async (e) => {

    e.preventDefault();

    try {

      const formDataToSend = new FormData();

      formDataToSend.append('firstName', formData.firstName);

      formDataToSend.append('lastName', formData.lastName);

      formDataToSend.append('positionName', formData.positionName);

      formDataToSend.append('serviceName', formData.serviceName);

      formDataToSend.append('departmentName', formData.departmentName);

      formDataToSend.append('phone', formData.phone);

      formDataToSend.append('email', formData.email);

      formDataToSend.append('signature', formData.signature);

      formDataToSend.append('password', formData.password);


      const response =await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/register`, formDataToSend, {

        headers: {

          'Content-Type': 'multipart/form-data',

        },

      });

      console.log('User  registered:', response.data);

     sessionStorage.setItem('token', response.data.token);
 

      fetchUsers();


      // Show success message using SweetAlert2

      Swal.fire({

        title: 'Success!',
        text: 'User  Registration successfully',
        icon: 'success',
        confirmButtonText: 'OK',

        customClass: {

          popup: 'custom-swal',

        },

      });


      // Reset form fields after successful submission

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

      Swal.fire({

        title: 'Error!',

        text: 'Failed to register new user!',

        icon: 'error',

        confirmButtonText: 'OK',

        customClass: {

          popup: 'custom-swal',

        },

      });

    }

  };


  return (

    <div className='add-user'>

   
    {/* Close Button */}
    <button className="close-addform-btn" onClick={onClose}>
  <FaTimes size={24} />
   </button>

<form onSubmit={handleSubmitRegisterUser}>
  <h1>Register New User</h1>
  <span>Use your email for registration</span>

  <div className="form-three-columns">
    {/* Column 1: Personal Info */}
    <div className="form-column">
      <label>First Name</label>
      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />

      <label>Last Name</label>
      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />

      <label>Phone Number</label>
      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" required />
    </div>

    {/* Column 2: Work Info */}
    <div className="form-column">
      <label>Department</label>
      <select name="departmentName" value={formData.departmentName} onChange={handleChange}>
        <option value="">Select Department</option>
        {departments.map((department) => (
          <option key={department._id} value={department.name}>{department.name}</option>
        ))}
      </select>

      <label>Service</label>
      <select name="serviceName" value={formData.serviceName} onChange={handleChange}>
        <option value="">Select Service</option>
        {services.map((service) => (
          <option key={service._id} value={service.name}>{service.name}</option>
        ))}
      </select>

      <label>Position</label>
      <select name="positionName" value={formData.positionName} onChange={handleChange} required>
        <option value="">Select Position</option>
        {positions.map((position) => (
          <option key={position._id} value={position.name}>{position.name}</option>
        ))}
      </select>
    </div>

    {/* Column 3: Account Info */}
    <div className="form-column">
      <label>Email Address</label>
      <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required />

      <label>Password</label>
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
      <label>Signature</label>
      <input type="file" name="signature" onChange={handleChange} />
    </div>
  </div>

  <button style={{width:'150px'}} className="register-user-btn">Register User</button>
</form>



      </div>



  );

};


export default AddUser ; 