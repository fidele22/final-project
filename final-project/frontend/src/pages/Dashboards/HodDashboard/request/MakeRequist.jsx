import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import SearchableDropdown from '../../logisticdashboard/OrderSupply/searchable';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './makeRequist.css'; 

const UserRequestForm = () => {
  const [items, setItems] = useState([]);
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [stockQuantities, setStockQuantities] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [user, setUser ] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
        setItemOptions(response.data);
        const quantities = response.data.reduce((acc, item) => {
          acc[item._id] = item.quantity; // Assuming the response includes 'quantity' field
          return acc;
        }, {});
        setStockQuantities(quantities);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
  
    fetchItems();
  }, []);

  const validateQuantities = () => {
    for (const item of items) {
      if (item.quantityRequested > (stockQuantities[item.itemId] || 0)) {
        Swal.fire({
          title: 'Error!',
          text: 'Quantity Requested exceeds available Quantity in stock.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentTab = sessionStorage.getItem('currentTab');

        if (!currentTab) {
          setError('No tab ID found in sessionStorage');
          return;
        }

        const token = sessionStorage.getItem(`token_${currentTab}`);
        if (!token) {
          setError('Token not found');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        setUser (response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Invalid token or unable to fetch profile data');
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateQuantities()) return; // Calling validation

    const formData = new FormData();
    formData.append('department', user ? `${user.departmentName} `: '',);
    formData.append('service', user ? `${user.serviceName} `: '',);
    formData.append('items', JSON.stringify(items));
    formData.append('date', date);
    formData.append('hodName', user ? `${user.firstName} ${user.lastName}` : ''); // HOD Name
    formData.append('hodSignature', user && user.signature ? user.signature : ''); // HOD Signature URL

    try {
      const currentTab = sessionStorage.getItem('currentTab');

      if (!currentTab) {
        setError('No tab ID found in sessionStorage');
        return;
      }

      const token = sessionStorage.getItem(`token_${currentTab}`);
      if (!token) {
        setError('Token not found');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/submit`, {
        department:user ? `${user.departmentName} `: '',
        service:user ? `${user.serviceName} `: '',
        items: JSON.stringify(items),
        date,
        hodName: user ? `${user.firstName} ${user.lastName}` : '',
        hodSignature: user && user.signature ? user.signature : ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // Ensure content type is JSON
        },
      });

      console.log(response.data);

         toast.success('Submit requisition to logistic successfully')
   

      // Clear form fields after successful submission
      setDepartment(''); // Reset department field
      setDate(''); // Reset date field
      setItems([]); // Reset items array
      
    } catch (error) {
      console.error('Error submitting requisition:', error);
      
      // Show error message using SweetAlert2
      toast.error('Failed to submit requisition')
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemId: '',
        itemName: '',
        quantityRequested: '',
        quantityReceived: '',
        observation: '',
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
      const selectedItem = itemOptions.find(item => item.name === value);
      
      if (selectedItem) {
        updatedItems[index]['itemName'] = selectedItem.name;
        updatedItems[index]['itemId'] = selectedItem._id; // Store the itemId
      }
    } else {
      updatedItems[index][key] = value;
    }
  
    setItems(updatedItems);
  };

  return (
    <div className="requistion">
     
      <div className="hod-request-form">
        <form onSubmit={handleSubmit}>
          <div className="image-logo">
            <img src="/image/logo2.png" alt="Logo" className="logo" />
            
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
              <h4>HEALTH FACILITY: SHYIRA DISTRICT HOSPITAL</h4>
            </div>
            <div className="title">
            <h4>DEPARTMENT: {user && user.departmentName ? user.departmentName : "Loading..."}</h4>
            </div>
            <div className="title">
            <h4>SERVICE: {user && user.serviceName ? user.serviceName : "Loading..."}</h4>
            </div>

          </div>

          <h3>REQUISITION FORM</h3>
          <button className='additem-btn' type="button" onClick={handleAddItem}>Add Item</button>
          <div className="table-container"> 
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th className='item-name'>Item Name</th>
                <th>Quantity Requested</th>
                <th>Quantity Received</th>
                <th>Observation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className='itemname-td'>
                    <SearchableDropdown
                      options={itemOptions}
                      selectedValue={item.itemName}
                      onSelect={(value) => handleItemChange(index, 'itemName', value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                       min="0"
                      value={item.quantityRequested}
                      onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantityReceived}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.observation}
                    />
                  </td>
                  <td>
                    <button className='remove-btn' type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
                  </td>
                </tr>
 ))}
            </tbody>
          </table>
</div>
          <div className='hod-signature'> 
            {user ? (
              <>
               <label htmlFor="hodName">Name of head of {user.departmentName}</label>
                <p>{user.firstName} {user.lastName}</p>
                {user.signature ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt="Signature" />
                ) : (
                  <p>No signature available</p>
                )}
              </>
            ) : (
              <p>Loading user profile...</p>
            )}
          </div>
         <div className='footer-img'>
         <img src="/image/footerimg.png" alt="Logo" className="footerimg" />
         </div>
          <button className='hod-send-btn' type="submit">Send</button>
        </form>
      </div>
      <>
  {/* Your JSX content */}
  <ToastContainer position="top-right" autoClose={6000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
</>
    </div>
  );
};

export default UserRequestForm;