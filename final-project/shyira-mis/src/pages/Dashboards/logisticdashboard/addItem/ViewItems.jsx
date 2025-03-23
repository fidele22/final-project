import React, { useEffect, useState, useRef } from 'react';
import { FaEdit,FaEllipsisH , FaTrash,FaHistory, FaTimes,FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import UploadNewItem from './uploadItems';
import AddNewItem from './addingitem';
import  ItemHistory from './itemhistory';
import  StockDetails from './stockDetails' ;
import axios from 'axios';
import './stock.css';

const DataDisplay = ({ onItemSelect }) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false); 
  const [showUploadItemForm, setShowUploadItemForm] = useState(false); 
  const [notification, setNotification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemDropdown, setItemDropdown] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showHistory, setShowHistory] = useState(false);  
  const [editingItem, setEditingItem] = useState(null); 
  const dropdownRef = useRef();
  const itemsPerPage = 10; // Set the number of items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleDelete = async (id) => {

      const { value: isConfirmed } = await Swal.fire({
  
        title: 'Are you sure?',
        text: "You won't be able to recover this item!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!', 
        customClass: {
          popup: 'custom-swal', // Apply custom class to the popup
        }
  
      });
  
    if (isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/${id}`);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);
        setData(response.data);
        setNotification('Item deleted successfully!'); // Set notification message
        // Auto-remove notification after 3 seconds
        setTimeout(() => {
          setNotification('');
        }, 3000);
        Swal.fire(

          'Deleted!',
          'Your item has been deleted.',
          'success'

        );
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };
  // update item data
  const handleUpdateItem = async () => {

    try {

      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/update/${editingItem._id}`, editingItem);

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks`);

      setData(response.data);
      setNotification('Item updated successfully!');
      setTimeout(() => {
        setNotification('');

      }, 3000);

      setEditingItem(null); // Clear the editing item

    } catch (error) {

      console.error('Error updating item:', error);

    }

  };
    // Close the dropdown if clicked outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setItemDropdown(null); // Close dropdown if clicked outside
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleDropdownToggle = (id) => {
      setItemDropdown(itemDropdown === id ? null : id); // Toggle dropdown
    };


    const handleShowDetails = (item) => {
      setSelectedItem(item);
      setShowDetails(true);
  
    };
  
  
    const handleShowHistory = (item) => {
      setSelectedItem(item);
      setShowHistory(true);
  
    };

    const handleEditItem = (item) => {
      setEditingItem(item); // Set the item to be edited
      setItemDropdown(null); // Close the dropdown
  
    };
  

  return (
    <div className='view-items'>
       {/* Notification Component */}
       {notification && (
   <div className="notification">
       {notification}
    </div>

)}
      <div className='add-item'>
        <button className='add-item-btn' onClick={() => setShowAddItemForm(true)}>Add new Item</button>
        <button className='upload-item-btn' onClick={() => setShowUploadItemForm(true)}>Upload New Items</button>
      </div>

      <h2>Item list and Stock Management</h2>
      <h3> Here are Items stored in stock with their updated balance</h3>
      <div className="search-item-input">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price per Unit</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={item._id}>
              <td>{indexOfFirstItem + index + 1}</td> {/* Display the index + 1 for serial number */}
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.pricePerUnit}</td>
              <td>{item.totalAmount}</td>
              <td className="action-menu">
                <button
                  className="ellipsis-btn"
                  onClick={() => handleDropdownToggle(item._id)}
                >
                  <FaEllipsisH color='black' size={15}/>
                </button>
                {itemDropdown === item._id && (
                  <div className="dropdown-menu" ref={dropdownRef}>
                    <button className="dropdown-item" onClick={() => handleShowDetails(item)}>

                      <FaEye /> Current data

                    </button>

                    <hr />

                    <button className="dropdown-item" onClick={() => handleShowHistory(item)}>

                      <FaHistory color='blue'/> Item history

                    </button>

                    <hr />
                    <button className="dropdown-item" onClick={() => handleEditItem(item)}>

                   <FaEdit color='brown' /> Edit
                  </button>
                    <hr />
                    <button className="dropdown-item" onClick={() => handleDelete(item._id)}>
                      <FaTrash color='red'/> Delete
                    </button>
                  </div>
                )}
             
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className=" pagination-controls">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

 {/* Edit Item Modal */}

 {editingItem && (

<div className="edit-overlay">
  <div className="edit-item-form-container">
    <h2>Edit Item</h2>
    <label>
      Name:
      <input
        type="text"

        value={editingItem.name}

        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}

      />

    </label>

    <label>
      Quantity: (read only)
      <input
        type="number"
        value={editingItem.quantity}

        // onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}

      />

    </label>

    <label>

      Price per Unit: (read only)

      <input

        type="number"

        value={editingItem.pricePerUnit} 

        // onChange={(e) => setEditingItem({ ...editingItem, pricePerUnit: e.target.value })}

      />

    </label>

    <button onClick={handleUpdateItem}>Update</button>

    <button  onClick={() => setEditingItem(null)}>Cancel</button>

  </div>

</div>

)}
{/*  */}
      {showDetails && selectedItem && (
<StockDetails item={selectedItem} onClose={() => { setShowDetails(false); setSelectedItem(null); }} />

)}

{showHistory && selectedItem && (
<ItemHistory item={selectedItem} onClose={() => { setShowHistory(false); setSelectedItem(null); }} />

)}
      {/* Add User Form Overlay */}
      {showAddItemForm && (
        <div className="add-overlay">
          <div className="add-user-form-container">
            <button className="close-form-btn" onClick={() => setShowAddItemForm(false)}>
              <FaTimes size={32} />
            </button>
            <AddNewItem /> {/* Add User Component */}
          </div>
        </div>
      )}

      {/* Showing upload item form Overlay */}
      {showUploadItemForm && (
        <div className="add-overlay">
          <div className="add-user-form-container">
            <button className="close-form-btn" onClick={() => setShowUploadItemForm(false)}>
              <FaTimes size={32} />
            </button>
            <UploadNewItem /> {/* Add User Component */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;