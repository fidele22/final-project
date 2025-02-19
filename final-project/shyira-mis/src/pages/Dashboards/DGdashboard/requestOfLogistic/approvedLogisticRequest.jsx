// src/components/ApprovedRequests.js
import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaEdit,FaTimes, FaTimesCircle, FaCheck,
     FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useDropzone } from 'react-dropzone';
import '../../logisticdashboard/contentCss/itemrequisition.css';


const ApprovedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fileAttachments, setFileAttachments] = useState([]);
  const [searchParams, setSearchParams] = useState({
    department: '',
    date: ''
  });

  const [logisticUsers, setLogisticUsers] = useState([]);
  const [dafUsers, setDafUsers] = useState([]);
  const [dgUsers, setDgUsers] = useState([]);


  useEffect(() => {
    fetchApprovedRequests();
    fetchLogisticUsers();
    fetchDafUsers();
    fetchDgUsers();
  }, []);

  const fetchLogisticUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/logistic-users`);
      setLogisticUsers(response.data);
    } catch (error) {
      console.error('Error fetching logistic users:', error);
    }
  };

  const fetchDafUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/daf-users`);
      setDafUsers(response.data);
    } catch (error) {
      console.error('Error fetching daf users:', error);
    }
  };
  const fetchDgUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/DG-users`);
      setDgUsers(response.data);
    } catch (error) {
      console.error('Error fetching daf users:', error);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/approved-order`);
      setRequests(response.data);
      setFilteredRequests(response.data); 
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    }
  };

  const handleRequestClick = async (requestId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/approved/${requestId}`);
      setSelectedRequest(response.data);
      setApprovedRequests(response.data);

      // Fetch associated file attachments
      const attachmentsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/attachments/${requestId}`);
      setFileAttachments(attachmentsResponse.data);

      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/approve/${requestId}`, { clicked: true });
      fetchApprovedRequests();
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSearchRequest = (e) => {
    e.preventDefault();
    const { department, date } = searchParams;
    const filtered = requests.filter(request => {
      return (!department || request.department.toLowerCase().includes(department.toLowerCase())) &&
             (!date || new Date(request.date).toDateString() === new Date(date).toDateString());
    });
    setFilteredRequests(filtered);
  };

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

      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(data, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('logistic-item-requisition-form.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };


  return (
    <div className="request">
     
      <form onSubmit={handleSearchRequest} >
        <div className="search-form">
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
        <h2>Approved Order not signed as Recieved</h2>
        </div>
        <ul>
          {filteredRequests.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form of logistic <b>{request.department}</b> Approved on {new Date(request.createdAt).toDateString()}
              <label htmlFor=""><FaCheckCircle/> Approved</label>
              </p>

            </li>
          ))}
        </ul>
      </div>
     
      {selectedRequest && (
        <div className="request-details-overlay">
          <div className="form-navigation">
            <button className='request-dowload-btn' onClick={downloadPDF}>Download Pdf</button>
            {/* <button className='reject-btn' >Reject</button>  */}
            <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
          </div>  
          
          <div className="request-details" >
            <div id='pdf-content'>
              <div className="image-request-recieved">
                <img src="/image/logo2.png" alt="Logo" className="logo" />
              </div>
              <div className="request-recieved-heading">
                <h1>WESTERN PROVINCE</h1>
                <h1>DISTRIC: NYABIHU</h1>
                <h1>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h1>
                <h1>DEPARTMENT:LOGISTIC OFFICE</h1>

              </div>
              <h2>REQUISITON FORM OF LOGISTIC</h2>
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
                
                  {logisticUsers.map(user => (
                    <div key={user._id} className="logistic-signature">
                        <h4>Logistic Office:</h4>
                        <label htmlFor="">Prepared By:</label>
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`}
                        className='signature-img' />
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className='daf-signature'>
               
                  {dafUsers.map(user => (
                    <div key={user._id} className="daf-signature">
                         <h4>DAF Office:</h4>
                         <label htmlFor="">Verified By:</label>
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} 
                        className='signature-img'/>
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className='daf-signature'>
               
                  {dgUsers.map(user => (
                    <div key={user._id} className="daf-signature">
                         <h4>DG Office:</h4>
                         <label htmlFor="">Approved By:</label>
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} 
                        className='signature-img'/>
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="logo" />
        </div>
            </div> 
          </div> 
        </div> 
      )}
   
    </div>
  );
};

export default ApprovedRequests;
