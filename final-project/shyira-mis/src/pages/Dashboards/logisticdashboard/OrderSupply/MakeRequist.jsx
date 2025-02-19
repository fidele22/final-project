import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { FaQuestionCircle, FaEdit, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import ItemOrderStatus from '../../dafdashboard/requestOfLogistic/ItemLogisticRequestStatus'; 
import ItemDecision from './approvedItemOrder';
import FuelFormOrder from './fuelorder';
import FuelOrderApproved from './fuelOrderApproved';
import FuelOrderStatus from './fuelOrderstatus';
import MakeRepairRequisition from '../repairRequisition/repairRequisition';
import SearchableDropdown from './searchable'; // Import the custom dropdown component
import './makeRequist.css'; // Import CSS for styling

const LogisticRequestForm = () => {
  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [date, setDate] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [error, setError] = useState(null);
  const [user, setUser ] = useState(null);
  const [activeComponent, setActiveComponent] = useState('form'); // State for switching between components
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({ item: false, fuel: false, repair: false }); // State for dropdowns

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

    const fetchItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
        setItemOptions(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchUser ();
    fetchItems();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('items', JSON.stringify(items));
    formData.append('date', date);
    formData.append('supplierName', supplierName);
    formData.append('logisticName', user ? `${user.firstName} ${user.lastName}` : '');
    formData.append('logisticSignature', user && user.signature ? user.signature : '');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/LogisticRequest/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      Swal.fire({
        title: 'Success!',
        text: 'Requisition submitted successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        }
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed submitting item requisition',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        }
      });
    }
  };

  const handleAddItem = () => {
    setItems([...items, { itemId: '', itemName: '', quantityRequested: '', price: '', totalAmount: '' }]);
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
        updatedItems[index]['itemId'] = selectedItem._id;
      }
    } else {
      updatedItems[index][key] = value;
    }

    if (key === 'quantityRequested' || key === 'price') {
      const quantityRequested = updatedItems[index].quantityRequested || 0;
      const price = updatedItems[index].price || 0;
      updatedItems[index]. totalAmount = quantityRequested * price;
    }

    setItems(updatedItems);
  };

  const toggleDropdown = (type) => {
    setDropdownOpen(prevState => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  const handleDropdownItemClick = (component) => {
    setActiveComponent(component);
    setDropdownOpen({ item: false, fuel: false, repair: false }); // Close all dropdowns
  };

  const renderActiveComponent = (activeComponent) => {
    switch (activeComponent) {
      case 'item-status':
        return <ItemOrderStatus />;
      case 'approved-item-order':
        return <ItemDecision />;
      case 'fuel-order':
        return <FuelFormOrder />;
      case 'fuel-status':
        return <FuelOrderStatus />;
      case 'fuel-order-approved':
        return <FuelOrderApproved />;
      case 'repair-requisition':
        return <MakeRepairRequisition />;
      case 'requisition':
      default:
        return (
          <div className="requestion">
            <h3>Make Requisition for Items</h3>
            <label>You have to make various requisitions for staff and accommodation materials</label>
            <div className='hod-request-form'>
              <form onSubmit={handleSubmit}>
                <div className="imag-logo">
                  <img src="/image/logo2.png" alt="Logo" className="log" />
                </div>
                <div className="heading-title">
                  <div className="date-of-done">
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="title"><h4>WESTERN PROVINCE</h4></div>
                  <div className="title"><h4>DISTRICT NYABIHU</h4></div>
                  <div className="title"><h4>SHYIRA DISTRICT HOSPITAL</h4></div>
                  <div className="title"><h4>LOGISTIC OFFICE</h4></div>
                </div>
                <div className="requisition-title">
                  <h4>REQUISITION FORM FROM LOGISTIC DEPARTMENT</h4>
                  <p>Supplier Name:
                    <input type="text" placeholder="Type names here..." value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
                  </p>
                </div>
                <button type="button" className="Add-item-btn" onClick={handleAddItem}>Add Item</button>
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Item Name</th>
                      <th>Quantity Requested</th>
                      <th>Price</th>
                      <th>Total Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <SearchableDropdown
                            options={itemOptions}
                            selectedValue={item.itemName}
                            onSelect={(value) => handleItemChange(index, 'itemName', value)}
                          />
                        </td>
                        <td>
                          <input type="number" value={item.quantityRequested} onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)} required />
                        </td>
                        <td>
                          <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} required />
                        </td>
                        <td>
                          <input type="number" value={item.totalAmount} readOnly />
                        </td>
                        <td>
                          <button type="button" className="remove-btn" onClick={() => handleRemoveItem(index)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='signature-section'>
                  <div className='logistic-signature'>
                    <label className='signature-title'>Logistic Office:</label>
                    <label htmlFor="hodName">Prepared By:</label>
                    {user ? (
                      <>
                        <p>{user.firstName} {user.lastName}</p>
                        {user.signature ? (
                          <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.signature}`} alt="Signature" className='signature-img' />
                        ) : (
                          <p>No signature available</p>
                        )}
                      </>
                    ) : (
                      <p>Loading user profile...</p>
                    )}
                  </div>
                </div>
                <hr />
                <h4>SHYIRA DISTRICT HOSPITAL, WESTERN PROVINCE, NYABIHU DISTRICT</h4>
                <button className='Log-submit-btn' type="submit">Submit Request</button>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="requistion">
      <div className="links">
        {/* Item Dropdown */}
        <div className="dropdown">
          <button className='dropdown-button' onClick={() => toggleDropdown('item')}>
            <i className="fas fa-edit"></i> Item
          </button>
          {dropdownOpen.item && (
            <div className="dropdown-content">
              <button onClick={() => handleDropdownItemClick('requisition')}>Make Item Requisition</button>
              <button onClick={() => handleDropdownItemClick('item-status')}>Item Order Status</button>
              <button onClick={() => handleDropdownItemClick('approved-item-order')}>Item Order Approved</button>
            </div>
          )}
        </div>

        {/* Fuel Dropdown */}
        <div className="dropdown">
          <button className='dropdown-button' onClick={() => toggleDropdown('fuel')}>
            <i className="fas fa-edit"></i> Fuel
          </button>
          {dropdownOpen.fuel && (
            <div className="dropdown-content">
              <button onClick={() => handleDropdownItemClick('fuel-order')}>Make Fuel Order</button>
              <button onClick={() => handleDropdownItemClick('fuel-status')}>Fuel Order Status</button>
              <button onClick={() => handleDropdownItemClick('fuel-order-approved')}>Fuel Order Approved</button>
            </div>
          )}
        </div>

        {/* Repair Dropdown */}
        <div className="dropdown">
          <button className='dropdown-button' onClick={() => toggleDropdown('repair')}>
            <i className="fas fa-edit"></i> Repair
          </button>
          {dropdownOpen.repair && (
            <div className="dropdown-content">
              <button onClick={() => handleDropdownItemClick('repair-requisition')}>Make Repair Requisition</button>
            </div>
          )}
        </div>
      </div>
      {renderActiveComponent(activeComponent)}
    </div>
  );
};

export default LogisticRequestForm;