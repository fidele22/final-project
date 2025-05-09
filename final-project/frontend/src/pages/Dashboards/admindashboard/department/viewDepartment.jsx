import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import AddNewDepartment from './AddDepartment';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../css/service.css'

const ViewDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [editDepartment, setEditDepartment] = useState(null);
  const [departmentName, setDepartmentName] = useState('');
  const [isAddDepartmentVisible, setIsAddDepartmentVisible] = useState(false); // State for overlay visibility

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/departments`);
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleEditClick = (department) => {
    setEditDepartment(department);
    setDepartmentName(department.name);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/departments/${editDepartment._id}`, {
        name: departmentName,
      });
      setEditDepartment(null);
      setDepartmentName('');
      // Fetch updated departments
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDelete = async (id) => {
    const { value: isConfirmed } = await Swal.fire({
  
      title: 'Are you sure?,',
      text: "you want to delete this department?",
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
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/departments/${id}`);
      // Fetch updated departments
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/departments`);
      setDepartments(response.data);
      Swal.fire({
        title:'Deleted!',
        text:'Department has been deleted successfuly.',
        icon:'success',
        customClass:{

          popup: 'custom-swal',

        },
      }
      );
    } catch (error) {
      console.error('Error deleting department:', error);
      Swal.fire(

        'Error!',
        'Failed to delete this department.',
        'error'

      );
    }
  }
  };

  return (
    <div className="service-data">
      <div className="service-table-data">
        <h1>Departments Management</h1>
        <button className="add-department-btn" onClick={() => setIsAddDepartmentVisible(true)}>
          <FaPlus /> Add Department
        </button>
        <table className='table'>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department, index) => (
              <tr key={department._id}>
                <td>{index + 1}</td>
                <td>{department.name}</td>
                <td>
                  <button onClick={() => handleEditClick(department)}><FaEdit size={16} color='black' /></button>
                  <button onClick={() => handleDelete(department._id)}><FaTrash size={16} color='red' /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editDepartment && (
        <div className="editing-userdata-overlay">
          <div className="edit-form">
            <h2>Edit Department</h2>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
            />
            <button onClick={handleUpdate}>Update</button>
            <button className='cancel-btn' onClick={() => setEditDepartment(null)}>Cancel</button>
          </div>
        </div>
      )}

      {isAddDepartmentVisible && (
        <div className="editing-userdata-overlay">
          <div className="overlay-content">
          <button className="close-add-form" onClick={() => setIsAddDepartmentVisible(false)}>
              <FaTimes />
            </button>
            <AddNewDepartment onClose={() => setIsAddDepartmentVisible(false)} />
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDepartment;