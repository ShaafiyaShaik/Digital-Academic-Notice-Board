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
      <div className="login-box" style={{ maxWidth: '900px', padding: '32px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>🔐 Test Credentials</h2>
        
        {/* Organizations Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#6366f1', marginBottom: '16px', fontSize: '20px' }}>📋 Organizations</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(99, 102, 241, 0.1)', borderBottom: '2px solid #6366f1' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Org Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#22d3ee' }}>{org.code}</td>
                    <td style={{ padding: '12px' }}>{org.name}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{org.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h3 style={{ color: '#6366f1', marginBottom: '16px', fontSize: '20px' }}>👥 Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(99, 102, 241, 0.1)', borderBottom: '2px solid #6366f1' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Password</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Reg #</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Organization</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6366f1' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px', color: '#22d3ee' }}>{user.email}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>{user.password}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: user.role === 'admin' ? '#ef4444' : '#6366f1'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>{user.regNumber}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>{user.org}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleUseCredential(user.email, user.password, user.role)}
                        style={{
                          padding: '6px 12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
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

        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(34, 211, 238, 0.1)', borderRadius: '12px', border: '1px solid #22d3ee' }}>
          <p style={{ margin: 0, color: '#22d3ee', fontSize: '14px' }}>
            💡 <strong>Tip:</strong> Use any email + password + role combination above to test the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credentials;
