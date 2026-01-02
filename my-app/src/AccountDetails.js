import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CosmicTheme.css";
import "./AccountDetails.css";

const AccountDetails = ({ handleLogout }) => {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedOrg = JSON.parse(localStorage.getItem("org"));

    if (storedUser) {
      setUser(storedUser);
      setEditedName(storedUser.name);
      setEditedEmail(storedUser.email);
    }

    if (storedOrg) {
      setOrg(storedOrg);
    }

    setLoading(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditedName(user.name);
      setEditedEmail(user.email);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        {
          name: editedName,
          email: editedEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = { ...user, name: editedName, email: editedEmail };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile. Please try again.");
    }
  };

  const handleLogoutClick = () => {
    if (handleLogout) {
      handleLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("org");
      localStorage.removeItem("orgCode");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="student-universe">
        <div className="space-stars"></div>
        <div className="floating-particles"></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-primary)',
          fontSize: '24px',
          position: 'relative',
          zIndex: 1
        }}>
          Loading account details...
        </div>
      </div>
    );
  }

  return (
    <div className="student-universe">
      {/* Space Background */}
      <div className="space-stars"></div>
      <div className="floating-particles"></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="account-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>My Account</h1>
      </div>

      <div className="account-content">
        {/* Profile Card */}
        <div className="glass-card profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <h2>{user?.name}</h2>
                <p className="email">{user?.email}</p>
                <span className={`role-badge role-${user?.role}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            <div className="profile-actions">
              {!isEditing ? (
                <button className="btn-edit" onClick={handleEditToggle}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn-save" onClick={handleSaveChanges}>
                    💾 Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleEditToggle}>
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Organization Card */}
        {org && (
          <div className="glass-card organization-card">
            <h3>🏢 Organization Details</h3>
            <div className="org-details">
              <div className="org-item">
                <span className="label">Organization:</span>
                <span className="value">{org.orgName}</span>
              </div>
              <div className="org-item">
                <span className="label">Organization Code:</span>
                <span className="value code">{org.orgCode}</span>
              </div>
              {org.address && (
                <div className="org-item">
                  <span className="label">Address:</span>
                  <span className="value">{org.address}</span>
                </div>
              )}
              {org.logoUrl && (
                <div className="org-logo">
                  <img src={org.logoUrl} alt="Organization Logo" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Stats */}
        <div className="glass-card account-stats">
          <h3>📊 Account Information</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">User ID</span>
              <span className="stat-value">{user?._id}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Role</span>
              <span className="stat-value">{user?.role}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Organization ID</span>
              <span className="stat-value">{user?.orgId}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <button className="btn-logout" onClick={handleLogoutClick}>
            🚪 Logout
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AccountDetails;
