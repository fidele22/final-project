import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

const ForwardedRequests = () => {
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 



  useEffect(() => {
  
 

  const fetchForwardedRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/logisticFuel/approved-fuel-order`);
      setForwardedRequests(response.data);
    } catch (error) {
      console.error('Error fetching forwarded requests:', error);
      setError('Failed to fetch forwarded requests');
    }
  };


  
  
  

      const fetchUser  = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser (response.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };



      fetchForwardedRequests();
      fetchUser();
      
    }, [token]);
 const handleSignClick = () => {

    setIsSigned(true); // Set signed state to true when sign button is clicked
  
  };
  
  
  const handleReceivedClick = async (e) => {
    e.preventDefault();
    if (!isSigned) {
      Swal.fire({
        title: 'Error!',
        text: 'You must sign before mark as recieved , click on sign please!!.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to mark as recieve this fuel logistic requisition with signing?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, recieve it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/logisticFuel/recieved-fuel/${selectedRequest._id}`,{
        
          receivedBy : {
            firstName: user.firstName,
            lastName: user.lastName,
            signature: user.signature
          }
        });
  // Optionally refresh the list of forwarded requests

  setForwardedRequests(prevRequests => 

    prevRequests.map(req => 

      req._id === response.data._id ? response.data : req

    )

  );

          Swal.fire({
            title: 'Success!',
            text: 'Reception sign and update fuel stock successfully',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } catch (error) {
          console.error('Error for approving request:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to sign reception of fuel order',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  const handleRequestClick = (requestId) => {
    const request = forwardedRequests.find(req => req._id === requestId);
    setSelectedRequest(request);
    setFormData(request);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(selectedRequest);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (!user) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={`request ${selectedRequest ? 'dim-background' : ''}`}>
      <div className="order-navigation">
        <h2>Requisition from logistic office for fuel</h2>
        <table className="requests-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Request type</th>
              <th>Supplier Name</th>
              <th>Done on</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {forwardedRequests.slice().reverse().map((request, index) => (
              <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
                <td>{index + 1}</td>
                <td>Request of fuel from logistic office prepared by {request.hodName}</td>
                <td>{request.supplierName}</td>
                <td>{new Date(request.createdAt).toDateString()}</td>
                <td><b className='status-approved'>{request.status}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {selectedRequest && (
        
        <div className="request-details">
              <div className="form-navigation">
        <button className='mark-received-btn' onClick={handleReceivedClick}>Mark as Received</button>
        <button className='sign-button' onClick={handleSignClick}>Sign</button>
        <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
      </div>
          <div className="image-request-recieved">
            <img src="/image/logo2.png" alt="Logo" className="logo" />
          </div>
          <div className='date-done'>
            <label htmlFor="">{new Date(selectedRequest.date).toDateString()}</label>
          </div>
          <div className="fuel-order-heading">
            <h5>WESTERN PROVINCE</h5>
            <h5>DISTRICT: NYABIHU</h5>
            <h5>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h5>
            <h5>DEPARTMENT: LOGISTIC OFFICE</h5>
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
              {selectedRequest.items && selectedRequest.items.map((item, idx) => (
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
              <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" className='signature-img' />
            </div>
            <div className='daf-signature'>
              <h4>DAF Office</h4>
              <label>Verified By:</label>
              <p>{selectedRequest.verifiedBy.firstName} {selectedRequest.verifiedBy.lastName}</p>
              {selectedRequest.verifiedBy.signature ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.verifiedBy.signature}`} alt="Approved Signature" className='signature-img' />
              ) : (
                <p>No signature available</p>
              )}
            </div>
            <div className='daf-signature'>
              <h4>DG Office</h4>
              <label>Approved By:</label>
              <p>{selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}</p>
              {selectedRequest.approvedBy.signature ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.approvedBy.signature}`} alt="Approved Signature" className='signature-img' />
              ) : (
                <p>No signature available</p>
              )}
            </div>
            {isSigned && (
              <div className="daf-signature">
                <h4>Logistic Office:</h4>
                <label htmlFor="dgName">Recieved By:</label>
                <p>{user.firstName} {user.lastName}</p>
                {user.signature ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt="Signature" className='signature-img' />
                ) : (
                  <p>No signature available</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForwardedRequests;