import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './profile.css'; // Import the CSS file for styles

const UserProfile = () => {
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); // Get the token for the current tab

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/profile/update-profile`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser (response.data);
         // Show success message using SweetAlert2
         Swal.fire ({
          title: 'Success!',
          text: 'profile updated successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
        
      setIsEditing(false); // Exit editing mode after successful update
    } catch (err) {
   
         // Show success message using SweetAlert2
         Swal.fire ({
          title: 'Error',
          text: ' Failed to update profile',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal', // Apply custom class to the popup
          }
        });
        
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-profile">
      <h2>Profile Setting</h2>
      <div className="profile-header">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName}&backgroundColor=E3F2FD`}
          alt={`${user.firstName} ${user.lastName}`}
          className="profile-avatar"
        />
        <h3>{`${user.firstName} ${user.lastName}`}</h3>
      </div>
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={user.firstName}
            onChange={(e) => setUser ({ ...user, firstName: e.target.value })}
            disabled={!isEditing} // Disable input if not in editing mode
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={user.lastName}
            onChange={(e) => setUser ({ ...user, lastName: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser ({ ...user, email: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="text"
            value={user.phone}
            onChange={(e) => setUser ({ ...user, phone: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        {/* Add more fields as necessary */}
        <div className="form-actions">
          <button type="submit" disabled={!isEditing} className="update-button">Update Profile</button>
          <button type="button" onClick={() => setIsEditing(!isEditing)} className="edit-button">
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;