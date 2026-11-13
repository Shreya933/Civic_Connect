// frontend/src/pages/sysadmin/PendingStaff.jsx
import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { sysadminApi } from '../../api/sysadminApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const PendingStaff = () => {
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected for Details
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Approve Modal
  const [approvingStaff, setApprovingStaff] = useState(null);
  const [approvedRole, setApprovedRole] = useState('ADMIN');

  // Reject Modal
  const [rejectingStaff, setRejectingStaff] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await sysadminApi.getPendingStaff();
      const staffRaw = res?.data;
      const list = Array.isArray(staffRaw) ? staffRaw : (Array.isArray(staffRaw?.users) ? staffRaw.users : []);
      setStaffList(list);
    } catch (err) {
      console.error('Failed to load pending staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleApprove = async () => {
    if (!approvingStaff) return;
    setSubmitting(true);
    try {
      await sysadminApi.approveStaff(approvingStaff.id || approvingStaff.user_id, approvedRole);
      showToast(`Staff member approved and granted ${approvedRole} role.`, 'success');
      setApprovingStaff(null);
      fetchStaff();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingStaff || !rejectReason.trim()) {
      alert('A rejection reason is mandatory.');
      return;
    }
    setSubmitting(true);
    try {
      await sysadminApi.rejectStaff(rejectingStaff.id || rejectingStaff.user_id, rejectReason.trim());
      showToast('Staff access request rejected.', 'info');
      setRejectingStaff(null);
      setRejectReason('');
      fetchStaff();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(staffList) ? staffList : []).filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Pending Staff Approvals"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Municipal Staff Access Requests</h1>
              <p>
                Review employee credentials, departments, and assigned jurisdictions before granting access to administrative systems.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
            <div className="form-input-wrapper" style={{ maxWidth: 450 }}>
              <Search size={16} className="form-input-icon" />
              <input
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Search staff requests by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Loading staff applications..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Officer Name</th>
                      <th>Designation</th>
                      <th>Department & Area</th>
                      <th>Requested Role</th>
                      <th>Registered Date</th>
                      <th style={{ textAlign: 'right' }}>Vetting Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                          <CheckCircle2 size={36} style={{ color: 'var(--emerald-500)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No pending staff access requests</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            All municipal staff accounts have been processed.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((staff) => (
                        <tr key={staff.id || staff.user_id}>
                          <td>
                            <strong style={{ color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                              {staff.full_name}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              {staff.email} • {staff.mobile}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {staff.designation || 'Staff Member'}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
                              ID: {staff.employee_id || 'Pending'}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                              {staff.department}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              Zone: {staff.jurisdiction}
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-amber">{staff.requested_role}</span>
                          </td>

                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            {formatDate(staff.created_at)}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setSelectedStaff(staff)}
                                title="View Application Details"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => {
                                  setApprovingStaff(staff);
                                  setApprovedRole(staff.requested_role || 'ADMIN');
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setRejectingStaff(staff);
                                  setRejectReason('');
                                }}
                              >
                                <XCircle size={13} />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Details Modal */}
      {selectedStaff && (
        <div className="modal-overlay" onClick={() => setSelectedStaff(null)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Staff Application Details</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedStaff(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Full Name:</span>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{selectedStaff.full_name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Official Email:</span>
                  <div style={{ fontWeight: 600 }}>{selectedStaff.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Mobile Contact:</span>
                  <div>{selectedStaff.mobile}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Designation:</span>
                  <div>{selectedStaff.designation}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Department:</span>
                  <div>{selectedStaff.department}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Jurisdiction:</span>
                  <div>{selectedStaff.jurisdiction}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Requested Access Role:</span>
                  <div style={{ marginTop: 2 }}>
                    <span className="badge badge-amber">{selectedStaff.requested_role}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedStaff(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approvingStaff && (
        <div className="modal-overlay" onClick={() => setApprovingStaff(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Approve Staff Access</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setApprovingStaff(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                Approve <strong>{approvingStaff.full_name}</strong> ({approvingStaff.email}) to activate their official account and grant permissions.
              </p>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign Confirmed Role</label>
                <select
                  className="form-input"
                  value={approvedRole}
                  onChange={(e) => setApprovedRole(e.target.value)}
                >
                  <option value="MUNICIPAL_ADMIN">Municipal Admin (MUNICIPAL_ADMIN)</option>
                  <option value="ADMIN">Municipal Admin (ADMIN)</option>
                  <option value="HIGHER_AUTHORITY">Higher Authority</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setApprovingStaff(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleApprove}
                disabled={submitting}
              >
                {submitting ? 'Activating...' : 'Confirm Approval & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingStaff && (
        <div className="modal-overlay" onClick={() => setRejectingStaff(null)}>
          <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title" style={{ color: '#b91c1c' }}>Reject Staff Application</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setRejectingStaff(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                State why this staff credential application cannot be approved.
              </p>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Rejection Reason <span className="required">*</span>
                </label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="e.g. Unverified employee identification number or jurisdiction mismatch..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRejectingStaff(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingStaff;

