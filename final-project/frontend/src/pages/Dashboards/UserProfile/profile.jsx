import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './profile.css'; // Import the CSS file for styles

const UserProfile = () => {
  const [user, setUser ] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); // Get the token for the current tab
  const [profilePic, setProfilePic] = useState(null); // for uploading profile picture
  const [twoFAEnabled, setTwoFAEnabled] = useState(user.twoFAEnabled);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser (response.data);
        if (response.data.profilePic) {
          setProfilePic(response.data.profilePic);
          console.log(' Profile Pic Set:', response.data.profilePic);
        } else {
          console.log(' No profile picture set.');
          setProfilePic(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser ();
  }, [token]);

  const handleToggle2FA = async () => {
    const confirmation = window.confirm(`You are about to ${twoFAEnabled ? 'disable' : 'enable'} Two-Factor Authentication.`);
    if (!confirmation) return;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/enable-disable-2fa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTwoFAEnabled(response.data.twoFAEnabled);
      toast.success(response.data.message);
    } catch (err) {
      console.error('Error toggling 2FA:', err);
      toast.error('Could not update 2FA preference');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/profile/update`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser (response.data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  const handleProfileChange = async (e) => {
    const formData = new FormData();
    formData.append('profilePic', e.target.files[0]);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setProfilePic(res.data.imageUrl);
      toast.success('Profile picture updated!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    }
  };

  const handleRemoveProfilePic = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/delete-profile-picture`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfilePic('');
      toast.success('Profile picture removed!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete profile picture');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-profile">
      <h2>Profile Setting</h2>
      <div className="profile-container">
        {/* Left Side - Profile Avatar & Name */}
        <div className="profile-sidebar">
          <img
            src={
              profilePic
                ? `${process.env.REACT_APP_BACKEND_URL}${profilePic}`
                : `https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName}&backgroundColor=E3F2FD`
            }
            alt={`${user.firstName} ${user.lastName}`}
            className="profile-avatar"
          />
          <h3>{`${user.firstName} ${user.lastName}`}</h3>
          <div className="profile-actions">
            <label className="upload-profile-btn">
              Change Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                hidden
              />
            </label>
            {profilePic && (
              <label  className="remove-btn" onClick={handleRemoveProfilePic}>
                Remove
              </label>
              
            )}
         
          </div>
        </div>

        {/* Right Side - Form & Settings */}
        <div className="profile-content">
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-groups">
              <label>First Name:</label>
              <input
                type="text"
                value={user.firstName}
                onChange={(e) => setUser ({ ...user, firstName: e.target.value })}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-groups">
              <label>Last Name:</label>
              <input
                type="text"
                value={user.lastName}
                onChange={(e) => setUser ({ ...user, lastName: e.target.value })}
                disabled={!isEditing}
                 className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-groups">
              <label>Email:</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser ({ ...user, email: e.target.value })}
                disabled={!isEditing}
                 className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-groups">
              <label>Phone:</label>
              <input
                type="text"
                value={user.phone}
                onChange={(e) => setUser ({ ...user, phone: e.target.value })}
                disabled={!isEditing}
                 className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={!isEditing} className="profile-update-button" style={{fontSize:'12px',backgroundColor:'green'}}>Update Profile</button>
              <button type="button" onClick={() => setIsEditing(!isEditing)} className="edit-button" style={{fontSize:'12px',backgroundColor:'#ccc'}}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </form>
          <hr />
          {/* Password Section */}
          <div className="password-section">
            <button
              className="toggle-password-form"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{fontSize:'12px'}} >
              {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
            </button>
            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="password-form">
             <div className="form-group password-toggle-group">
  <label>Current Password:</label>
  <div className="password-input-wrapper">
    <input
      type={showCurrentPassword ? 'text' : 'password'}
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      placeholder='Enter current password'
      required
    />
    <span onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="toggle-icon">
      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

       <div className="form-group password-toggle-group">
  <label>New Password:</label>
  <div className="password-input-wrapper">
    <input
      type={showNewPassword ? 'text' : 'password'}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      placeholder='Enter new password'
      required
    />
    <span onClick={() => setShowNewPassword(!showNewPassword)} className="toggle-icon">
      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

          <div className="form-group password-toggle-group">
  <label>Confirm New Password:</label>
  <div className="password-input-wrapper">
    <input
      type={showConfirmPassword ? 'text' : 'password'}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder='Confirm password'
      required
    />
    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-icon">
      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>

                <div className="form-actions">
                  <button type="submit" className="update-password-btn" style={{fontSize:'12px'}}>Update Password</button>
                </div>
              </form>
            )}
          </div>
          <hr />
          {/* Two-Factor Auth */}
          <div className="form-group switch-group">
            <label>Two-Factor Authentication:</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={twoFAEnabled}
                onChange={handleToggle2FA}
              />
              <span className="slider round"></span>
            </label>
            <span className="switch-label">{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};  

export default UserProfile;
