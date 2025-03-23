import React, { useState, useEffect } from "react";
import {
  FaQuestionCircle,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaTimesCircle,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const LogisticRequestForm = () => {
  const [users, setUsers] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser ] = useState({ firstName: "", lastName: "" });
  const [editFormData, setEditFormData] = useState({
    department: "",
    items: [],
    logisticName: "",
    logisticSignature: "",
  });

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchRequests();
    fetchUserProfile();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/fuelstatus`);
      // Reverse the order of requests
      setRequests(response.data.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      setError('Failed to fetch requisitions');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleRequestClick = (requestId) => {
    const request = requests.find((req) => req._id === requestId);
    const safeRequest = {
      ...request,
      verifiedBy: request.verifiedBy || { firstName: '', lastName: '' },
      approvedBy: request.approvedBy || { firstName: '', lastName: '' },
      receivedBy: request.receivedBy || { firstName: '', lastName: '' },
    };
    setSelectedRequest(safeRequest);
    setEditFormData(request);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(selectedRequest);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = editFormData.items.map((item, idx) =>
      idx === index ? { ...item, [name]: value } : item
    );
    setEditFormData((prevState) => ({ ...prevState, items: updatedItems }));
  };

  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    const canvas = await html2canvas(input);
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(data, "PNG", 10, 10);
    pdf.save("requisition-form.pdf");
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus ? request.status.toLowerCase() === filterStatus.toLowerCase() : true;
    const matchesDate = filterDate ? new Date(request.createdAt).toDateString() === new Date(filterDate).toDateString() : true;
    return matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCloseClick = () => {
    setSelectedRequest(null);
  };

  return (
    <div className={`requisit ${selectedRequest ? "dim-background" : ""}`}>
      <div className="status-board">
        <h2>User Fuel Requisition Status Board</h2>

        <div className="filter-section">
       
           <div>
            <label htmlFor="">search by requested date</label>
            <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
           </div>
           <div>
            <label htmlFor="">Search by status</label>
            <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="rejected">Rejected</option>
            {/* Add more status options as needed */}
          </select>
          </div>
        </div>

        <table className="requests-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Request Type</th>
              <th>Done On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request, index) => (
              <tr
                key={request._id}
                onClick={() => handleRequestClick(request._id)}
              >
                <td>{index + 1 + indexOfFirstRequest}</td>
                <td>
                  Fuel Requisition from service of {request.service} and prepared by{" "}
                  {request.hodName}
                </td>
                <td>{new Date(request.createdAt).toDateString()}</td>
                <td>
                  <b className={`status-${request.status?.toLowerCase()}`}>
                    {request.status}
                  </b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>

      {selectedRequest && (
        <div className="fuel-request-details-overlay">
          <div className="fixed-nav-bar">
            <button type="button" className='close-btn' onClick={handleCloseClick}>Close</button>
          </div>

          <div className="fuel-request-details-content">
          <div className="fuel-img-logo">
          <img src="/image/logo2.png" alt="Logo" className="log"   />
          </div>

            <h3>Fuel Requisition Form</h3>
 <div className="form-columns">
            
            {/* Left Column */}
            
            <div className="form-column">
            
              <div className="form-group">
            
               
              <label>Requester Name: <span>{selectedRequest.requesterName || ''}</span></label>
            
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="carPlaque">Plaque of Car:</label>
            
                <span>{selectedRequest.carPlaque || ''}</span>
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="kilometers">Kilometers:</label>
            
                <span>{selectedRequest.kilometers || ''}</span>
            
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="remainingliters">Remaining Liters:</label>
                <span>{selectedRequest.remainingLiters || ''}</span>
            
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="quantityRequested">Quantity Requested (liters):</label>
                <span>{selectedRequest.quantityRequested || ''} liters</span>
            
              </div>
            
            </div>
            
            
            {/* Right Column */}
            
            <div className="form-column">
            <div className="form-group">
            
            <label>Date of Request:</label>
            
             <span>{new Date(selectedRequest.RequestedDate || '').toDateString()}</span>
            
            </div>
              <div className="form-group">
            
                   <label>Quantity Received (liters):</label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  name="quantityReceived"
                                  value={FormData.quantityReceived || ''}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                <span>{selectedRequest.quantityReceived || ''} liters</span>
                              )}
            
                             
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="fuelType">Average:</label>
            
                <span>{selectedRequest.average || ''}</span>
            
              </div>
            
            
              <div className="form-group">
            
                <label htmlFor="destination">Previous Destination Report:</label>
             
            
              </div>
            
            
              <div className="detail-row">
            
                {selectedRequest && selectedRequest.file ? (
            
                  <div className='file-uploaded'>
            
                    <a href={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.file}`} target="_blank" rel="noopener noreferrer">
            
                      <FaEye /> View File
            
                    </a>
            
                  </div>
            
                ) : (
            
                  <p>No file uploaded</p>
            
                )}
            
              </div>
              </div>
              </div>
              <hr />

              <div className="signature-section">
                <div className="hod-signature">
                  <h4>Head of Department</h4>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ""}</span>
                  <br />
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`}
                    alt="HOD Signature"
                    className="signature-img"
                  />
                </div>
                <div className="daf-signature">
                  <h4>Logistic Office:</h4>
                  <label>Verified By:</label>
                  <p>
                    {selectedRequest.verifiedBy?.firstName}{" "}
                    {selectedRequest.verifiedBy?.lastName}
                  </p>
                  {selectedRequest.verifiedBy?.signature ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.verifiedBy.signature}`}
                      alt="Verified Signature"
                      className="signature-img"
                    />
                  ) : (
                    <p>Not Signed, i.e not verified</p>
                  )}
                </div>
                <div className="daf-signature">
                  <h4>DAF Office</h4>
                  <label>Approved By:</label>
                  <p>
                    {selectedRequest.approvedBy?.firstName}{" "}
                    {selectedRequest.approvedBy?.lastName}
                  </p>
                  {selectedRequest.approvedBy?.signature ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.approvedBy.signature}`}
                      alt="Approved Signature"
                      className="signature-img"
                    />
                  ) : (
                    <p>Not Signed, i.e not approved</p>
                  )}
                </div>
                <div className="daf-signature">
                  <h4>Head of Department</h4>
                  <label>Received By:</label>
                  <p>
                    {selectedRequest.receivedBy?.firstName}{" "}
                    {selectedRequest.receivedBy?.lastName}
                  </p>
                  {selectedRequest.receivedBy?.signature ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.receivedBy.signature}`}
                      alt="Received Signature"
                      className="signature-img"
                    />
                  ) : (
                    <p>Not Signed, i.e not received</p>
                  )}
                </div>
              </div>
        
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticRequestForm;