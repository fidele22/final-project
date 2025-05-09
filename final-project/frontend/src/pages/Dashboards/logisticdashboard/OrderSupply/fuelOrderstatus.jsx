import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './orderstatus.css';

const ForwardedRequests = () => {
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [itemsPerPage] = useState(15); // Number of items per page
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser ] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`);

  useEffect(() => {
    const fetchForwardedRequests = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/logisticFuel`);
        setForwardedRequests(response.data);
      } catch (error) {
        console.error('Error fetching forwarded requests:', error);
        setError('Failed to fetch forwarded requests');
      }
    };

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

    fetchForwardedRequests();
    fetchUser ();
  }, [token]);

  const handleRequestClick = (requestId) => {
    const request = forwardedRequests.find(req => req._id === requestId);
    setSelectedRequest(request);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (!user) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
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
    pdf.save('logistic-requisition-of-fuel-with-signatures.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

  // Filter the requests based on the selected status
  const filteredRequests = forwardedRequests.filter(request => {
    return request.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Slice the requests for the current page
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className={`request ${selectedRequest ? 'dim-background' : ''}`}>
      <div className="order-navigation">
        <div className='navigation-title'>
        <h2>Requisition from logistic office for fuel</h2>
        </div>
     
        
        {/* Filter Input */}
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
              <tr key={request._id} onClick ={() => handleRequestClick(request._id)}>
                <td>{index + 1 + indexOfFirstRequest}</td>
                <td>Request of fuel from logistic office prepared by {request.hodName}</td>
                <td>{request.supplierName}</td>
                <td>{new Date(request.createdAt).toDateString()}</td>
                <td>
                  <b className={`status-${request.status?.toLowerCase()}`}>{request.status}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
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
      <div className='request-details-overlay'>

    
        
        <div className="request-details">
          <div className="form-navigation">
          <button className='request-dowload-btn' onClick={downloadPDF}>Download Pdf</button>
            <label className='request-close-btn' onClick={() => setSelectedRequest(null)}><FaTimes /></label>
          </div>
          <div id='pdf-content'>

         
          <div className="image-request-recieved">
            <img src="/image/logo2.png" alt="Logo" className="logo" />
          </div>
          <div className='date-done'>
            <label htmlFor="">{new Date(selectedRequest.date).toDateString()}</label>
          </div>
          <div className="fuel-order-heading">
            <h5>WESTERN PROVINCE</h5>
            <h5>DISTRICT: NYABIHU</h5>
            <h5>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h5>
            <h5>DEPARTMENT: LOGISTIC OFFICE</h5>
            <h5>SUPPLIER NAME: {selectedRequest.supplierName}</h5>
          </div>
          <h3>REQUISITION FORM OF LOGISTIC FOR FUEL</h3>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Destination</th>
                <th>Quantity Requested (liters)</th>
                <th>Price Per Liter</th>
                <th>Price Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedRequest.items && selectedRequest.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.desitination}</td>
                  <td>{item.quantityRequested}</td>
                  <td>{item.pricePerUnit}</td>
                  <td>{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="signature-section">
            <div className="hod-signature">
              <h4>Logistic Office</h4>
              <label>Prepared By:</label>
              <span>{selectedRequest.hodName || ''}</span><br />
              <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.hodSignature}`} alt="HOD Signature" className='signature-img' />
            </div>
            <div className='daf-signature'>
              <h4>DAF Office</h4>
              <label>Verified By:</label>
              <p>{selectedRequest.verifiedBy.firstName} {selectedRequest.verifiedBy.lastName}</p>
              {selectedRequest.verifiedBy.signature ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.verifiedBy.signature}`} alt="Approved Signature" className='signature-img' />
              ) : (
                <p>Doesn't Signed</p>
              )}
            </div>
            <div className='daf-signature'>
              <h4>DG Office</h4>
              <label>Approved By:</label>
              <p>{selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}</p>
              {selectedRequest.approvedBy.signature ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.approvedBy.signature}`} alt="Approved Signature" className='signature-img' />
              ) : (
                <p>Doesn't Signed</p>
              )}
            </div>
            <div className='daf-signature'>
              <h4>Logistic Office</h4>
              <label>Received By:</label>
              <p>{selectedRequest.receivedBy.firstName} {selectedRequest.receivedBy.lastName}</p>
              {selectedRequest.receivedBy.signature ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${selectedRequest.receivedBy.signature}`} alt="Approved Signature" className='signature-img' />
              ) : (
                <p>Doesn't Signed</p>
              )}
            </div>
          </div>
          <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="footerimg" />
         </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default ForwardedRequests;