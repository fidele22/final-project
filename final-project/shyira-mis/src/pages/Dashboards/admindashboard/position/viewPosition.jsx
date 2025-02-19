import React, { useState, useEffect } from 'react';
import AddNewPosition from './AddPosition'
import Swal from 'sweetalert2'; 
import { FaEdit, FaTrash,FaTimes,FaPlus } from 'react-icons/fa';
import axios from 'axios';
import '../css/service.css';

const ViewPosition = () => {
  const [positions, setPositions] = useState([]);
  const [editPosition, setEditPosition] = useState(null);
  const [positionName, setPositionName] = useState('');
  const [isAddDepartmentVisible, setIsAddDepartmentVisible] = useState(false); 

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/positions`);
        setPositions(response.data);
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };

    fetchPositions();
  }, []);

  const handleEditClick = (position) => {
    setEditPosition(position);
    setPositionName(position.name);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/positions/${editPosition._id}`, {
        name: positionName,
      });
      setEditPosition(null);
      setPositionName('');
      // Fetch updated positions
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/positions`);
      setPositions(response.data);
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleDelete = async (id) => {
    const { value: isConfirmed } = await Swal.fire({
  
      title: 'Are you sure?,',
      text: "you want to delete this position?",
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
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/positions/${id}`);
      console.log('Delete response:', response.data); // Log the response
      // Fetch updated positions
      const fetchUpdatedPositions = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/positions`);
      setPositions(fetchUpdatedPositions.data);
      Swal.fire({
        title:'Deleted!',
        text:'Position has been deleted successfully.',
        icon:'success',
        customClass:{

          popup: 'custom-swal',

        },
      }
      );
    } catch (error) {
      console.error('Error deleting position:', error);
      Swal.fire(

        'Error!',
        'Failed to delete this position.',
        'error'

      );
    }
  }
  };
  
  return (
    <div className="service-data">
     
      <div className="service-table-data">
      <h1>Positions Managment</h1>
      <button className="add-department-btn" onClick={() => setIsAddDepartmentVisible(true)}>
          <FaPlus /> Add new position </button>
        <table className='table'>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr key={position._id}>
                <td>{index + 1}</td>
                <td>{position.name}</td>
                <td>
                  <button onClick={() => handleEditClick(position)}><FaEdit size={16} color='black'/></button>
                  <button onClick={() => handleDelete(position._id)}><FaTrash size={16} color='red'/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editPosition && (
         <div className="editing-userdata-ovelay">
        <div className="edit-form">
          <h2>Edit Position</h2>
          <input
            type="text"
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
          />
          <button onClick={handleUpdate}>Update</button>
          <button className='cancel-btn' onClick={() => setEditPosition(null)}>Cancel</button>
        </div>
        </div>
      )}
   {isAddDepartmentVisible && (
        <div className="editing-userdata-overlay">
          <div className="overlay-content">
          <button className="close-add-form" onClick={() => setIsAddDepartmentVisible(false)}>
              <FaTimes />
            </button>
            <AddNewPosition onClose={() => setIsAddDepartmentVisible(false)} />
            
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ViewPosition;
