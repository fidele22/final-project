import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './stylingfuelorders.css';
import '../../logisticdashboard/contentCss/itemrequisition.css';

const ForwardedRequests = () => {
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [dafUsers, setDafUsers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [logisticUsers, setLogisticUsers] = useState([]);
  const [user, setUser ] = useState(null);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Number of items to display per page

  useEffect(() => {
    fetchForwardedRequests();
    fetchLogisticUsers();
    fetchDafUsers();
  }, []);

  const fetchLogisticUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/logistic-users`);
      setLogisticUsers(response.data);
    } catch (error) {
      console.error('Error fetching logistic users:', error);
    }
  };

  const fetchDafUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/daf-users`);
      setDafUsers(response.data);
    } catch (error) {
      console.error('Error fetching daf users:', error);
    }
  };

  const fetchForwardedRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/logisticFuel/get-rejected-fuelorder`);
      setForwardedRequests(response.data);
    } catch (error) {
      console.error('Error fetching forwarded requests:', error);
    }
  };

  const handleRequestClick = (requestId) => {
    const request = forwardedRequests.find(req => req._id === requestId);
    setSelectedRequest(request);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentTab = sessionStorage.getItem('currentTab');
        if (!currentTab) {
          setError('No tab ID found in sessionStorage');
          return;
        }

        const token = sessionStorage.getItem(`token_${currentTab}`);
        if (!token) {
          setError('Token not found');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setUser (response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Invalid token or unable to fetch profile data');
      }
    };

    fetchUserProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  // Calculate the current items to display
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = forwardedRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Calculate total pages
  const totalPages = Math.ceil(forwardedRequests.length / itemsPerPage);

  return (
    <div className={`verified-requist ${selectedRequest ? 'dim-background' : ''}`}>
      <div className="order-navigation">
        <div className="navigation-title">
          <h2>Requisition of fuel form logistic office rejected</h2>
        </div>
        <ul>
          {currentRequests.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form from <b>logistic office</b> order of FUEL done on {new Date(request.createdAt).toDateString()}
                <span className="badge-status">Rejected</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        </div>
      </div>
      {selectedRequest && (
        <div className="request-details-overlay">
          <div className="request-details">
            <div className="form-navigation">
              <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
            </div>
            <div className="image-request-recieved">
              <img src="/image/logo2.png" alt="Logo" className="logo" />
            </div>
            <div className='date-done'>
              <label htmlFor="">{new Date(selectedRequest.date).toDateString()}</label>
            </div>
            <div className="fuel-order-heading">
              <h5>DISTRICT: NYABIHU</h5>
              <h5>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h5>
              <h5>DEPARTMENT: LOGISTIC OFFICE</h5>
              <h5>WESTERN PROVINCE</h5>
              <h5>SUPPLIER NAME: {selectedRequest.supplierName}</h5>
            </div>

            <h3>REQUISITION FORM OF LOGISTIC FOR FUEL</h3>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Destination</th>
                  <th>Quantity Requested (liters)</th>
                  <th>Price Per Liter</th>
                  <th>Price Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedRequest.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.destination}</td>
                    <td>{item.quantityRequested}</td>
                    <td>{item.pricePerUnit}</td>
                    <td>{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="signature-section">
              <div className="hod-signature">
                <h4>Logistic Office</h4>
                <label>Prepared By:</label>
                <span>{selectedRequest.hodName || ''}</span><br />
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature"
                className='signature-img' />
              </div>


             
            </div>
            <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="logo" />
         </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default ForwardedRequests;