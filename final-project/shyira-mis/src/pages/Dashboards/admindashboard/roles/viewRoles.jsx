import React, { useState, useEffect } from 'react';
import AddNewRole from './AddRole';
import Swal from 'sweetalert2'; 
import { FaEdit, FaTrash, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import '../css/service.css';
import './rolestyling.css';

const ViewPosition = () => {
  const [roles, setRoles] = useState([]);
  const [editRole, setEditRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [isAddDepartmentVisible, setIsAddDepartmentVisible] = useState(false);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  const availablePrivileges = [
    'manage users',
    'view reports',
    'request_item',
    'view_items',
    'view_overview',
    'request_fuel',
    'update_car_data',
    'view_help_center',
    'Manage_item_stock',
    'Make_item_order',
    'view_request_item',
    'view_request_fuel',
    'View_car_data',
    'view_fuel_stock',
    'view_item_report',
    'view_fuel_report',
    'view-stock-items',
    'verify-logistic-item-request',
    'Verify-logistic-fuel-request',
    'Approve-logistic-request',
    'approve-fuel-logistic-request',
    'Repair-logistic-request',
    'approve-repair-logistic-request',
    'Approve-user-item-request',
    'Approve-user-fuel-request',
    'view-user-requisition',
    'View-user-fuel-request',






    
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/roles`);
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleEditClick = (role) => {
    setEditRole(role);
    setRoleName(role.name);
    setSelectedPrivileges(role.privileges || []); // Set selected privileges
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/roles/${editRole._id}`, {
        name: roleName,
        privileges: selectedPrivileges, // Include selected privileges
      });
      setEditRole(null);
      setRoleName('');
      setSelectedPrivileges([]); // Reset selected privileges
      // Fetch updated roles
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handlePrivilegeChange = (privilege) => {
    setSelectedPrivileges((prev) => {
      if (prev.includes(privilege)) {
        return prev.filter((p) => p !== privilege);
      } else {
        return [...prev, privilege];
      }
    });
  };

  const handleDelete = async (id) => {
    const { value: isConfirmed } = await Swal.fire({
  
      title: 'Are you sure?,',
      text: "you want to delete this role?",
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
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/roles/${id}`);
      // Fetch updated roles
      const fetchUpdatedRoles = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/roles`);
      setRoles(fetchUpdatedRoles.data);

      Swal.fire({
        title:'Deleted!',
        text:'Role has been deleted successfully.',
        icon:'success',
        customClass:{

          popup: 'custom-swal',

        },
      }
      );

    } catch (error) {
       Swal.fire(

        'Error!',
        'Failed to delete this role.',
        'error'

      );
    }
  }
  };

  return (
    <div className="role-privilegies-section">
       <label htmlFor="">Roles and its particular privileges</label>
         <div className="role-privileges">
       
        {roles.map((role) => (
          <div key={role._id} className={role.name.toLowerCase()}>
            <h2>{role.name.toUpperCase()}</h2>
            <ul>
              {Array.isArray(role.privileges) && role.privileges.length > 0 ? (
                role.privileges.map((privilege, index) => (
                  <li key={index}>{privilege}</li>
                ))
              ) : (
                <li>No privileges assigned.</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="service-table-data">
        <h1>Role Management</h1>

        <button className="add-department-btn" onClick={() => setIsAddDepartmentVisible(true)}>
          <FaPlus /> Add new role
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
            {roles.map((role, index) => (
              <tr key={role._id}>
                <td>{index + 1}</td>
                <td>{role.name}</td>
                <td>
                  <button onClick={() => handleEditClick(role)}><FaEdit size={24} color='black' /></button>
                  <button onClick={() => handleDelete(role._id)}><FaTrash size={24} color='red' /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
   

      {editRole && (
        <div className="editing-userdata-overlay">
          <div className="edit-form">
            <h2>Edit Role</h2>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <div>
            <p>Assign privileges </p>
              {availablePrivileges.map((privilege) => (
                <div key={privilege}>
               
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPrivileges.includes(privilege)}
                      onChange={() => handlePrivilegeChange(privilege)}
                    />
                    {privilege}
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => setEditRole(null)}>Cancel</button>
          </div>
        </div>
      )}
      {isAddDepartmentVisible && (
        <div className="editing-userdata-overlay">
          <div className="overlay-content">
            <button className="close-add-form" onClick={() => setIsAddDepartmentVisible(false)}>
              <FaTimes />
            </button>
            <AddNewRole onClose={() => setIsAddDepartmentVisible(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPosition;