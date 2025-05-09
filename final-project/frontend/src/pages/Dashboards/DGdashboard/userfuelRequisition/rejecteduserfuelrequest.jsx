// RejectedFuelRequisitionForm.js
import React, { useEffect, useState } from 'react';
import { FaEye,FaTimes } from 'react-icons/fa';
import axios from 'axios';
//import './stylingcss.css'

const RejectedFuelRequisitionForm = () => {
  const [rejectedRequisitions, setRejectedRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Set items per page
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    // Update total pages when filteredRequests change
    setTotalPages(Math.ceil(rejectedRequisitions.length / itemsPerPage));
  }, [rejectedRequisitions, itemsPerPage]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/rejectedfuel`);
        
        if (Array.isArray(response.data)) {
          setRejectedRequisitions(response.data);
        } else {
          console.error('Expected array but received:', response.data);
          setRejectedRequisitions([]);
        }
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
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/rejected/${requestId}`);
      setSelectedRequest(response.data);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleCloseClick = () => {
    setSelectedRequest(null);
  };
 // Pagination helpers
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentRequisition = rejectedRequisitions.slice(indexOfFirstItem, indexOfLastItem);

 const nextPage = () => {
   if (currentPage < totalPages) {
     setCurrentPage(currentPage + 1);
   }
 };

 const prevPage = () => {
   if (currentPage > 1) {
     setCurrentPage(currentPage - 1);
   }
 };
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="rejected-fuel-requisition-form">
      <h4>List of Fuel Requisitions Rejected</h4>
      <div className="navigate-fuel-request">
        <ul>
          {currentRequisition.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                FueL Requisition Form  of user {request.hodName} requested on {new Date(request.createdAt).toDateString()}  and rejected on {new Date(request.rejectedAt).toDateString()}
              <span className='badge-status'>Rejected</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="pagination-buttons">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>

      {selectedRequest && (
        <div className="fuel-request-details-overlay">
          <div className="fixed-nav-bar">
            <button type="button" className="close-btn" onClick={handleCloseClick}><FaTimes /></button>
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
                  <span>{selectedRequest.quantityReceived || ''}</span>
                </div>
              </div>
              <div className="view-form-group">
                <div className="detail-row">
                  {selectedRequest && selectedRequest.file ? (
                    <div className="file-uploaded">
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
                  <h4>Head Of Department:</h4>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ''}</span>
                  {selectedRequest.hodSignature && (
                    <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                  )}
                </div>
              
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedFuelRequisitionForm;
