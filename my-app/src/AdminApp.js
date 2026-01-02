import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./admin/Dashboard";
import ManageNotices from "./admin/ManageNotices";
import CreateNotice from "./admin/CreateNotice";
import AcademicStructure from "./admin/AcademicStructure";
import UserManagement from "./admin/UserManagement";
import CategoriesManagement from "./admin/CategoryManagement";
import Settings from "./admin/Settings";
import axios from "axios";
import { FaHome, FaTasks, FaPlus, FaCog, FaUserCircle, FaSignOutAlt, FaUniversity, FaUsers } from "react-icons/fa";
import "./CosmicTheme.css";
import API_URL from "./config";

const AdminApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notices, setNotices] = useState([]);
  const [categories, setCategories] = useState(["general", "academic", "events"]);
  const [permissions, setPermissions] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchNotices();
    fetchPermissions();
    setDarkMode(localStorage.getItem("darkMode") === "true");
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${API_URL}/notices`);
      setNotices(response.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(response.data);
      console.log("Permissions loaded:", response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      // Default to super admin for backward compatibility
      setPermissions({
        adminLevel: 'SUPER_ADMIN',
        canManageDepartments: true,
        canManageDeptClasses: true,
        canManageDeptSubjects: true,
        canAssignDeptTeachers: true,
        canCreateOrgNotice: true,
        canViewAllAnalytics: true,
        canManageUsers: true // Added this
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <div className="admin-universe">
      {/* Space Background */}
      <div className="space-stars"></div>
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}></div>
        ))}
      </div>

      <div className="dashboard-cosmic">
        {/* Cosmic Sidebar */}
        <div className="cosmic-sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">👨‍💼</div>
            <div className="sidebar-logo-text">
              Admin Portal
              {permissions && (
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  marginTop: '4px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: permissions.adminLevel === 'SUPER_ADMIN' ? 'rgba(239, 68, 68, 0.2)' :
                             permissions.adminLevel === 'DEPT_ADMIN' ? 'rgba(251, 191, 36, 0.2)' :
                             'rgba(34, 211, 238, 0.2)',
                  color: permissions.adminLevel === 'SUPER_ADMIN' ? '#ef4444' :
                         permissions.adminLevel === 'DEPT_ADMIN' ? '#fbbf24' :
                         '#22d3ee',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {permissions.adminLevel === 'SUPER_ADMIN' ? '🔴 Super Admin' :
                   permissions.adminLevel === 'DEPT_ADMIN' ? '🟡 Dept Admin' :
                   permissions.adminLevel === 'ACADEMIC_ADMIN' ? '🟢 Academic Admin' :
                   'Admin'}
                </div>
              )}
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <Link 
              to="/admin" 
              className={`nav-item ${location.pathname === "/admin" ? "active" : ""}`}
            >
              <span className="nav-icon"><FaHome /></span>
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/admin/manage" 
              className={`nav-item ${location.pathname === "/admin/manage" ? "active" : ""}`}
            >
              <span className="nav-icon"><FaTasks /></span>
              <span>Manage Notices</span>
            </Link>
            <Link 
              to="/admin/create" 
              className={`nav-item ${location.pathname === "/admin/create" ? "active" : ""}`}
            >
              <span className="nav-icon"><FaPlus /></span>
              <span>Create Notice</span>
            </Link>
            
            {/* Show Academic Structure for admins with department/class management permissions */}
            {permissions && (permissions.canManageDepartments || permissions.canManageDeptClasses) && (
              <Link 
                to="/admin/academic" 
                className={`nav-item ${location.pathname === "/admin/academic" ? "active" : ""}`}
              >
                <span className="nav-icon"><FaUniversity /></span>
                <span>Academic Structure</span>
              </Link>
            )}
            
            {/* Show User Management for admins with user management permissions */}
            {/* DEBUG: Temporarily always show */ true && (
              <Link 
                to="/admin/users" 
                className={`nav-item ${location.pathname === "/admin/users" ? "active" : ""}`}
              >
                <span className="nav-icon"><FaUsers /></span>
                <span>Manage Users</span>
              </Link>
            )}
            
            <Link 
              to="/account" 
              className={`nav-item ${location.pathname === "/account" ? "active" : ""}`}
            >
              <span className="nav-icon"><FaUserCircle /></span>
              <span>My Account</span>
            </Link>
            <Link 
              to="/admin/settings" 
              className={`nav-item ${location.pathname === "/admin/settings" ? "active" : ""}`}
            >
              <span className="nav-icon"><FaCog /></span>
              <span>Settings</span>
            </Link>
          </nav>
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--space-border)' }}>
            <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--cosmic-danger)' }}>
              <span className="nav-icon"><FaSignOutAlt /></span>
              <span>Logout</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="cosmic-main">
          <Routes>
            <Route path="/" element={<Dashboard notices={notices} categories={categories} darkMode={darkMode} permissions={permissions} />} />
            <Route path="/manage" element={<ManageNotices notices={notices} fetchNotices={fetchNotices} darkMode={darkMode} />} />
            <Route path="/create" element={<CreateNotice fetchNotices={fetchNotices} categories={categories} darkMode={darkMode} />} />
            <Route path="/academic" element={<AcademicStructure permissions={permissions} darkMode={darkMode} />} />
            <Route path="/users" element={<UserManagement permissions={permissions} darkMode={darkMode} />} />
            <Route path="/categories" element={<CategoriesManagement categories={categories} setCategories={setCategories} darkMode={darkMode} />} />
            <Route path="/settings" element={<Settings darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminApp;