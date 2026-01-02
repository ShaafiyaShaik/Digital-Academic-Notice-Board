import React from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";

const Credentials = () => {
  const navigate = useNavigate();

  const handleUseCredential = (email, password, role) => {
    sessionStorage.setItem("tempEmail", email);
    sessionStorage.setItem("tempPassword", password);
    sessionStorage.setItem("tempRole", role);
    navigate("/login");
  };

  const organizations = [
    { code: "LEGACY001", name: "Legacy College", address: "Default Organization" },
    { code: "VFSTR1", name: "VFSTR College", address: "Hyderabad, India" },
    { code: "VIGNAN1", name: "Vignan University", address: "Visakhapatnam, India" },
    { code: "SAMPLE1", name: "Sample Institute", address: "Bangalore, India" }
  ];

  const users = [
    {
      name: "Admin Test",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      regNumber: "ADMIN001",
      org: "Any Organization"
    },
    {
      name: "Teacher Test",
      email: "teacher@example.com",
      password: "teacher123",
      role: "teacher",
      regNumber: "TEACH001",
      org: "Any Organization"
    },
    {
      name: "Student Test",
      email: "student@example.com",
      password: "student123",
      role: "student",
      regNumber: "STU001",
      org: "Any Organization"
    },
    {
      name: "admin1",
      email: "admin11@gmail.com",
      password: "Admin@123",
      role: "admin",
      regNumber: "101",
      org: "Legacy College (LEGACY001)"
    },
    {
      name: "teacher1",
      email: "teacher1@gmail.com",
      password: "Teacher1@123",
      role: "teacher",
      regNumber: "V101",
      org: "VFSTR College (VFSTR1)"
    },
    {
      name: "student1",
      email: "student1@gmail.com",
      password: "Student1@123",
      role: "student",
      regNumber: "S101",
      org: "VFSTR College (VFSTR1)"
    },
    {
      name: "teacher2",
      email: "teacher2@gmail.com",
      password: "Teacher2@123",
      role: "teacher",
      regNumber: "V201",
      org: "Vignan University (VIGNAN1)"
    },
    {
      name: "Student2",
      email: "student2@gmail.com",
      password: "Student2@123",
      role: "student",
      regNumber: "S201",
      org: "Vignan University (VIGNAN1)"
    }
  ];

  return (
    <div className="login-page">
      <button className="back-button" onClick={() => navigate("/login")}>← Back to Login</button>
      <div className="login-box" style={{ maxWidth: '1100px', padding: '24px', width: '95%' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '20px' }}>🔐 Test Credentials</h2>
        
        {/* Organizations Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#6366f1', marginBottom: '12px', fontSize: '16px' }}>📋 Organizations</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(99, 102, 241, 0.1)', borderBottom: '2px solid #6366f1' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Org Code</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#22d3ee' }}>{org.code}</td>
                    <td style={{ padding: '10px' }}>{org.name}</td>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>{org.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h3 style={{ color: '#6366f1', marginBottom: '12px', fontSize: '16px' }}>👥 Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(99, 102, 241, 0.1)', borderBottom: '2px solid #6366f1' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Password</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Role</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Reg #</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Organization</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#6366f1' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px', color: '#22d3ee' }}>{user.email}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>{user.password}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '3px 7px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: user.role === 'admin' ? '#ef4444' : '#6366f1'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>{user.regNumber}</td>
                    <td style={{ padding: '10px', fontSize: '11px', color: '#64748b' }}>{user.org}</td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleUseCredential(user.email, user.password, user.role)}
                        style={{
                          padding: '5px 10px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#059669'}
                        onMouseOut={(e) => e.target.style.background = '#10b981'}
                      >
                        Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '10px', border: '1px solid #22d3ee' }}>
          <p style={{ margin: 0, color: '#22d3ee', fontSize: '12px' }}>
            💡 <strong>Tip:</strong> Click "Use" button to auto-fill login credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credentials;
