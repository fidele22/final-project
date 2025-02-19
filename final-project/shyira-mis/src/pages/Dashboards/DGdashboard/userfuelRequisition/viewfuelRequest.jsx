import React, { useEffect, useState } from 'react';
import { FaEye, FaEdit,FaTimes, FaTimesCircle, FaCheck,
  FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import axios from 'axios';
import '../../logisticdashboard/contentCss/viewfuelrequest.css';

const FuelRequisitionForm = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition`);
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


  const handleRequestClick = async (requestId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/${requestId}`);
      setSelectedRequest(response.data);
      setFormData(response.data);
      setIsEditing(false);

      setRequisitions((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, clicked: true } : req
        )
      );
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/${selectedRequest._id}`, formData);
      setSelectedRequest(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating requisition:', error);
    }
  };

  const handleVerifyClick = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/verify/${selectedRequest._id}`, formData);
      setSelectedRequest(response.data);
      alert('Requisition verified successfully.');
    } catch (error) {
      console.error('Error verifying requisition:', error);
      alert('Failed to verify requisition.');
    }
  };

  const handleCloseClick = () => {
    setSelectedRequest(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fuel-requisition-form">
   
      <div className="order-navigation">
      <div className="navigation-title">
          <h2>Requisition form of fuel from different users [pending]</h2>
        </div>
        <ul>
          {requisitions.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form from {request.department} done on {new Date(request.createdAt).toDateString()}
                {/** <span>{!request.clicked ? 'New Request' : ''}</span>*/}
                
              </p>
            </li>
          ))}
        </ul>
      </div>

      {selectedRequest && (
        <div className="fuel-request-details-overlay">
          <div className="fixed-nav-bar">

            <button type="button" className='close-btn' onClick={handleCloseClick}><FaTimes /></button>
          </div>

          <div className="fuel-request-details-content">
            <h2>Fuel Requisition Form</h2>
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
                  {isEditing ? (
                    <input
                      type="number"
                      name="quantityReceived"
                      value={formData.quantityReceived || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{selectedRequest.quantityReceived || ''}</span>
                  )}
                </div>
              </div>
              <div className="view-form-group">
              
                <div className="left-side">
                  <label>Reason:</label>
                  <span>{selectedRequest.reason || ''}</span>
                </div>
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
                <div className="hod">
                  <h3>Head of department</h3>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ''}</span>
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelRequisitionForm;
