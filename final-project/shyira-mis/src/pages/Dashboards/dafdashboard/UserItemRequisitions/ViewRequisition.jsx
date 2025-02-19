import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaCheckCircle,FaEdit,FaTimesCircle, FaTimes, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2'; 
//import '../contentCss/itemrequisition.css'

const LogisticRequestForm = () => {

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
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/verified-requisition`);
      setRequests(response.data);
      setFilteredRequests(response.data); // Initialize filteredRequests with all requests
    } catch (error) {
      console.error('Error fetching requests:', error);
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
  

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = editFormData.items.map((item, idx) => {
      if (idx === index) {
        // Check if the input is for "Quantity Received" and validate
        if (name === "quantityReceived" && parseInt(value) > parseInt(item.quantityRequested)) {
          Swal.fire({
            title: 'Error!',
            text: 'Quantity received cannot be greater than quantity requested.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal', // Apply custom class to the popup
            }
          });
          return item; // Don't update this field if the value is invalid
        }
        // Update the field if the validation passes
        return { ...item, [name]: value };
      }
      return item;
    });
    setEditFormData({
      ...editFormData,
      items: updatedItems
    });
  };
  

  const handleUpdateSubmit = async () => {
  
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/${selectedRequest._id}`, editFormData, { clicked: true });
      
       // Show success message using SweetAlert2
       Swal.fire ({
        title: 'Success!',
        text: 'requisition updated successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
      fetchRequests(); // Refresh the list of requests
      setSelectedRequest(null); // Close the details view

     
    } catch (error) {
      console.error('Error updating request:', error);
       // Show error message using SweetAlert2
       Swal.fire({
        title: 'Error!',
        text: 'Failed to update requisition',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
    }
  };
//send verified
const handleApprovedSubmit = async () => {
  
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to approve this requisition with signing?,',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, approve it!',
    customClass: {
      popup: 'custom-swal', // Apply custom class to the popup
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/approve/${selectedRequest._id}`, { 
      
      approvedBy: {
        firstName: user.firstName,
        lastName: user.lastName,
        signature: user.signature
      },
      clicked: true });
  
      // Show success message using SweetAlert2
      Swal.fire ({
        title: 'Success!',
        text: 'requisition approved successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
    fetchRequests(); // Refresh the list of requests
    setSelectedRequest(null); // Close the details view

  } catch (error) {
    console.error('Error updating request:', error);
      // Show error message using SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: 'Failed to approve requisition',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
  }
}
});
};
const handleSignClick = () => {

  setIsSigned(true); // Set signed state to true when sign button is clicked

}; 


  // Function to generate and download PDF
  const downloadPDF = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) {
      console.error('Element with ID pdf-content not found');
      return;
    }
  
    try {
      // Use html2canvas to capture the content of the div, including the image signatures
      const canvas = await html2canvas(input, {
        allowTaint: true,
        useCORS: true, // This allows images from different origins to be included in the canvas
      });
  
      const data = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      // Add the image content into the PDF and download
      pdf.addImage(data, 'PNG', 10, 10, pdfWidth - 20, pdfHeight); // Adjust the margins if needed
      pdf.save('requisition-form-with-signatures.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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

  const handleRejectClick = async (requestId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this requisition?, you will not be able to revert.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!',
      customClass: {
        popup: 'custom-swal', // Apply custom class to the popup
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/rejected/${requestId}`, { clicked: true });
      
       // Show success message using SweetAlert2
       Swal.fire ({
        title: 'Success!',
        text: ' requisition rejected Successful!!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
      fetchRequests(); // Refresh the list of requests
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error marking request as received:', error);
   
         // Show error message using SweetAlert2
         Swal.fire({
          title: 'Error!',
          text: 'Failed to reject this requisition',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
    }
  }
});

  };
  if (!user) return <p>Loading...</p>;

  return (
    <div className={`request ${selectedRequest ? 'dim-background' : ''}`}>


      <form onSubmit={handleSearchSubmit}>
        <div className="search-form">
        <div className='search-department'>
        <label htmlFor="">Search by department</label>
       <input
          type="text"
          name="department"
          placeholder="Search by department"
          value={searchParams.department}
          onChange={handleSearchChange}
        />
       </div>
      
        <div className='search-date'>
        <label htmlFor="">Search by date</label>
        <input
          type="date"
          name="date"
          placeholder="Search by date"
          value={searchParams.date}
          onChange={handleSearchChange}
        />
        </div>
        
        <button type="submit" className='search-btn'>Search</button>
        </div>
       
      </form>
      <div className="order-navigation">
        <div className="navigation-title">
          <h2>Requisition of items form different department</h2>
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
                        <td>
                          <input 
                            type="text" 
                            name="itemName" 
                            value={item.itemName} 
                       
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            name="quantityRequested" 
                            value={item.quantityRequested} 
                          
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            name="quantityReceived" 
                            value={item.quantityReceived} 
                            onChange={(e) => handleItemChange(idx, e)} 
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            name="observation" 
                            value={item.observation} 
                            onChange={(e) => handleItemChange(idx, e)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

               
                <hr />
               
                <div className="buttons">
                <button className='submit-an-update' onClick={handleUpdateSubmit}>update</button>
                <button className='update-cancel-btn' onClick={handleCancelEdit}>Cancel</button>
                
                </div>
               
                
                
              </>
             
            ) : (
       
              <>
          <div className="form-navigation">
         
          <button className='verify-requisition' onClick={ handleApprovedSubmit}>Approve Request</button>
          <button className='request-dowload-btn' onClick={downloadPDF}>Download Pdf</button>
          <button className='request-edit-btn' onClick={handleEditClick}>Edit</button>
          <button onClick={() => handleRejectClick(selectedRequest._id)} className="reject-button">Reject request </button>
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
                  <label className="signature-title">Name of head of{selectedRequest.department}:</label>
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

                  {isSigned && (
         <div className="daf-signature">
           <h4>DAF Office</h4>
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

export default LogisticRequestForm;
