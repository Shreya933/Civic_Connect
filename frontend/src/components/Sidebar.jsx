// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Building,
  ShieldAlert,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../utils/constants';

export const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user, role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define nav links per role
  const getNavLinks = () => {
    switch (role) {
      case ROLES.CITIZEN:
        return [
          { to: '/citizen/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/citizen/report', label: 'Report Issue', icon: PlusCircle },
          { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
        ];

      case ROLES.MUNICIPAL_ADMIN:
      case ROLES.ADMIN:
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/pending', label: 'Pending Review', icon: Clock, badge: 'New' },
          { to: '/admin/in-progress', label: 'In Progress', icon: PlayCircle },
          { to: '/admin/overdue', label: 'Overdue Work', icon: AlertTriangle, badgeColor: '#ef4444' },
          { to: '/admin/resolved', label: 'Resolved Records', icon: CheckCircle2 },
        ];

      case ROLES.HIGHER_AUTHORITY:
        return [
          { to: '/authority/dashboard', label: 'Executive Analytics', icon: LayoutDashboard },
          { to: '/authority/departments', label: 'Dept Performance', icon: BarChart3 },
          { to: '/authority/overdue', label: 'Overdue Audit', icon: AlertTriangle },
          { to: '/authority/actions', label: 'Administrative Directives', icon: ShieldAlert },
        ];

      case ROLES.SYSTEM_ADMIN:
        return [
          { to: '/sysadmin/dashboard', label: 'System Overview', icon: LayoutDashboard },
          { to: '/sysadmin/pending-staff', label: 'Pending Staff', icon: UserCheck, badge: 'Req' },
          { to: '/sysadmin/users', label: 'User Directory', icon: Users },
        ];

      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 95,
          }}
        />
      )}

      <aside
        className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Header / Brand */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Building2 size={22} />
            </div>
            {!collapsed && <span>CIVIC CONNECT</span>}
          </Link>

          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="sidebar-role-tag">
            <Building size={14} />
            <span>{ROLE_LABELS[role] || 'CIVIC USER'}</span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-label">Navigation</div>}
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className="nav-link-badge"
                    style={item.badgeColor ? { backgroundColor: item.badgeColor, color: '#fff' } : {}}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <Link
              to="/"
              className="nav-link-item"
              title="Return to Public Landing Page"
              style={{ color: 'var(--slate-400)' }}
            >
              <ExternalLink size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Public Portal</span>}
            </Link>
          </div>
        </nav>

        {/* Footer with user info & logout */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-profile-summary">
              <div className="user-avatar">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="user-info-text">
                <div className="user-name">{user?.full_name || 'Civic User'}</div>
                <div className="user-role-label">{user?.email || ROLE_LABELS[role]}</div>
              </div>
            </div>
          )}

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

