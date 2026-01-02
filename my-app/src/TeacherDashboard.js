import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaBook, FaUsers, FaCheckCircle } from "react-icons/fa";

const TeacherDashboard = ({ handleLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [myTeaching, setMyTeaching] = useState([]);
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    date: '',
    urgent: false
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserName(storedUser.name);
    }
    fetchTeachingAssignments();
  }, []);

  const fetchTeachingAssignments = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/teaching-assignments/my',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyTeaching(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teaching assignments:", error);
      setLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.description || !noticeForm.date || !selectedAssignment) {
      alert('All fields are required');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/notices',
        {
          ...noticeForm,
          noticeType: 'subject',
          subjectId: selectedAssignment.subjectId._id,
          targetClassIds: selectedAssignment.classIds.map(c => c._id)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Notice created successfully!');
      setNoticeForm({
        title: '',
        description: '',
        category: 'academic',
        date: '',
        urgent: false
      });
      setSelectedAssignment(null);
      setShowCreateNotice(false);
    } catch (error) {
      alert('Error creating notice: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="student-universe">
        <div className="space-stars"></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-primary)',
          fontSize: '24px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="student-universe">
      <div className="space-stars"></div>
      <div className="floating-particles"></div>

      <div style={{ position: 'relative', zIndex: 1, padding: '28px' }}>
        {/* Header */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            👨‍🏫 Welcome, {userName}
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* My Teaching */}
          <div style={{
            background: 'var(--space-card)',
            border: '1px solid var(--space-border)',
            borderRadius: '16px',
            padding: '28px',
            backdropFilter: 'blur(12px)',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-cosmic)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginTop: 0,
              marginBottom: '20px'
            }}>
              <FaBook style={{ marginRight: '12px' }} />
              My Teaching Assignments
            </h2>

            {myTeaching.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                No teaching assignments yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {myTeaching.map(assignment => (
                  <div
                    key={assignment._id}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
                          {assignment.subjectId?.name}
                        </h3>
                        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          <FaUsers style={{ marginRight: '6px' }} />
                          Classes: {assignment.classIds?.map((c, i) => (
                            <span key={c._id}>{c.name}{i < assignment.classIds.length - 1 ? ', ' : ''}</span>
                          ))}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowCreateNotice(true);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <FaPlus style={{ marginRight: '6px' }} />
                        Create Notice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Notice Modal */}
          {showCreateNotice && selectedAssignment && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <div style={{
                background: 'var(--space-card)',
                border: '1px solid var(--space-border)',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '600px',
                width: '90%',
                backdropFilter: 'blur(12px)'
              }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
                  Create Notice for {selectedAssignment.subjectId?.name}
                </h2>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="e.g., Assignment 1 Submission"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--space-border)',
                      background: 'rgba(99, 102, 241, 0.05)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Description *
                  </label>
                  <textarea
                    value={noticeForm.description}
                    onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                    placeholder="Enter notice details..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--space-border)',
                      background: 'rgba(99, 102, 241, 0.05)',
                      color: 'var(--text-primary)',
                      minHeight: '100px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Category *
                    </label>
                    <select
                      value={noticeForm.category}
                      onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--space-border)',
                        background: 'rgba(99, 102, 241, 0.05)',
                        color: 'var(--text-primary)',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="academic">Academic</option>
                      <option value="general">General</option>
                      <option value="events">Events</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Deadline *
                    </label>
                    <input
                      type="date"
                      value={noticeForm.date}
                      onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--space-border)',
                        background: 'rgba(99, 102, 241, 0.05)',
                        color: 'var(--text-primary)',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={noticeForm.urgent}
                      onChange={(e) => setNoticeForm({ ...noticeForm, urgent: e.target.checked })}
                    />
                    <span>Mark as Urgent 🔥</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCreateNotice}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    <FaCheckCircle style={{ marginRight: '6px' }} />
                    Create Notice
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateNotice(false);
                      setSelectedAssignment(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--space-border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
