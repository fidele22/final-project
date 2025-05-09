import React, { useState, useEffect } from 'react';
import { FaQuestionCircle,FaTimesCircle, FaEdit, FaCheckCircle,FaTimes, FaTrash,FaCheck } from 'react-icons/fa';
import axios from 'axios';
//import './ViewRequest.css'; // Import CSS for styling


const ForwardedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logisticUsers, setLogisticUsers] = useState([]);

  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [modalMessage, setModalMessage] = useState(''); //
  const [isSuccess, setIsSuccess] = useState(true);

    // Search parameters state
    const [searchParams, setSearchParams] = useState({
      department: '',
      date: ''
    });
  

  useEffect(() => {
    fetchForwardedRequests();
    fetchLogisticUsers(); // Fetch logistic users on component mount
  }, []);
  const fetchLogisticUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/logistic-users');
      setLogisticUsers(response.data);
    } catch (error) {
      console.error('Error fetching logistic users:', error);
    }
  };

  const fetchForwardedRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/forwardedrequests/items');
      setForwardedRequests(response.data);
    } catch (error) {
      console.error('Error fetching forwarded requests:', error);
    }
  };

  const handleRequestClick = (requestId) => {
    const request = forwardedRequests.find(req => req._id === requestId);
    setSelectedRequest(request);
    setFormData(request);
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
      const response = await axios.put(`http://localhost:5000/api/forwardedrequests/${selectedRequest._id}`, formData);
      setSelectedRequest(response.data);
      setIsEditing(false);
      setForwardedRequests(prevRequests =>
        prevRequests.map(req => (req._id === response.data._id ? response.data : req))
      );

      // Forward the updated request to the approved collection
     // await axios.post(`http://localhost:5000/api/forwardedrequests/approved/${selectedRequest._id}`);
     
      setModalMessage('requistion updated successfully');
      setIsSuccess(true); // Set the success state
      setShowModal(true); // Show the modal
    } catch (error) {
      console.error('Error updating request:', error);
      setModalMessage('Failed to update requisition');
      setIsSuccess(false); // Set the success state
      setShowModal(true); // Show the modal
    }
  };

 //
 const handleApproveSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`http://localhost:5000/api/forwardedrequests/approved/${selectedRequest._id}`);
     
    setModalMessage('requistion Approved successfully');
    setIsSuccess(true); // Set the success state
    setShowModal(true); // Show the modal
    fetchForwardedRequests('')
  } catch (error) {
    console.error('Error updating request:', error);
    setModalMessage('Failed to Approve requisition');
    setIsSuccess(false); // Set the success state
    setShowModal(true); // Show the modal
  }
};


  //fetching signature
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);
//search logic

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

  if (!user) return <p>Loading...</p>;

  return (
    <div className={`verified-requist ${selectedRequest ? 'dim-background' : ''}`}>
      
      
      <div className="verified-request-navigation">


      <h2>Item Requisition Verified</h2>

      <form onSubmit={handleSearchSubmit} className="search-form">
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
      </form>
        <ul>
          {forwardedRequests.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
          Requisition Form from department of <b>{request.department}</b> verified  on {new Date(request.updatedAt).toDateString()}
          {/*<span>{!request.clicked ? 'New Request' : ''}</span> */}<label htmlFor=""><FaCheck /> Verified</label>
        </p>
            </li>
          ))}
        </ul>
      </div>
      
      {selectedRequest && (
        <div className="request-details-overlay">
          <div className="request-details">
           
              
               <div className="form-navigation">
            
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
            <h1>DISTRIC: NYABIHU</h1>
            <h1>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h1>
            <h1>DEPARTMENT: <span>{selectedRequest.department}</span>  </h1>
           

          </div>

            <h2>REQUISITON FORM</h2>
              
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
 {/* Modal pop message on success or error message */}
 {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {isSuccess ? (
              <div className="modal-success">
                <FaCheckCircle size={54} color="green" />
                <p>{modalMessage}</p>
              </div>
            ) : (
              <div className="modal-error">
                <FaTimesCircle size={54} color="red" />
                <p>{modalMessage}</p>
              </div>
            )}
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

                <div className="daf-signature-section">
                <div className="hod-signature">
                  <h3 htmlFor="hodName">Name of HOD:</h3>
                  <label htmlFor="">Prepared By:</label>
                     <p >{selectedRequest.hodName}</p>
              
                    {selectedRequest.hodSignature ? (
                      <img src={`http://localhost:5000/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                    ) : (
                      <p>No HOD signature available</p>
                    )}

                  </div>
                  <div className='logistic-signature'>
                  <h3>Logistic Office:</h3>
                  <label htmlFor="">verified By:</label>
                    {logisticUsers.map(user => (
                      <div key={user._id} className="logistic-user">
                        <p>{user.firstName} {user.lastName}</p>
                        {user.signature ? (
                          <img src={`http://localhost:5000/${user.signature}`}  />
                        ) : (
                          <p>No signature available</p>
                        )}
                      </div>
                    ))}
                  </div>
                 
                </div>
             
                


            
        
          </div>
        </div>
      )}
    </div>
  );
};

export default ForwardedRequests;
