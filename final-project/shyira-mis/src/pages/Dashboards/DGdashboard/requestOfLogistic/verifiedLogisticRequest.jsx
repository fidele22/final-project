import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './styling.css';

const ForwardedRequests = () => {
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSigned, setIsSigned] = useState(false); // New state to track if signed
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 



  
  
  
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




      fetchForwardedRequests ();
      fetchUser ();
    }, [token]);

  const fetchForwardedRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/verified-item-order`);
      // Sort requests by createdAt in descending order
      const sortedRequests = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setForwardedRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching forwarded requests:', error);
    }
  };

  const handleRequestClick = (requestId) => {
    const request = forwardedRequests.find(req => req._id === requestId);
    setSelectedRequest(request);
    setFormData(request);
  };

  const handleRejectRequest = async () => {
    const confirmReject = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      customClass: {
        popup: 'custom-swal',
      }
    });

    if (confirmReject.isConfirmed) {
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/rejectItemOrder/${selectedRequest._id}`);
        setForwardedRequests(prevRequests => prevRequests.filter(req => req._id !== selectedRequest._id));
        setSelectedRequest(null);
        Swal.fire({
          title: 'Success',
          text: 'Rejecting logistic item order successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal',
          }
        });
      } catch (error) {
        console.error('Error rejecting request:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to rejected item order',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal',
          }
        });
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
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

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value,
    };
    setFormData(prevState => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/${selectedRequest._id}`, formData);
      setSelectedRequest(response.data);
      setIsEditing(false);
      setForwardedRequests(prevRequests =>
        prevRequests.map(req => (req._id === response.data._id ? response.data : req))
      );
      alert('Requisition updated successfully');
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (!isSigned) {
  
      Swal.fire({
        title: 'Error!',
        text: 'You must sign before approving this requistion.',
        icon: 'error',
        confirmButtonText: 'OK',
  
      });
  
      return;
  
    }
    const confirmReject = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to verify this requisition, You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!',
        customClass: {
          popup: 'custom-swal',
        }
      });
  
      if (confirmReject.isConfirmed) {
        try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/approvedItemOrder/${selectedRequest._id}`,{
      approvedBy: {
        firstName: user.firstName,
        lastName: user.lastName,
        signature: user.signature
      }
    });
    setSelectedRequest(response.data);
      Swal.fire({
        title: 'Success',
        text: 'Verifying logistic item order successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        }
      });
    } catch (error) {
      console.error('Error approving request:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to verify item order',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        }
    });
}
}
};

const handleSignClick = () => {

    setIsSigned(true); // Set signed state to true when sign button is clicked
  
  };
  
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredRequests = forwardedRequests.filter(request => {
    return request.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className={`verified-requist ${selectedRequest ? 'dim-background' : ''}`}>
      <div className="order-navigation">
        <div className='navigation-title'>
          <h2>Requisition from logistic office for item</h2>
        </div>
        
        <div className='statusFilter'>
          <label>Filter/search by Status: </label>
          <input
            type="text"
            id="statusFilter"
            value={filterStatus}
            onChange={handleFilterChange}
            placeholder="Enter status (e.g., Pending, Approved)"
          />
        </div>

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
            {currentRequests.map((request, index) => (
              <tr key={request._id} onClick={() => handleRequestClick(request._id)}>
                <td>{index + 1 + indexOfFirstRequest}</td>
                <td>Request of item from logistic office prepared by {request.logisticName}</td>
                <td>{request.supplierName}</td>
                <td>{new Date(request.createdAt).toDateString()}</td>
                <td>
                  <b className={`status-${request.status?.toLowerCase()}`}>{request.status}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
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
            {isEditing ? (
              <form>
                <h2>Edit Request</h2>
                <div className="request-recieved-heading">
                  <h1>WESTERN PROVINCE</h1>
                  <h1>DISTRICT: NYABIHU</h1>
                  <h1>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h1>
                  <h1>DEPARTMENT: LOGISTIC OFFICE</h1>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Item Name</th>
                      <th>Quantity Requested</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <input
                            type="text"
                            name="itemName"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(idx, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="quantityRequested"
                            value={item.quantityRequested}
                            onChange={(e) => handleItemChange(idx, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="totalAmount"
                            value={item.totalAmount}
                            onChange={(e) => handleItemChange(idx, e)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className='approve-request-btn' onClick={handleUpdateSubmit}>Update Request</button>
                <button type="button" className='cancel-btn' onClick={handleCancelClick}>Cancel</button>
              </form>
            ) : (
              <>
                <div className="form-navigation">
                  <button className='verify-requisition' onClick={handleVerifySubmit}>Approve Request</button>
                  <button className='reject-request' onClick={handleRejectRequest}>Reject Request</button>
                  <button className='sign-button' onClick={handleSignClick}>Sign</button>
                  <button></button>
                  <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
                </div>
                <div className="image-request-recieved">
                  <img src="/image/logo2.png" alt="Logo" className="logo" />
                </div>
                <div className='date-done'>
                  <label htmlFor="">{new Date(selectedRequest.date).toDateString()}</label>
                </div>
                <div className="request-recieved-heading">
                  <h1>WESTERN PROVINCE</h1>
                  <h1>DISTRICT: NYABIHU</h1>
                  <h1>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h1>
                  <h1>DEPARTMENT: LOGISTIC OFFICE</h1>
                </div>

                <h2>REQUISITION FORM OF LOGISTIC</h2>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Item Name</th>
                      <th>Quantity Requested</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.itemName}</td>
                        <td>{item.quantityRequested}</td>
                        <td>{item.price}</td>
                        <td>{item.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="signature-section">
                <div className='logistic-signature'>
                <h4>Logistic Office</h4>
                <label>Prepared By:</label>
                <span>{selectedRequest.logisticName || ''}</span><br />
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.logisticSignature}`} alt="HOD Signature"
                className='signature-img' />
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
           {isSigned && (
         <div className="daf-signature">
           <h4>DG Office</h4>
           <label htmlFor="dgName">Verified By:</label>
           <p>{user.firstName} {user.lastName}</p>
           {user.signature ? (
             <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt="Signature" className='signature-img' />
           ) : (
             <p>No signature available</p>
           )}
       </div>
     )}
    
                  </div>
            
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForwardedRequests;