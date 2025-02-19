import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaCheckCircle,FaEdit,FaTimesCircle, FaTimes, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2'; 
import './ViewApprovedRequest.css'

const ApprovedRequestsPage = () => {

  const [users, setUsers] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 
  const [editFormData, setEditFormData] = useState({
    
  
    department: '',
    items: [],
    logisticName: users ? `${user.firstName} ${user.lastName}`:'',
    logisticSignature: '',
    
  });

  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    department: '',
    date: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Get the current tab's ID from sessionStorage
      const currentTab = sessionStorage.getItem('currentTab');
    
      if (!currentTab) {
        setError('No tab ID found in sessionStorage');
        return;
      }
  
      // Retrieve the token using the current tab ID
      const token = sessionStorage.getItem(`token_${currentTab}`);
      if (!token) {
        setError('Token not found');
        return;
      }
  
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/approved-requisition`,
        {
          headers: { Authorization: `Bearer ${token}` } // Send token with request
        }
      );
  
      setRequests(response.data); // Store approved requests in state
      setFilteredRequests(response.data);
    } catch (error) {
      console.error("Error fetching approved requests:", error);
    }
  };
  


  
  const handleRequestClick = async (requestId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/${requestId}`);
      setSelectedRequest(response.data);
      setEditFormData(response.data);
      setIsEditing(false);
  
      
  
      // Update the filtered requests to reflect the clicked status
      setFilteredRequests((prevRequests) =>
        prevRequests.map((req) => req._id === requestId ? { ...req, clicked: true } : req)
      );
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };
  


 
  const handleReceivedSubmit = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to mark as received this requisition with signing?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Receive it!',
      customClass: {
        popup: 'custom-swal',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/receive/${selectedRequest._id}`, { 
            receivedBy: {
              firstName: user.firstName,
              lastName: user.lastName,
              signature: user.signature
            },
            clicked: true 
          });
  
          console.log('Response from API:', response.data); // Log the response
  
          // Show success message using SweetAlert2
          Swal.fire({
            title: 'Success!',
            text: 'Requisition received successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal',
            }
          });
  
          // Refresh the list of requests
          setSelectedRequest(null); // Close the details view
          fetchRequests(); // Ensure this is awaited
          
  
        } catch (error) {
          console.error('Error updating request:', error);
          // Show error message using SweetAlert2
          Swal.fire({
            title: 'Error!',
            text: 'Failed to receive requisition',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal',
            }
          });
        }
      }
    });
  };

const handleSignClick = () => {

  setIsSigned(true); // Set signed state to true when sign button is clicked

}; 

  

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const { department, date } = searchParams;
    const filtered = requests.filter(request => {
      return (!department || request.department.toLowerCase().includes(department.toLowerCase())) &&
             (!date || new Date(request.date).toDateString() === new Date(date).toDateString());
    });
    setFilteredRequests(filtered);
  };


  //fetching signature
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);


  useEffect(() => {
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




   
    fetchUser ();
  }, [token]);



  if (!user) return <p>Loading...</p>;

  return (
    <div className={`request ${selectedRequest ? 'dim-background' : ''}`}>


  
      <div className="order-navigation">
        <div className='approved-requistion-header'>
          <div className="title">
          <h2>Requisition of items that has been approved</h2>
          </div>
         <div className=''>
       <form onSubmit={handleSearchSubmit}>
        <div className="search-field">
        <div className=''>
        <label htmlFor="">Search by date</label>
        <input
          type="date"
          name="date"
          placeholder="Search by date"
          value={searchParams.date}
          onChange={handleSearchChange}
        />
        </div>
        <div>
        <button type="submit" className=''>Filter</button>
        </div>
        </div>
       
      </form> 
      </div>
        </div>
        {filteredRequests.length > 0 ? (
        <ul>
          {filteredRequests.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form of item from <b>{request.department}</b> done on {new Date(request.createdAt).toDateString()}
               
              </p>

            </li>
            
          ))}
        </ul>
      ) : (
  <p>No requests found for the given search criteria.</p>
)}
      </div>
   
      {selectedRequest && (
        <div className="request-details-overlay">
         
          <div className="request-details">
          
            {isEditing ? (
              <>

              </>
             
            ) : (
       
              <>
          <div className="form-navigation">
          <button className='verify-requisition' onClick={ handleReceivedSubmit}>Mark as recieved</button>
          <button className='sign-button' onClick={handleSignClick}>Sign</button>
             <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
          </div>
         <div id="pdf-content">
          <div className="image-request-recieved">
          <img src="/image/logo2.png" alt="Logo" className="logo" />
          </div>
          <div className="request-recieved-heading">
          <div className='date-done'>
            <label htmlFor="">{new Date(editFormData.date).toDateString()}</label>
            </div>
         
            <h1>WESTERN PROVINCE</h1>
            <h1>DISTRIC: NYABIHU</h1>
            <h1>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h1>
            <h1>DEPARTMENT: <span>{editFormData.department}</span> </h1>
            <h1>SERVICE: <span>{editFormData.service}</span> </h1>

          </div>
           
            <u><h2>REQUISITON FORM</h2></u>  
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
                    {selectedRequest.items.map((item, idx) => (
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
                  <label className="signature-title">Name of head of {selectedRequest.department}:</label>
                    {selectedRequest.hodName && <p>{selectedRequest.hodName}</p>}
                    <label htmlFor="hodSignature">Signature:</label>
                    {selectedRequest.hodSignature ? (
                      <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} 
                       alt="HOD Signature" className='signature-img'/>
                    ) : (
                      <p>No HOD signature available</p>
                    )}

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

                  {isSigned && (
         <div className="daf-signature">
            <label className="signature-title">Name of head of {selectedRequest.department}:</label>
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
                <div className='footer-img'>
                   <img src="/image/footerimg.png" alt="Logo" className="logo" />
                </div>
                </div>
              </>
             
            )}
         </div>
         
       </div>
      )}
   
      </div>
    
  );
};

export default ApprovedRequestsPage;
