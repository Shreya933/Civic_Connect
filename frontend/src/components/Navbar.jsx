// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  User,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_DASHBOARDS } from '../utils/constants';

export const Navbar = ({ pageTitle = 'Dashboard', onToggleMobileSidebar }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'AI Classification Completed',
      text: 'Report CC-2026-001 classified as Road damage (94% conf).',
      time: '12m ago',
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      id: 2,
      title: 'SLA Overdue Warning',
      text: 'Water pipeline in Ward 8 crossed the 72h resolution deadline.',
      time: '1h ago',
      icon: AlertCircle,
      color: '#ef4444',
    },
    {
      id: 3,
      title: 'Staff Approval Requested',
      text: '2 new municipal engineers registered awaiting SysAdmin review.',
      time: '3h ago',
      icon: Clock,
      color: '#3b82f6',
    },
  ];

  const handleRoleChange = (e) => {
    const targetRole = e.target.value;
    const dest = switchDemoRole(targetRole);
    navigate(dest);
  };

  return (
    <header className="dashboard-navbar">
      <div className="navbar-left">
        <button
          className="navbar-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="navbar-page-title">{pageTitle}</h2>
      </div>

      <div className="navbar-right">
        {/* Quick Demo Role Switcher */}
        <div className="demo-role-switcher" title="Instantly switch role to inspect dashboards">
          <Shield size={14} style={{ color: 'var(--primary)' }} />
          <span>Role:</span>
          <select
            className="demo-role-select"
            value={role === 'MUNICIPAL_ADMIN' ? ROLES.ADMIN : (role || ROLES.CITIZEN)}
            onChange={handleRoleChange}
          >
            <option value={ROLES.CITIZEN}>Citizen</option>
            <option value={ROLES.ADMIN}>Municipal Admin</option>
            <option value={ROLES.HIGHER_AUTHORITY}>Higher Authority</option>
            <option value={ROLES.SYSTEM_ADMIN}>System Admin</option>
          </select>
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: 38, height: 38, padding: 0 }}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                backgroundColor: '#ef4444',
                borderRadius: '50%',
              }}
            />
          </button>

          {showNotifications && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: 320,
                zIndex: 200,
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <strong style={{ fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                  Platform Alerts
                </strong>
                <span style={{ fontSize: '0.725rem', color: 'var(--primary)', cursor: 'pointer' }}>
                  Mark read
                </span>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Icon size={16} style={{ color: n.color, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{n.title}</div>
                        <div style={{ color: 'var(--slate-500)', marginTop: 2 }}>{n.text}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: 4 }}>
                          {n.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <div className="user-avatar">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: 220,
                zIndex: 200,
                padding: '0.5rem',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                  {user?.full_name || 'Civic User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {ROLE_LABELS[role] || role}
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.5rem' }}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/');
                }}
              >
                <ExternalLink size={14} />
                Visit Public Portal
              </button>
              <button
                className="btn btn-danger btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.35rem' }}
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

