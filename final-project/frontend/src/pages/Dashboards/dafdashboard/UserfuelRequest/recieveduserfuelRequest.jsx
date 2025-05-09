import React, { useEffect, useState } from 'react';
import { FaEye,FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const FuelRequisitionForm = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState('');
  const [logisticUsers, setLogisticUsers] = useState([]);
  const [dafUsers, setDafUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Set items per page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogisticUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/logistic-users`);
        setLogisticUsers(response.data);
      } catch (error) {
        console.error('Error fetching logistic users:', error);
      }
    };
    fetchLogisticUsers();
  }, []);

  useEffect(() => {
    // Update total pages when filteredRequests change
    setTotalPages(Math.ceil(requisitions.length / itemsPerPage));
  }, [requisitions, itemsPerPage]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/get-recievedfuel`);
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

  useEffect(() => {
    const fetchDafUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/daf-users`);
        setDafUsers(response.data);
      } catch (error) {
        console.error('Error fetching daf users:', error);
      }
    };
    fetchDafUsers();
  }, []);

  const handleRequestClick = async (requestId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/userfuelrequest/receivedfuel/${requestId}`);
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
 const currentItems = requisitions.slice(indexOfFirstItem, indexOfLastItem);

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
    pdf.save('fuel-user-requisition-form-recieved.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fuel-requisition-form">
      <h4>List of Fuel Requisition that has been Recieved</h4>
      <label htmlFor=""> Review requisition was recieved </label>
      <div className="order-navigation">
        <ul>
          {currentItems.slice().reverse().map((request, index) => (
            <li key={index}>
              <p onClick={() => handleRequestClick(request._id)}>
                Requisition Form of Fuel requested by {request.hodName} done on {new Date(request.createdAt).toDateString()} 
                <span className='status-badge'>Recieved</span>
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
          <button className='request-dowload-btn' onClick={downloadPDF}>Download Pdf</button>
            <button type="button" className='close-btn' onClick={handleCloseClick}><FaTimes /></button>
          </div>

          <div className="fuel-request-details-content">
            <div id='pdf-content'>
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
                <div className="hods">
                  <h5>Head Of department:</h5>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ''}</span>
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                </div>
                <div className='logistic-signature'>
                  <h5>Logistic Office:</h5>
                  <label htmlFor="">Verified By:</label>
                  {logisticUsers.map(user => (
                    <div key={user._id} className="logistic-user">
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} />
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="daf-signature">
                  <h5>DAF:</h5>
                  <label htmlFor="">Approved By:</label>
                  {dafUsers.map(user => (
                    <div key={user._id} className="logistic-user">
                      <p>{user.firstName} {user.lastName}</p>
                      {user.signature ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt={`${user.firstName} ${user.lastName} Signature`} />
                      ) : (
                        <p>No signature available</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="hods">
                  <h5>Head Of department:</h5>
                  <label>Prepared By:</label>
                  <span>{selectedRequest.hodName || ''}</span>
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" />
                </div>
              </div>
              <div className="action-buttons">
            
              </div>
            </form>
            
          </div>
             </div>
       </div>
      )}
      
    </div>
    
  );
};

export default FuelRequisitionForm;