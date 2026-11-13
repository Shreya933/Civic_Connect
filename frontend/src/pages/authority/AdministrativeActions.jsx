// frontend/src/pages/authority/AdministrativeActions.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  User,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { authorityApi } from '../../api/authorityApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, ACTION_TYPES } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const AdministrativeActions = () => {
  const location = useLocation();
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for new directive
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionType, setActionType] = useState('WARNING_ISSUED');
  const [departmentId, setDepartmentId] = useState(
    location.state?.preselectedDeptId || DEPARTMENTS[0].id
  );
  const [subject, setSubject] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [remarks, setRemarks] = useState('');
  const [targetReportId, setTargetReportId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Close Action Modal State
  const [closingAction, setClosingAction] = useState(null);
  const [closeNotes, setCloseNotes] = useState('');

  const fetchActions = async () => {
    try {
      const res = await authorityApi.getAdministrativeActions();
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.actions) ? raw.actions : []);
      setActions(list);
    } catch (err) {
      console.error('Failed to load administrative actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // Handle open modal with preselected department if navigated from Performance table
  useEffect(() => {
    if (location.state?.preselectedDeptId) {
      setDepartmentId(location.state.preselectedDeptId);
      setShowCreateModal(true);
    }
  }, [location.state]);

  const handleCreateAction = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !remarks.trim()) {
      alert('Subject and administrative remarks are required.');
      return;
    }

    setSubmitting(true);
    try {
      const dept = DEPARTMENTS.find((d) => d.id === departmentId);
      const payload = {
        action_type: actionType,
        department_id: departmentId,
        department_name: dept?.name || 'Public Works',
        subject: subject.trim(),
        severity,
        remarks: remarks.trim(),
        target_report_id: targetReportId.trim() || null,
      };

      await authorityApi.createAction(payload);
      showToast('Administrative directive recorded successfully.', 'success');
      setShowCreateModal(false);
      setSubject('');
      setRemarks('');
      setTargetReportId('');
      fetchActions();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Failed to issue action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAction = async (e) => {
    e.preventDefault();
    if (!closingAction) return;

    setSubmitting(true);
    try {
      await authorityApi.closeAction(closingAction.id, {
        resolution_notes: closeNotes.trim() || 'Directive compliance verified and closed.',
      });
      showToast('Action marked as resolved/closed.', 'success');
      setClosingAction(null);
      setCloseNotes('');
      fetchActions();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Failed to close action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Administrative Actions & Directives"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Executive Administrative Directives</h1>
              <p>
                Issue formal warnings, corrective measure orders, and performance reviews to municipal department heads.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle size={16} />
              <span>Issue New Directive</span>
            </button>
          </div>

          {loading ? (
            <Loader fullPage message="Loading administrative directives log..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Directive Type</th>
                      <th>Target Department</th>
                      <th>Subject & Remarks</th>
                      <th>Severity</th>
                      <th>Issued Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <ShieldAlert size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No administrative actions recorded</p>
                        </td>
                      </tr>
                    ) : (
                      actions.map((act) => (
                        <tr key={act.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                              {ACTION_TYPES.find((t) => t.id === act.action_type)?.label || act.action_type}
                            </div>
                            {act.target_report_id && (
                              <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                                Ref: {act.target_report_id}
                              </div>
                            )}
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              {act.department_name}
                            </div>
                          </td>

                          <td style={{ maxWidth: 320 }}>
                            <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                              {act.subject}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: 2 }}>
                              {act.remarks}
                            </div>
                            {act.resolution_notes && (
                              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, fontStyle: 'italic' }}>
                                Resolution: "{act.resolution_notes}"
                              </div>
                            )}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                act.severity === 'HIGH' || act.severity === 'CRITICAL'
                                  ? 'badge-rose'
                                  : 'badge-amber'
                              }`}
                            >
                              {act.severity || 'HIGH'}
                            </span>
                          </td>

                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                            {formatDate(act.issued_at)}
                          </td>

                          <td>
                            {act.status === 'OPEN' ? (
                              <span className="badge badge-amber">Open Action</span>
                            ) : (
                              <span className="badge badge-emerald">Acknowledged & Closed</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            {act.status === 'OPEN' ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setClosingAction(act);
                                  setCloseNotes('');
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Close Directive</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                Closed on {formatDate(act.closed_at)}
                              </span>
                            )}
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

      {/* Create Directive Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Issue Formal Administrative Directive</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAction}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">
                    Action Type <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Target Department <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Directive Subject <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Unacceptable SLA breach on Ward 8 pipeline repairs"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select
                      className="form-input"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Report ID (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. REP-2026-088"
                    value={targetReportId}
                    onChange={(e) => setTargetReportId(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Executive Remarks & Orders <span className="required">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Detail specific remedial actions required by the department head within 48 hours..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Dispatching Directive...' : 'Dispatch Administrative Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Action Modal */}
      {closingAction && (
        <div className="modal-overlay" onClick={() => setClosingAction(null)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Acknowledge & Close Directive</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setClosingAction(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCloseAction}>
              <div className="card-body">
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    Target Department: {closingAction.department_name}
                  </div>
                  <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>
                    {closingAction.subject}
                  </strong>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Department Resolution & Corrective Action Proof Notes
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Record notes on how the department fulfilled this directive (e.g. deployed 3 additional teams, repaired corridor)..."
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setClosingAction(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Closing...' : 'Close Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrativeActions;

