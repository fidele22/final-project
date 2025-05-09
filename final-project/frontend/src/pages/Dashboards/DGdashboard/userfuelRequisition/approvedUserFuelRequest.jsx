import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';

const FuelRequisitionForm = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState('');
  const [logisticUsers, setLogisticUsers] = useState([]);
  const [dafUsers, setDafUsers] = useState([]);

  useEffect(() => {
    const fetchLogisticUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/logistic-users`);
        setLogisticUsers(response.data);
      } catch (error) {
        console.error('Error fetching logistic users:', error);
      }
    };
    fetchLogisticUsers();
  }, []);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/approveduserfuel`);
        setRequisitions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requisitions:', error);
        setError('Failed to fetch requisitions');
        setLoading(false);
      }
    };
    fetchRequisitions();
  }, []);

  useEffect(() => {
    const fetchDafUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/daf-users`);
        setDafUsers(response.data);
      } catch (error) {
        console.error('Error fetching daf users:', error);
      }
    };
    fetchDafUsers();
  }, []);

  const handleRequestClick = async (requestId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/${requestId}`);
      setSelectedRequest(response.data);
      setQuantityReceived(response.data.quantityReceived || ''); // Set initial quantity received
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleUpdateQuantity = async () => {
    try {
      const updatedData = { ...selectedRequest, quantityReceived: quantityReceived };
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/${selectedRequest._id}`, updatedData);
      setSelectedRequest(response.data);
      alert('Quantity received updated successfully!');
    } catch (error) {
      console.error('Error updating quantity received:', error);
      alert('Failed to update quantity received.');
    }
  };

  const handleRejectRequest = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/reject/${selectedRequest._id}`);
      setRequisitions(requisitions.filter(req => req._id !== selectedRequest._id));
      setSelectedRequest(null);
      alert('Requisition rejected successfully!');
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      alert('Failed to reject requisition.');
    }
  };

  const handleCloseClick = () => {
    setSelectedRequest(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fuel-requisition-form">
      <h4>List of Fuel Requisition that has been approved</h4>
      <label htmlFor=""> Review your requisition was approved </label>
      <div className="order-navigation">
        <ul>
          {requisitions.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form from {request.department} done on {new Date(request.createdAt).toDateString()}
              <span className='status-approved'>Approved</span>
              </p>
            </li>
          ))}
               </ul>
      </div>

      {selectedRequest && (
        <div className="fuel-request-details-overlay">
          <div className="fixed-nav-bar">

            <button type="button" className='close-btn' onClick={handleCloseClick}>Close</button>
          </div>

          <div className="fuel-request-details-content">
            <h3>Fuel Requisition Form</h3>
            <form>
              <div className="view-form-group">
                <label>Requester Name: <span>{selectedRequest.requesterName || ''}</span></label>
              </div>
              <div className="view-form-group">
                <div className="right-side">
                  <label>Car Plaque:</label>
                  <span>{selectedRequest.carPlaque || ''}</span>
                </div>
                <div className="left-side">
                  <label>Remaining (liters):</label>
                  <span>{selectedRequest.remainingLiters || ''}</span>
                </div>
              </div>
              <div className="view-form-group">
                <div className="right-side">
                  <label>Kilometers:</label>
                  <span>{selectedRequest.kilometers || ''}</span>
                </div>
                <div className="right-side">
                  <label>Quantity Requested (liters):</label>
                  <span>{selectedRequest.quantityRequested || ''}</span>
                </div>
              </div>
              <div className="view-form-group">
                <div className="left-side">
                  <label>Average Km/l:</label>
                  <span>{selectedRequest.average || ''}</span>
                </div>
                <div className="left-side">
                  <label>Quantity Received (liters):</label>
                  <input
                    type="number"
                    value={quantityReceived}
                    onChange={(e) => setQuantityReceived(e.target.value)}
                    placeholder="Update Quantity Received"
                  />
                </div>
              </div>
              <div className="view-form-group">
                <div className="detail-row">
                  {selectedRequest && selectedRequest.file ? (
                    <div className='file-uploaded'>
                      <label>Previous Destination file:</label>
                      <a href={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.file}`} target="_blank" rel="noopener noreferrer">
                        <FaEye /> View File
                      </a>
                    </div>
                  ) : (
                    <p>No file uploaded</p>
                  )}
                </div>
              </div>
              <hr />
              <div className="fuel-signatures">
                <div className="hod-signature">
                  <h4>Head Of department:</h4>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ''}</span>
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                </div>
                <div className='logistic-signature'>
                
                  {logisticUsers.map(user => (
                    <div key={user._id} className="logistic-signature">
                        <h4>Logistic Office:</h4>
                        <label htmlFor="">Verified By:</label>
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} />
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="daf-signature">
                 
                  {dafUsers.map(user => (
                    <div key={user._id} className="daf-signature">
                       <h4>DAF:</h4>
                       <label htmlFor="">Approved By:</label>
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} 
                        className=''/>
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="action-buttons">
            
              </div>
            </form>
          </div>
             </div>
       
      )}
    </div>
  );
};

export default FuelRequisitionForm;