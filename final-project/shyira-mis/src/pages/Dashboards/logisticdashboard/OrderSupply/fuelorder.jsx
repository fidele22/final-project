import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaQuestionCircle, FaEdit,FaTimes, FaTimesCircle, FaCheck,
  FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
//import './makeRequist.css'; // Import CSS for styling

const LogisticRequestForm = () => {
  const [items, setItems] = useState([]);
  const [department, setDepartment] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 

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

  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const payload = {
      department,
      supplierName,
      items,  // Make sure to include items array here
      date,
      hodName: user ? `${user.firstName} ${user.lastName}` : '',
      hodSignature: user && user.signature ? user.signature : ''
    };
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/logisticFuel/fuel-order`, payload, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log(response.data);
        // Show success message using SweetAlert2
        Swal.fire ({
          title: 'Success!',
          text: 'Fuel order sent successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });

      // Clear the form fields after successful submission
        setSupplierName('');
        setItems([]);
        setDate('');
   

    } catch (error) {
      console.error('Error submitting requisition:', error);
        // Show success message using SweetAlert2
        Swal.fire ({
          title: 'Error!',
          text: 'Failed to submit fuel order',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
    }
  };
  

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        desitination: 'Fuel',
        quantityRequested: '',
        pricePerUnit: '',
        totalPrice: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items];
    
    if (key === 'itemName') {
      // Find the selected item from the options
      const selectedItem = item => item.name === value;
      
      if (selectedItem) {
        updatedItems[index]['itemName'] = selectedItem.name;
        updatedItems[index]['itemId'] = selectedItem._id; // Store the itemId
      }
    } else {
      updatedItems[index][key] = value;
    }
  
    setItems(updatedItems);
  };
  

  
  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    setFile(file);
  };

  return (
    <div className="requistion">

      <div className="hod-request-form">
        <form onSubmit={handleSubmit}>
          <div className="image-logo">
            <img src="/image/logo.png" alt="Logo" className="logo" />
          </div>
          <div className="date-field">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          <div className="heading-title">
            <div className="title">
              <h4>WESTERN PROVINCE</h4>
            </div>
            <div className="title">
              <h4>DISTRICT: NYABIHU</h4>
            </div>
            <div className="title">
              <h4>SHYIRA DISTRICT HOSPITAL</h4>
            </div>
            <div className="title">
              <h4>LOGISTIC OFFICE</h4>
            </div>
            <div className="title">
              <h4>SUPPLIER NAME :</h4>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Type here .........."
                required
              />
            </div>
          </div>

          <h4>REQUISITION FORM FROM LOGISTIC DEPARTMENT  FOR FUEL</h4>
          <button className='additem-btn' type="button" onClick={handleAddItem}>Add Item</button>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>desitination</th>
                <th>Quantity Requested(liters)</th>
                <th>Price Per Liter</th>
                <th>Price Total</th>
                 <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className='itemname-td'>
                          Fuel 
                     </td>
                 
                  <td>
                    <input
                      type="number"
                      value={item.quantityRequested}
                      onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.pricePerUnit}
                      onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                    
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantityRequested*item.pricePerUnit}
                   
                    />
                  </td>
                  <td>
                    <button className='remove-btn' type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
     

          <div className='signature-signature'>
            <div className="hod-signature">
            <label htmlFor="hodName">Prepared By:</label>
            {user ? (
              <>
                <p>{user.firstName} {user.lastName}</p>

                {user.signature ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt="Signature" 
                  className='signature-img' />
                ) : (
                  <p>No signature available</p>
                )}
                
              </>

            ) : (
              <p>Loading user profile...</p>
            )}
          </div>
            </div>
          

         

          <button className='hod-submit-btn' type="submit">Send Request</button>
        </form>
      </div>
    </div>
  );
};

export default LogisticRequestForm;
