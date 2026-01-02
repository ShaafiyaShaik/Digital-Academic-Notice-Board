import React from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaFire, FaCheckCircle, FaChartLine, FaPlus, FaTasks, FaCalendarAlt } from "react-icons/fa";

const Dashboard = ({ notices, categories, darkMode }) => {
  // Calculate dashboard statistics
  const totalNotices = notices.length;
  const urgentNotices = notices.filter(notice => notice.urgent).length;
  const expiredNotices = notices.filter(notice => new Date(notice.date) < new Date()).length;
  const activeNotices = totalNotices - expiredNotices;
  
  // Get 5 most recent notices
  const recentNotices = [...notices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate notices by category
  const noticesByCategory = {};
  categories.forEach(category => {
    noticesByCategory[category] = notices.filter(notice => notice.category === category).length;
  });

  return (
    <div>
      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, var(--cosmic-secondary), var(--cosmic-accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '28px'
      }}>
        📊 Admin Dashboard
      </h2>
      
      {/* Stats Cards */}
      <div className="stats-grid-cosmic" style={{ marginBottom: '32px' }}>
        <div className="stat-card-cosmic">
          <div className="stat-icon-cosmic" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <FaClipboardList />
          </div>
          <div className="stat-content-cosmic">
            <h3>{totalNotices}</h3>
            <p>Total Notices</p>
          </div>
        </div>
        <div className="stat-card-cosmic">
          <div className="stat-icon-cosmic" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <FaCheckCircle />
          </div>
          <div className="stat-content-cosmic">
            <h3>{activeNotices}</h3>
            <p>Active Notices</p>
          </div>
        </div>
        <div className="stat-card-cosmic">
          <div className="stat-icon-cosmic" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            <FaFire />
          </div>
          <div className="stat-content-cosmic">
            <h3>{urgentNotices}</h3>
            <p>Urgent Notices</p>
          </div>
        </div>
        <div className="stat-card-cosmic">
          <div className="stat-icon-cosmic" style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
            <FaChartLine />
          </div>
          <div className="stat-content-cosmic">
            <h3>{categories.length}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <Link to="/admin/create" className="cosmic-btn-primary" style={{
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaPlus /> Create New Notice
        </Link>
        <Link to="/admin/manage" style={{
          padding: '12px 28px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--space-border)',
          borderRadius: '12px',
          color: 'var(--text-primary)',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaTasks /> Manage Notices
        </Link>
      </div>

      {/* Recent Notices */}
      <div style={{
        background: 'var(--space-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--space-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-cosmic)'
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaCalendarAlt style={{ color: 'var(--cosmic-secondary)' }} />
          Recent Notices
        </h3>
        {recentNotices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentNotices.map((notice, index) => (
              <div key={index} style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--space-border)',
                borderRadius: '12px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.borderColor = 'var(--cosmic-primary)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'var(--space-border)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: '0', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600' }}>
                    {notice.title}
                  </h4>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: notice.urgent ? 'rgba(239, 68, 68, 0.2)' : 
                               (new Date(notice.date) < new Date() ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                    color: notice.urgent ? 'var(--cosmic-danger)' : 
                          (new Date(notice.date) < new Date() ? 'var(--text-muted)' : 'var(--cosmic-success)'),
                    border: `1px solid ${notice.urgent ? 'var(--cosmic-danger)' : 
                            (new Date(notice.date) < new Date() ? 'var(--text-muted)' : 'var(--cosmic-success)')}`
                  }}>
                    {notice.urgent ? "🔥 URGENT" : (new Date(notice.date) < new Date() ? "EXPIRED" : "✓ ACTIVE")}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`notice-category-badge category-${notice.category}`}>
                    {notice.category}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    <FaCalendarAlt style={{ fontSize: '10px', marginRight: '6px' }} />
                    {notice.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p>No notices available yet</p>
          </div>
        )}
      </div>

      {/* Notices by Category */}
      <div style={{
        background: 'var(--space-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--space-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-cosmic)'
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📊 Notices by Category
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((category, index) => {
            const count = noticesByCategory[category] || 0;
            const colors = [
              { bg: 'rgba(99, 102, 241, 0.2)', border: 'var(--cosmic-primary)', text: 'var(--cosmic-primary)' },
              { bg: 'rgba(34, 211, 238, 0.2)', border: 'var(--cosmic-secondary)', text: 'var(--cosmic-secondary)' },
              { bg: 'rgba(168, 85, 247, 0.2)', border: 'var(--cosmic-accent)', text: 'var(--cosmic-accent)' },
            ];
            const colorSet = colors[index % colors.length];
            
            return (
              <div key={index} style={{
                padding: '20px',
                borderRadius: '16px',
                background: colorSet.bg,
                border: `1px solid ${colorSet.border}`,
                transition: 'all 0.3s',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${colorSet.bg}`;
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <p style={{
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  color: colorSet.text,
                  fontSize: '14px',
                  letterSpacing: '0.5px'
                }}>{category}</p>
                <p style={{
                  margin: '0',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}>{count}</p>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>notices</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;