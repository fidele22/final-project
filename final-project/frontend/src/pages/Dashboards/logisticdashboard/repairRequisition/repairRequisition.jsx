import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { FaQuestionCircle, FaEdit, FaTimes, FaTimesCircle, FaCheck, FaCheckCircle } from 'react-icons/fa';
// Import your CSS here if you have any
// import './makeRequist.css'; 

const LogisticRequestForm = () => {
  const [items, setItems] = useState([]);
  const [department, setDepartment] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [desitination, setDestination] = useState('');
  const [carplaque, setCarPlaque] = useState('');
  const [unit, setUnit] = useState('');
  
  const [quantityRequested, setQuantityRequested] = useState('');
  const [pricePerUnit, setPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [totalOverallPrice, setTotalOverallPrice] = useState(0); // For overall total price
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

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
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Invalid token or unable to fetch profile data');
      }
    };
    const fetchCars = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/forms-data/cars`);
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };
  
    fetchUserProfile();
    fetchCars();
  }, []);



    // Calculate total price for each row and overall total
    useEffect(() => {
      const total = items.reduce((acc, item) => acc + (item.quantityRequested * item.pricePerUnit || 0), 0);
      setTotalOverallPrice(total);
    }, [items]);

    

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        // Calculate totalPrice for each item
        const updatedItems = items.map(item => ({
            ...item,
            totalPrice: item.quantityRequested * item.pricePerUnit // Calculate totalPrice
        }));
    
        const formData = new FormData();
        formData.append('department', department);
        formData.append('supplierName', supplierName);
        formData.append('items', JSON.stringify(updatedItems)); // Use updated items with totalPrice
        formData.append('carplaque', carplaque);
        formData.append('date', date);
        formData.append('hodName', user ? `${user.firstName} ${user.lastName}` : '');
        formData.append('hodSignature', user && user.signature ? user.signature : '');
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/RepairRequisition/repair-submit`, {
                department,
                supplierName,
                carplaque,
                items: updatedItems, // Send updated items
                totalOverallPrice,
                date,
                hodName: user ? `${user.firstName} ${user.lastName}` : '',
                hodSignature: user && user.signature ? user.signature : ''
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
            });
    
            console.log(response.data);
    
            setModalMessage('Submit requisition to logistic successfully');
            setIsSuccess(true);
            setShowModal(true);
        } catch (error) {
            console.error('Error submitting requisition:', error);
            setModalMessage('Failed to submit requisition');
            setIsSuccess(false);
            setShowModal(true);
        }
    };

    
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        desitination: '',
        unit: '',
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
      const selectedItem = item => item.name === value;
      if (selectedItem) {
        updatedItems[index]['itemName'] = selectedItem.name;
        updatedItems[index]['itemId'] = selectedItem._id;
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
              <h3>WESTERN PROVINCE</h3>
            </div>
            <div className="title">
              <h3>DISTRICT: NYABIHU</h3>
            </div>
            <div className="title">
              <h3>SHYIRA DISTRICT HOSPITAL</h3>
            </div>
            <div className="title">
              <h3>DEPARTMENT :</h3>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Type here .........."
                required
              />
            </div>
            <div className="title">
              <h3>SUPPLIER NAME :</h3>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Type here .........."
                required
              />
            </div>
            <div className="title">
              <h3>Car Plaque:</h3>
              <select
                value={carplaque}
                onChange={(e) => setCarPlaque(e.target.value)}
                required
              >
                <option value="">Select Car Plaque</option>
                {cars.map((car) => (
                  <option key={car._id} value={car.registerNumber}>
                    {car.registerNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2>REQUISITION FORM FOR REPAIR</h2>
          <button className='additem-btn' type="button" onClick={handleAddItem}>Add Item</button>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Designations</th>
                <th>Unit</th>
                <th>Quantity Requested</th>
                <th>Price Per Unit</th>
                <th>Price Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className='itemname-td'>
                    <input
                      type="text"
                      value={item.desitination}
                      onChange={(e) => handleItemChange(index, 'desitination', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      required
                    />
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
                      value={item.quantityRequested * item.pricePerUnit}
                      readOnly
                    />
                  </td>
                  <td>
                    <button className='remove-btn' type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total Price: {totalOverallPrice.toFixed(2)}</h3>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <p>{modalMessage}</p>
                <button className='modal-close-btn' onClick={() => setShowModal(false)}>
                  {isSuccess ? <FaCheckCircle /> : <FaTimesCircle />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default LogisticRequestForm;
