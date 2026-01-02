import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell, FaHome, 
  FaClipboardList, FaUserEdit, FaSignOutAlt, FaSearch, FaCalendarAlt,
  FaExclamationTriangle, FaStar, FaFire } from "react-icons/fa";
import "./CosmicTheme.css";

const Student = ({ handleLogout: appHandleLogout }) => {
  // State variables
  const [darkMode, setDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [notices, setNotices] = useState([]);
  const [urgentNotices, setUrgentNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUrgentIndex, setCurrentUrgentIndex] = useState(0);
  
  const navigate = useNavigate();
  
  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      // Updated endpoint to fetch notices visible to this student
      const response = await axios.get("http://localhost:5000/notices/student/feed", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Directly set notices as received from backend
      setNotices(response.data);
      
      // Filter urgent notices
      const urgent = response.data.filter(notice => notice.urgent);
      setUrgentNotices(urgent);
      
      // Check for new notices since last visit
      const lastVisitTime = localStorage.getItem("lastVisitTime") || 0;
      const currentTime = new Date().getTime();
      
      // Retrieve existing notifications from localStorage
      const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      
      // Filter notices that are new since last visit and not already in existing notifications
      const newNotices = response.data.filter(notice => {
        const noticeDate = new Date(notice.createdAt || notice.date).getTime();
        return noticeDate > lastVisitTime && 
               !existingNotifications.some(existingNotif => existingNotif.id === notice._id);
      });
      
      // Update notifications only with truly new notices
      if (newNotices.length > 0) {
        const updatedNotifications = [
          ...newNotices.map(notice => ({
            id: notice._id,
            title: notice.title,
            date: notice.date,
            isRead: false,
            category: notice.category,
            urgent: notice.urgent
          })),
          ...existingNotifications
        ];
        
        setNotifications(updatedNotifications);
        
        // Update unread count
        const unreadNotifications = updatedNotifications.filter(notif => !notif.isRead);
        setUnreadCount(unreadNotifications.length);
      }
      
      // Update last visit time
      localStorage.setItem("lastVisitTime", currentTime);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  // Rotate through urgent notices
  useEffect(() => {
    if (urgentNotices.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentUrgentIndex(prevIndex => 
        prevIndex === urgentNotices.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change notice every 5 seconds
    
    return () => clearInterval(interval);
  }, [urgentNotices]);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = JSON.parse(localStorage.getItem("user"));
      
      if (!token || !savedUser) {
        // Redirect to login with history state to prevent back button issues
        navigate("/login", { replace: true });
        return false;
      }
      
      // Verify user role
      if (savedUser.role !== "student") {
        // Redirect to appropriate page based on role
        if (savedUser.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return false;
      }
      
      // User is authenticated as student
      setUserName(savedUser.name);
      return true;
    };
    
    const isAuth = checkAuth();
    
    if (isAuth) {
      // Set dark mode preferences
      const savedDarkMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedDarkMode);
      document.body.classList.toggle("dark-mode", savedDarkMode);
      
      // Fetch notices
      fetchNotices();
      
      // Load saved notifications from localStorage
      const savedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      setNotifications(savedNotifications);
      
      // Calculate unread count
      const unreadNotifications = savedNotifications.filter(notif => !notif.isRead);
      setUnreadCount(unreadNotifications.length);
      
      // Set up polling to check for new notices every minute
      const intervalId = setInterval(fetchNotices, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [navigate]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("light-theme", newMode);
    localStorage.setItem("darkMode", newMode);
  };
  
  // Filter notices based on search, date, and category
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? notice.date === selectedDate : true;
    const matchesCategory = selectedCategory ? notice.category === selectedCategory : true;
    
    return matchesSearch && matchesDate && matchesCategory;
  });

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false); // Close notification dropdown if open
  };
  
  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false); // Close account dropdown if open
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };
  
  // View notification details
  const viewNotificationDetails = (id) => {
    markAsRead(id);
    const notice = notices.find(notice => notice._id === id);
    setSelectedNotice(notice);
    setIsModalOpen(true);
    setIsNotificationOpen(false);
    
    // Mark notice as read on backend
    markNoticeAsRead(notice._id);
  };

  // View notice details
  const viewNoticeDetails = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
    
    // Mark notice as read on backend
    markNoticeAsRead(notice._id);
  };
  
  // Mark notice as read on backend
  const markNoticeAsRead = async (noticeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/notices/${noticeId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Error marking notice as read:", error);
      // Silent fail - don't interrupt user experience
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("notifications");
  };

  // Toggle sidebar collapse
  

  // Set active tab and close mobile menu
  const setTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".account-container") && !event.target.closest(".notification-container")) {
        setIsDropdownOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle logout with history replacement to prevent back button issues
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Show loading state if not authenticated
  if (!userName) {
    return (
      <div className="student-universe">
        <div className="space-stars"></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'white',
          fontSize: '24px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="student-universe">
      {/* Space Background */}
      <div className="space-stars"></div>
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
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
            <div className="sidebar-logo-icon">🚀</div>
            <div className="sidebar-logo-text">Notice Portal</div>
          </div>
          
          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeTab === "home" ? "active" : ""}`} 
              onClick={() => setTab("home")}
            >
              <span className="nav-icon"><FaHome /></span>
              <span>Dashboard</span>
            </div>
            <div 
              className={`nav-item ${activeTab === "notices" ? "active" : ""}`} 
              onClick={() => setTab("notices")}
            >
              <span className="nav-icon"><FaClipboardList /></span>
              <span>All Notices</span>
            </div>
            <Link to="/account" className="nav-item">
              <span className="nav-icon"><FaUserEdit /></span>
              <span>My Account</span>
            </Link>
          </nav>
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--space-border)' }}>
            <div className="nav-item" onClick={onLogout} style={{ color: 'var(--cosmic-danger)' }}>
              <span className="nav-icon"><FaSignOutAlt /></span>
              <span>Logout</span>
            </div>
          </div>
        </div>
  
        {/* Main Content Area */}
        <div className="cosmic-main">
          {/* Cosmic Header */}
          <div className="cosmic-header">
            <div className="header-welcome">
              <h1>✨ Welcome, {userName}!</h1>
              <p>Explore your digital notice universe</p>
            </div>
            <div className="header-actions" style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', gap: '16px', maxWidth: '600px' }}>
              <div className="search-cosmic" style={{ flex: '1', maxWidth: '350px' }}>
                <span className="search-icon"><FaSearch /></span>
                <input 
                  type="text" 
                  placeholder="Search notices..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="cosmic-btn-icon" onClick={toggleNotifications}>
                <FaBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              <div className="user-avatar-cosmic" onClick={toggleDropdown}>
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </div>
            </div>
          </div>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div style={{
              position: 'fixed',
              top: '90px',
              right: '100px',
              zIndex: 1000,
              background: 'var(--space-card)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--space-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              minWidth: '350px',
              maxHeight: '500px',
              overflow: 'auto',
              boxShadow: 'var(--shadow-cosmic)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700' }}>Notifications</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={markAllAsRead} style={{
                    padding: '6px 12px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--cosmic-primary)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>Mark all read</button>
                  <button onClick={clearAllNotifications} style={{
                    padding: '6px 12px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--cosmic-danger)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>Clear</button>
                </div>
              </div>
              {notifications.length > 0 ? notifications.map((notification) => (
                <div key={notification.id} onClick={() => viewNotificationDetails(notification.id)} style={{
                  padding: '14px',
                  background: notification.isRead ? 'rgba(255, 255, 255, 0.03)' : 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: notification.isRead ? '1px solid transparent' : '1px solid var(--cosmic-primary)'
                }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>{notification.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{notification.date}</p>
                </div>
              )) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No notifications</p>}
            </div>
          )}

          {/* User Dropdown */}
          {isDropdownOpen && (
            <div style={{
              position: 'fixed',
              top: '90px',
              right: '24px',
              zIndex: 1000,
              background: 'var(--space-card)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--space-border)',
              borderRadius: 'var(--radius)',
              padding: '12px',
              minWidth: '200px',
              boxShadow: 'var(--shadow-cosmic)'
            }}>
              <Link to="/account" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s'
              }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <FaUserEdit />
                <span>My Account</span>
              </Link>
              <div onClick={onLogout} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                color: 'var(--cosmic-danger)',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.3s'
              }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <FaSignOutAlt />
                <span>Logout</span>
              </div>
            </div>
          )}
  
          {/* Urgent Banner */}
          {urgentNotices.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--cosmic-danger)',
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              animation: 'glow 2s infinite'
            }} onClick={() => viewNoticeDetails(urgentNotices[currentUrgentIndex])}>
              <FaFire style={{ fontSize: '20px', color: 'var(--cosmic-danger)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '15px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {urgentNotices[currentUrgentIndex].title}
                </h3>
              </div>
              {urgentNotices.length > 1 && (
                <span style={{
                  padding: '4px 10px',
                  background: 'rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {currentUrgentIndex + 1}/{urgentNotices.length}
                </span>
              )}
            </div>
          )}
  
          {/* Home Tab Content */}
          {activeTab === "home" && (
            <div>
              {/* Stats Grid - Compact */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'var(--space-card)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--space-border)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--cosmic-primary), var(--cosmic-secondary))',
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>📋</div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{notices.length}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Total Notices</p>
                  </div>
                </div>
                <div style={{
                  background: 'var(--space-card)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--space-border)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>🔥</div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{urgentNotices.length}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Urgent Notices</p>
                  </div>
                </div>
                <div style={{
                  background: 'var(--space-card)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--space-border)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--cosmic-accent), #ec4899)',
                    borderRadius: '12px',
                    fontSize: '24px'
                  }}>🔔</div>
                  <div>
                    <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{unreadCount}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>New Updates</p>
                  </div>
                </div>
              </div>
  
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, var(--cosmic-secondary), var(--cosmic-accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaStar style={{ color: 'var(--cosmic-accent)' }} />
                Recent Notices
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {notices.slice(0, 6).map((notice) => (
                  <div 
                    key={notice._id} 
                    style={{
                      background: 'var(--space-card)',
                      backdropFilter: 'blur(12px)',
                      border: notice.urgent ? '1px solid var(--cosmic-danger)' : '1px solid var(--space-border)',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => viewNoticeDetails(notice)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.3)';
                      e.currentTarget.style.borderColor = 'var(--cosmic-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = notice.urgent ? 'var(--cosmic-danger)' : 'var(--space-border)';
                    }}
                  >
                    {notice.urgent && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: 'linear-gradient(90deg, var(--cosmic-danger), var(--cosmic-warning))',
                        animation: 'glow 2s infinite'
                      }} />
                    )}
                    <div style={{ marginBottom: '10px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>{notice.title}</h3>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: notice.category === 'academic' ? 'rgba(34, 211, 238, 0.2)' : 
                                   notice.category === 'events' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        color: notice.category === 'academic' ? 'var(--cosmic-secondary)' : 
                               notice.category === 'events' ? 'var(--cosmic-accent)' : 'var(--cosmic-primary)'
                      }}>
                        {notice.category}
                      </span>
                    </div>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}>
                      {notice.description?.substring(0, 80)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--space-border)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        <FaCalendarAlt style={{ fontSize: '10px' }} />
                        {notice.date}
                      </span>
                      {notice.urgent && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          color: 'var(--cosmic-danger)',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          <FaExclamationTriangle style={{ fontSize: '10px' }} />
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Notices Tab Content */}
          {activeTab === "notices" && (
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--space-border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--space-border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                  <option value="general">General</option>
                </select>
                {(selectedDate || selectedCategory) && (
                  <button 
                    onClick={() => { setSelectedDate(''); setSelectedCategory(''); }}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, var(--cosmic-primary), var(--cosmic-accent))',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
  
              {/* Separate notices by type */}
              {(() => {
                const collegeNotices = filteredNotices.filter(n => n.noticeType === 'admin');
                const classNotices = filteredNotices.filter(n => n.noticeType === 'subject');
                
                return (
                  <>
                    {/* COLLEGE NOTICES SECTION */}
                    {collegeNotices.length > 0 && (
                      <div style={{ marginBottom: '40px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '20px',
                          paddingBottom: '12px',
                          borderBottom: '2px solid var(--cosmic-primary)'
                        }}>
                          <FaStar style={{ fontSize: '20px', color: 'var(--cosmic-warning)' }} />
                          <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            margin: 0
                          }}>
                            Official College Notices
                          </h2>
                          <span style={{
                            marginLeft: 'auto',
                            background: 'var(--cosmic-warning)',
                            color: '#000',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {collegeNotices.length}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: '16px'
                        }}>
                          {collegeNotices.map((notice) => (
                    <div 
                      key={notice._id}
                      style={{
                        background: 'var(--space-card)',
                        backdropFilter: 'blur(12px)',
                        border: notice.urgent ? '1px solid var(--cosmic-danger)' : '1px solid var(--space-border)',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => viewNoticeDetails(notice)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.3)';
                        e.currentTarget.style.borderColor = 'var(--cosmic-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = notice.urgent ? 'var(--cosmic-danger)' : 'var(--space-border)';
                      }}
                    >
                      {notice.urgent && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '3px',
                          background: 'linear-gradient(90deg, var(--cosmic-danger), var(--cosmic-warning))',
                          animation: 'glow 2s infinite'
                        }} />
                      )}
                      <div style={{ marginBottom: '10px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                          lineHeight: '1.3'
                        }}>{notice.title}</h3>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: notice.category === 'academic' ? 'rgba(34, 211, 238, 0.2)' : 
                                     notice.category === 'events' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: notice.category === 'academic' ? 'var(--cosmic-secondary)' : 
                                 notice.category === 'events' ? 'var(--cosmic-accent)' : 'var(--cosmic-primary)'
                        }}>
                          {notice.category}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                      }}>
                        {notice.description?.substring(0, 100)}...
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--space-border)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          <FaCalendarAlt style={{ fontSize: '10px' }} />
                          {notice.date}
                        </span>
                        {notice.urgent && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            color: 'var(--cosmic-danger)',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            <FaExclamationTriangle style={{ fontSize: '10px' }} />
                            URGENT
                          </span>
                        )}
                      </div>
                    </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CLASS NOTICES SECTION */}
                    {classNotices.length > 0 && (
                      <div style={{ marginBottom: '40px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '20px',
                          paddingBottom: '12px',
                          borderBottom: '2px solid var(--cosmic-secondary)'
                        }}>
                          <FaClipboardList style={{ fontSize: '20px', color: 'var(--cosmic-secondary)' }} />
                          <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            margin: 0
                          }}>
                            Class Notices
                          </h2>
                          <span style={{
                            marginLeft: 'auto',
                            background: 'var(--cosmic-secondary)',
                            color: '#000',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {classNotices.length}
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: '16px'
                        }}>
                          {classNotices.map((notice) => (
                    <div 
                      key={notice._id}
                      style={{
                        background: 'var(--space-card)',
                        backdropFilter: 'blur(12px)',
                        border: notice.urgent ? '1px solid var(--cosmic-danger)' : '1px solid var(--space-border)',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => viewNoticeDetails(notice)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(34, 211, 238, 0.3)';
                        e.currentTarget.style.borderColor = 'var(--cosmic-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = notice.urgent ? 'var(--cosmic-danger)' : 'var(--space-border)';
                      }}
                    >
                      {notice.urgent && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '3px',
                          background: 'linear-gradient(90deg, var(--cosmic-danger), var(--cosmic-warning))',
                          animation: 'glow 2s infinite'
                        }} />
                      )}
                      <div style={{ marginBottom: '10px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                          lineHeight: '1.3'
                        }}>{notice.title}</h3>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: notice.category === 'academic' ? 'rgba(34, 211, 238, 0.2)' : 
                                     notice.category === 'events' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: notice.category === 'academic' ? 'var(--cosmic-secondary)' : 
                                 notice.category === 'events' ? 'var(--cosmic-accent)' : 'var(--cosmic-primary)'
                        }}>
                          {notice.category}
                        </span>
                      </div>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        marginBottom: '12px'
                      }}>
                        {notice.description?.substring(0, 100)}...
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--space-border)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          <FaCalendarAlt style={{ fontSize: '10px' }} />
                          {notice.date}
                        </span>
                        {notice.urgent && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            color: 'var(--cosmic-danger)',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            <FaExclamationTriangle style={{ fontSize: '10px' }} />
                            URGENT
                          </span>
                        )}
                      </div>
                    </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NO NOTICES STATE */}
                    {collegeNotices.length === 0 && classNotices.length === 0 && (
                      <div className="loading-cosmic">
                        <div style={{ fontSize: '64px' }}>🔍</div>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '24px', marginBottom: '8px' }}>
                          No notices found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Try adjusting your search or filters
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
  
          {/* Notice Detail Modal */}
          {isModalOpen && selectedNotice && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }} onClick={() => setIsModalOpen(false)}>
              <div style={{
                background: 'var(--space-card)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--space-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: 'var(--shadow-cosmic)',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsModalOpen(false)} style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--cosmic-danger)',
                  borderRadius: '50%',
                  color: 'var(--cosmic-danger)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>×</button>
                
                <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, var(--cosmic-secondary), var(--cosmic-accent))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '12px'
                  }}>{selectedNotice.title}</h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span className={`notice-category-badge category-${selectedNotice.category}`}>
                      {selectedNotice.category}
                    </span>
                    {selectedNotice.urgent && (
                      <span className="urgent-indicator">
                        <FaExclamationTriangle style={{ fontSize: '12px' }} />
                        URGENT
                      </span>
                    )}
                    <span style={{
                      padding: '6px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      <FaCalendarAlt style={{ fontSize: '10px', marginRight: '6px' }} />
                      {selectedNotice.date}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--space-border)',
                  marginBottom: '20px'
                }}>
                  <p style={{
                    color: 'var(--text-primary)',
                    lineHeight: '1.8',
                    fontSize: '16px'
                  }}>{selectedNotice.description}</p>
                </div>
                
                {selectedNotice.publisher && (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--cosmic-primary)',
                    marginTop: '20px'
                  }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <strong style={{ color: 'var(--cosmic-primary)' }}>Published by:</strong> {selectedNotice.publisher}
                    </p>
                  </div>
                )}
                
                {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{
                      color: 'var(--text-primary)',
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '12px'
                    }}>Attachments</h3>
                    {selectedNotice.attachments.map((attachment, index) => (
                      <a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'block',
                        padding: '12px 16px',
                        background: 'rgba(34, 211, 238, 0.1)',
                        border: '1px solid var(--cosmic-secondary)',
                        borderRadius: '12px',
                        color: 'var(--cosmic-secondary)',
                        textDecoration: 'none',
                        marginBottom: '8px',
                        transition: 'all 0.3s'
                      }}>
                        📎 {attachment.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;