import React, { useEffect, useState } from 'react';
import { FaEye, FaEdit,FaTimes, FaTimesCircle, FaCheck,
  FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2'; 
//import '../contentCss/viewfuelrequest.css';

const FuelRequisitionForm = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 
  const [FormData, setFormData] = useState({
    items: [] // 
});




  useEffect(() => {

    fetchUser();
    fetchRequisitions();
  }, []);

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
  
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/approvedfuel`);
        setRequisitions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching requisitions:', error);
        setError('Failed to fetch requisitions');
        setLoading(false);
      }
    };



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


    // Validate quantityReceived if editing

    if (name === "quantityReceived" && parseInt(value) > parseInt(selectedRequest.quantityRequested)) {

      Swal.fire({

        title: 'Error!',
        text: 'Quantity received cannot be greater than quantity requested.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        }

      });

      return; // Prevent state update if validation fails

    }


    // Update FormData directly

    setFormData((prevData) => ({

      ...prevData,

      [name]: value, // Update the specific field

    }));

  };

 

  const handleReceiveSubmit = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to verify this requisition with signing?',
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
          // Send a PUT request to update the requisition
          const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/receivefuel/${selectedRequest._id}`, {
            receivedBy: {
              firstName: user.firstName,
              lastName: user.lastName,
              signature: user.signature
            },
            clicked: true // Include any other fields you want to update
          });
  
          // Show success message using SweetAlert2
          Swal.fire({
            title: 'Success!',
            text: 'Requisition marked as received successfully',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal',
            }
          });
  
          // Refetch requisitions after verification

          fetchRequisitions(); 
          setSelectedRequest(null); // Close the details view
  
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

const handleRejectRequest = async () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to reject this fuel requisition with signing?,',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Reject it!',
    customClass: {
      popup: 'custom-swal', // Apply custom class to the popup
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/fuel-requisition/reject/${selectedRequest._id}`);
    setRequisitions(requisitions.filter(req => req._id !== selectedRequest._id));
    setSelectedRequest(null);
// Show error message using SweetAlert2
    Swal.fire({
      title: 'Success',
      text: 'Fuel Requisition rejected successfully!!',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'custom-swal', // Apply custom class to the popup
      }
    });
  

 
  } catch (error) {
    console.error('Error rejecting requisition:', error);

     // Show error message using SweetAlert2
     Swal.fire({
      title: 'Error',
      text: 'Failed to reject requisition.',
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
  const handleCloseClick = () => {
    setSelectedRequest(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fuel-requisition-form">
      <div className="order-navigation">
      <div className="navigation-title">
          <h2>Requisition of fuel from different users</h2>
        </div>
        <ul>

          {requisitions.length === 0 ? (
          
            <li>No approved fuel requisition available at this moment </li> // Display message if no requisitions
          ) : (
            requisitions.slice().reverse().map((request, index) => (
              <li key={index}>
                <p onClick={() => handleRequestClick(request._id)}>
                  Fuel requisition Form requested by {request.hodName} done on {new Date(request.RequestedDate).toDateString()}
          
                </p>
          
              </li>
          
            ))
          
          )}
          
          </ul>
      </div>

      {selectedRequest && (
        <div className="fuel-request-details-overlay">
      

          <div className="fuel-request-details-content">
          <div className="fixed-nav-bar">
          <button type="button" className='verify-btn' onClick={handleReceiveSubmit}>Mark as received</button>
            <button type="button" className='reject-request-btn' onClick={handleRejectRequest}>Reject</button>
            <button type="button" className='close-btn' onClick={handleCloseClick}><FaTimes /></button>
          </div>
          <div className="imag-logo">
          <img src="/image/logo2.png" alt="Logo" className="log"  />
          </div>

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
                  <span>{selectedRequest.quantityRequested || ''} liters</span>
                </div>
              </div>
              <div className="view-form-group">
                <div className="left-side">
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
                <div className="left-side">
                  <div className="quantity-recieved-field">
                  <label>Average Km/l:</label>
                  <span>{selectedRequest.average || ''}</span>
                  </div>
              
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
              <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="logo" />
         </div>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default FuelRequisitionForm;
