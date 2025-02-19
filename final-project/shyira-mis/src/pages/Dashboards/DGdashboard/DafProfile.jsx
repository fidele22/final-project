import React, { useEffect, useState } from 'react';


const DashboardOverview = () => {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [position, setPosition] = useState('');
  const [service, setService] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setPhone(data.phone);
          setEmail(data.email);
          setSignature(data.signature);
          setPosition(data.position || 'N/A');
          setService(data.service || 'N/A');
          setDepartment(data.department || 'N/A');
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className='loginsignup-container'>
      <h1>Accounts Details</h1>
      <form>
        <div className='loginsignup-fields'>
          <div className='flex-container'>
            <div className='left'>
              <label>First Name</label>
              {firstName}
            </div>
            <div className='right'>
              <label>Last Name</label>
              {lastName}
            </div>
          </div>
          <div className='flex-container'>
            <div className='left'>
              <label>Position</label>
              {position}
            </div>
            <div className='right'>
              <label>Service</label>
              {service}
            </div>
          </div>
          <div className='flex-container'>
            <div className='left'>
              <label>Department</label>
              {department}
            </div>
            <div className='right'>
              <label>Phone number</label>
              {phone}
            </div>
          </div>
          <div className='flex-container'>
            <div className='left'>
              <label>Email address</label>
              {email}
            </div>
            <div className='right'>
              <label>Signature</label>
              {signature}
            </div>
          </div>
        </div>
        <button type="submit">Edit your profile</button>
      </form>
    </div>
  );
};

export default DashboardOverview;
