import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './additem.css';
import './customAlert.css'; // Import your custom styles

const AddItem = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [existingItems, setExistingItems] = useState([]); // State to hold existing items

  useEffect(() => {
    const fetchExistingItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
        setExistingItems(response.data); // Store existing items
      } catch (error) {
        console.error('Error fetching existing items:', error);
      }
    };

    fetchExistingItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for duplicate item name
    const isDuplicate = existingItems.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      Swal.fire({
        title: 'Duplicate Item!',
        text: 'An item with this name already exists.',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
      return; // Exit the function if duplicate found
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/add`, {
        name,
        quantity,
        pricePerUnit,
        totalAmount,
      });
      console.log('Item added:', response.data);

      // Show success message using SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: 'Add new item in stock successful',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });

      // Clear form
      setName('');
      setQuantity('');
      setPricePerUnit('');
      setTotalAmount('');
    } catch (error) {
      console.error('Error adding item:', error);

      // Show error message using SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add new item in stock',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
      });
    }
  };

  return (
    <div className='add-new-item'>
      <div className="additem">
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Price Per Unit:</label>
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Total Amount:</label>
            <input
              type="number"
              value={quantity * pricePerUnit}
              readOnly // Make this read-only since it's calculated
            />
          </div>
          <button type="submit">Add Item</button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;