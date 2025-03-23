import React, { useState, useEffect } from "react";
import { FaQuestionCircle,
  FaCheckCircle,
  FaEdit,
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
  const [filterDepartment, setFilterDepartment] = useState("");
const [filterDate, setFilterDate] = useState("");
const [filterStatus, setFilterStatus] = useState("");


  const [editFormData, setEditFormData] = useState({
    department: "",
    items: [],
    logisticName: "",
    logisticSignature: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchRequests();
    fetchUserProfile();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/UserRequest`
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
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
    setSelectedRequest(request);
    setEditFormData(request);
  };


  const filteredRequests = requests.filter((request) => {
    const statusMatch = filterStatus ? request.status.toLowerCase().includes(filterStatus.toLowerCase()) : true;
    const departmentMatch = filterDepartment ? request.department.toLowerCase().includes(filterDepartment.toLowerCase()) : true;
    const dateMatch = filterDate ? new Date(request.createdAt).toISOString().slice(0, 10) === filterDate : true;
  
    return statusMatch && departmentMatch && dateMatch;
  });
  
  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    const canvas = await html2canvas(input);
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(data, "PNG", 10, 10);
    pdf.save("requisition-form.pdf");
  };


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
  return (
    <div className={`requisit ${selectedRequest ? "dim-background" : ""}`}>
      <div className="status-board">
      <h2>User Item Requisition Status Board</h2>
      <div className="filters">
        <div>
          <label htmlFor="">Filter by department</label>
        <input
    type="text"
    placeholder="Filter by Department"
    value={filterDepartment}
    onChange={(e) => setFilterDepartment(e.target.value)}
  />
        </div>

   <div>
    <label htmlFor="">Filter by Requested Date</label>
   <input
    type="date"
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)}
  />

   </div>
 <div>
  <label htmlFor="">Filter by requisition status</label>
 <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
    <option value="">All Status</option>
    <option value="pending">Pending</option>
    <option value="verified">Verified</option>
    <option value="approved">Approved</option>
    <option value="received">Received</option>
    <option value="rejected">Rejected</option>
  </select>
 </div>
 
</div>

<table className="requests-table">
  <thead>
    <tr>
      <th>No</th>
      <th>Request Type</th>
      <th>Department</th>
      <th>Done On</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
  {[...currentRequests]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .map((request, index) => (
    <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
      <td>{index + 1 + indexOfFirstRequest}</td>
      <td>
        Requisition from service of {request.service} and prepared by{" "}
        {request.hodName}
      </td>
      <td>{request.department}</td>
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
        <div className="request-details-overlay" >
            <div className="form-navigation">
          <button className="request-dowload-btn" onClick={downloadPDF}>
            Download Pdf
          </button>
       
          <label
            className="request-close-btn"
            onClick={() => setSelectedRequest(null)}
          >
            <FaTimes />
          </label>
        </div>
        <div id="pdf-content" className="request-details" >

          <div className="image-request-recieved">
            <img src="/image/logo2.png" alt="Logo" className="logo" />
          </div>
          <div className="request-recieved-heading">
            <div className="date-done">
              <label>{new Date(editFormData.date).toDateString()}</label>
            </div>
            <label>WESTERN PROVINCE</label>
            <label>DISTRIC: NYABIHU</label>
            <label>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</label>
            <label>DEPARTMENT: <span>{editFormData.department}</span> </label>
            <label>SERVICE: <span>{editFormData.service}</span> </label>
          </div>

          <u>
            <h2>REQUISITION FORM</h2>
          </u>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Item Name</th>
                <th>Quantity Requested</th>
                <th>Quantity Received</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {editFormData.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.itemName}</td>
                  <td>{item.quantityRequested}</td>
                  <td>{item.quantityReceived}</td>
                  <td>{item.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
                {selectedRequest.verifiedBy.firstName}{" "}
                {selectedRequest.verifiedBy.lastName}
              </p>
              {selectedRequest.verifiedBy.signature ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.verifiedBy.signature}`}
                  alt="Verified Signature"
                  className="signature-img"
                />
              ) : (
                <p>Not Signed,i.e not verified</p>
              )}
            </div>
            
            <div className="daf-signature">
              <h4>DAF Office</h4>
              <label>Approved By:</label>
              <p>
                {selectedRequest.approvedBy.firstName}{" "}
                {selectedRequest.approvedBy.lastName}
              </p>
              {selectedRequest.approvedBy.signature ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.approvedBy.signature}`}
                  alt="Approved Signature"
                  className="signature-img"
                />
              ) : (
                <p>Not Signed,i.e not approved</p>
              )}
            </div>
            <div className="daf-signature">
              <h4>Head of Department</h4>
              <label>Received By:</label>
              <p>
                {selectedRequest.receivedBy.firstName}{" "}
                {selectedRequest.receivedBy.lastName}
              </p>
              {selectedRequest.receivedBy.signature ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.receivedBy.signature}`}
                  alt="Received Signature"
                  className="signature-img"
                />
              ) : (
                <p>Not Signed,i.e not received</p>
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
