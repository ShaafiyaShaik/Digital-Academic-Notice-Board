import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";

const UserManagement = ({ darkMode, permissions }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    password: "",
    role: "student",
    adminLevel: "",
    departmentId: "",
    classId: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("UserManagement component mounted");
    console.log("Permissions:", permissions);
    fetchUsers();
    fetchDepartments();
    fetchClasses();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const response = await axios.get("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Users fetched:", response.data);
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Error loading users. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/departments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...userForm,
        orgCode: JSON.parse(localStorage.getItem("org")).orgCode
      };
      
      // Remove empty fields
      if (!payload.adminLevel) delete payload.adminLevel;
      if (!payload.departmentId) delete payload.departmentId;
      if (!payload.classId) delete payload.classId;

      await axios.post("http://localhost:5000/register", payload);
      
      alert("User created successfully!");
      setShowCreateForm(false);
      setUserForm({
        name: "",
        email: "",
        registrationNumber: "",
        password: "",
        role: "student",
        adminLevel: "",
        departmentId: "",
        classId: ""
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating user");
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  const getRoleBadge = (role, adminLevel) => {
    const styles = {
      student: { bg: "#3b82f6", text: "👨‍🎓 Student" },
      teacher: { bg: "#10b981", text: "👨‍🏫 Teacher" },
      admin: { 
        bg: adminLevel === 'SUPER_ADMIN' ? "#ef4444" : 
            adminLevel === 'DEPT_ADMIN' ? "#f59e0b" : "#22d3ee", 
        text: adminLevel === 'SUPER_ADMIN' ? "🔴 Super Admin" :
              adminLevel === 'DEPT_ADMIN' ? "🟡 Dept Admin" :
              adminLevel === 'ACADEMIC_ADMIN' ? "🟢 Academic Admin" :
              "👨‍💼 Admin"
      },
      faculty: { bg: "#8b5cf6", text: "👨‍🏫 Faculty" },
      librarian: { bg: "#ec4899", text: "📚 Librarian" }
    };

    const style = styles[role] || { bg: "#6b7280", text: role };
    
    return (
      <span style={{
        background: style.bg,
        color: "#fff",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600"
      }}>
        {style.text}
      </span>
    );
  };

  const cardStyle = {
    background: darkMode ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
    backdropFilter: "blur(12px)",
    border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
    borderRadius: "16px",
    padding: "24px"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    background: darkMode ? "rgba(30, 41, 59, 0.5)" : "#f8fafc",
    border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "#cbd5e1"}`,
    borderRadius: "8px",
    color: darkMode ? "#e2e8f0" : "#1e293b",
    fontSize: "14px",
    marginBottom: "12px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px"
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "16px"
        }}>⏳</div>
        <p style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "16px"
        }}>❌</div>
        <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</p>
        <button onClick={fetchUsers} style={buttonStyle}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: darkMode ? "#e2e8f0" : "#1e293b",
            marginBottom: "8px"
          }}>
            <FaUserShield style={{ marginRight: "12px", color: "#6366f1" }} />
            User Management
          </h1>
          <p style={{ color: darkMode ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
            Manage students, teachers, and administrators
          </p>
        </div>

        {permissions && permissions.canManageUsers && (
          <button onClick={() => setShowCreateForm(true)} style={buttonStyle}>
            <FaPlus /> Add New User
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        ...cardStyle,
        marginBottom: "24px",
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        {/* Search */}
        <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
          <FaSearch style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8"
          }} />
          <input
            type="text"
            placeholder="Search by name, email, or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: "40px",
              marginBottom: 0
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{ minWidth: "180px" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              ...inputStyle,
              marginBottom: 0,
              cursor: "pointer"
            }}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
            <option value="faculty">Faculty</option>
            <option value="librarian">Librarians</option>
          </select>
        </div>

        <div style={{
          padding: "12px 20px",
          background: darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)",
          borderRadius: "8px",
          color: "#6366f1",
          fontWeight: "600"
        }}>
          {filteredUsers.length} users
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            ...cardStyle,
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: darkMode ? "#e2e8f0" : "#1e293b",
              marginBottom: "20px"
            }}>
              Create New User
            </h2>

            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Full Name *"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                style={inputStyle}
                required
              />

              <input
                type="email"
                placeholder="Email *"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                style={inputStyle}
                required
              />

              <input
                type="text"
                placeholder="Registration Number"
                value={userForm.registrationNumber}
                onChange={(e) => setUserForm({ ...userForm, registrationNumber: e.target.value })}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password *"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                style={inputStyle}
                required
              />

              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                style={inputStyle}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="librarian">Librarian</option>
              </select>

              {/* Admin Level (only if role is admin) */}
              {userForm.role === "admin" && permissions && permissions.canCreateAdmin && (
                <select
                  value={userForm.adminLevel}
                  onChange={(e) => setUserForm({ ...userForm, adminLevel: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Admin Level</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="DEPT_ADMIN">Department Admin</option>
                  <option value="ACADEMIC_ADMIN">Academic Admin</option>
                </select>
              )}

              {/* Department (for dept admin) */}
              {userForm.role === "admin" && userForm.adminLevel === "DEPT_ADMIN" && (
                <select
                  value={userForm.departmentId}
                  onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              )}

              {/* Class (for students) */}
              {userForm.role === "student" && (
                <select
                  value={userForm.classId}
                  onChange={(e) => setUserForm({ ...userForm, classId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select Class (Optional)</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button type="submit" style={buttonStyle}>
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    ...buttonStyle,
                    background: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{
                borderBottom: `2px solid ${darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`
              }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#6366f1", fontWeight: "600" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#6366f1", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#6366f1", fontWeight: "600" }}>Reg. No.</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#6366f1", fontWeight: "600" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#6366f1", fontWeight: "600" }}>Class/Dept</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#6366f1", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"}`
                  }}
                >
                  <td style={{ padding: "12px", color: darkMode ? "#e2e8f0" : "#1e293b" }}>
                    {user.name}
                  </td>
                  <td style={{ padding: "12px", color: darkMode ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "12px", color: darkMode ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                    {user.registrationNumber || "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getRoleBadge(user.role, user.adminLevel)}
                  </td>
                  <td style={{ padding: "12px", color: darkMode ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                    {user.classId?.name || user.departmentId?.name || "-"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{
                          padding: "6px 12px",
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        <FaEdit />
                      </button>
                      {permissions && permissions.canManageUsers && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: darkMode ? "#94a3b8" : "#64748b"
            }}>
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
