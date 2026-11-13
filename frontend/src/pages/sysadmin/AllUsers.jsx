// frontend/src/pages/sysadmin/AllUsers.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Building,
  CheckCircle2,
  Ban,
  X,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { sysadminApi } from '../../api/sysadminApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { ROLES, ROLE_LABELS } from '../../utils/constants';

export const AllUsers = () => {
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await sysadminApi.getAllUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      const userRaw = res?.data;
      const list = Array.isArray(userRaw) ? userRaw : (Array.isArray(userRaw?.users) ? userRaw.users : []);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.account_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await sysadminApi.updateUserStatus(user.id || user._id, nextStatus);
      showToast(
        `User ${user.full_name} account status updated to ${nextStatus}.`,
        nextStatus === 'ACTIVE' ? 'success' : 'info'
      );
      fetchUsers();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="User Accounts Directory"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>All Municipal & Citizen Users</h1>
              <p>
                Complete identity registry. Inspect account roles, departmental assignments, and manage access privileges.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div className="form-input-wrapper" style={{ flex: 1, minWidth: 260 }}>
              <Search size={16} className="form-input-icon" />
              <input
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Search user by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value={ROLES.CITIZEN}>Citizen</option>
              <option value={ROLES.ADMIN}>Municipal Admin</option>
              <option value={ROLES.HIGHER_AUTHORITY}>Higher Authority</option>
              <option value={ROLES.SYSTEM_ADMIN}>System Administrator</option>
            </select>

            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
            </select>
          </div>

          {loading ? (
            <Loader fullPage message="Querying user directory..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Role</th>
                      <th>Department / Jurisdiction</th>
                      <th>Account Status</th>
                      <th>Created</th>
                      <th style={{ textAlign: 'right' }}>Access Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!Array.isArray(users) || users.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                          <Users size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No users found matching query</p>
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(users) ? users : []).map((u) => {
                        const isSuspended = u.account_status === 'SUSPENDED';

                        return (
                          <tr key={u.id || u._id}>
                            <td>
                              <strong style={{ color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                                {u.full_name}
                              </strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                {u.email}
                              </div>
                            </td>

                            <td>
                              <span
                                className={`badge ${u.role === ROLES.SYSTEM_ADMIN
                                    ? 'badge-gray'
                                    : u.role === ROLES.HIGHER_AUTHORITY
                                      ? 'badge-emerald'
                                      : u.role === ROLES.ADMIN
                                        ? 'badge-amber'
                                        : 'badge-blue'
                                  }`}
                              >
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                            </td>

                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                {u.department || 'Public Citizen'}
                              </div>
                              {u.jurisdiction && (
                                <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
                                  {u.jurisdiction}
                                </div>
                              )}
                            </td>

                            <td>
                              <StatusBadge status={u.account_status} />
                            </td>

                            <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                              {formatDate(u.created_at)}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => setSelectedUser(u)}
                                  title="View Account Details"
                                >
                                  <Eye size={13} />
                                </button>

                                {u.role !== ROLES.SYSTEM_ADMIN && (
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-danger'}`}
                                    onClick={() => handleToggleStatus(u)}
                                    title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                  >
                                    {isSuspended ? (
                                      <>
                                        <CheckCircle2 size={13} />
                                        <span>Reactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <Ban size={13} />
                                        <span>Suspend</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">User Account Dossier</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedUser(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Account Name:</span>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{selectedUser.full_name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Email:</span>
                  <div>{selectedUser.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Mobile:</span>
                  <div>{selectedUser.mobile || 'Not registered'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Platform Role:</span>
                  <div>
                    <span className="badge badge-blue">{ROLE_LABELS[selectedUser.role] || selectedUser.role}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Designation & Dept:</span>
                  <div>
                    {selectedUser.designation ? `${selectedUser.designation} (${selectedUser.department})` : 'Citizen User'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Assigned Jurisdiction:</span>
                  <div>{selectedUser.jurisdiction || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Account Status:</span>
                  <div>
                    <StatusBadge status={selectedUser.account_status} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Last Login Timestamp:</span>
                  <div style={{ color: 'var(--slate-600)' }}>
                    {formatDateTime(selectedUser.last_login_at) || 'Never logged in'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;

