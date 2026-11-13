// frontend/src/pages/admin/InProgressAssignments.jsx
import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  Users,
  Camera,
  Upload,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

export const InProgressAssignments = () => {
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Resolve Modal state
  const [resolvingItem, setResolvingItem] = useState(null);
  const [completionFile, setCompletionFile] = useState(null);
  const [completionPreview, setCompletionPreview] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchInProgress = async () => {
    try {
      const res = await adminApi.getInProgressAssignments();
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Failed to load in-progress work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInProgress();
  }, []);

  const handleOpenResolve = (item) => {
    setResolvingItem(item);
    setCompletionFile(null);
    setCompletionPreview(null);
    setCompletionNote('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompletionFile(file);
    setCompletionPreview(URL.createObjectURL(file));
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!completionFile) {
      alert('Please provide a post-repair verification image.');
      return;
    }

    setSubmittingResolve(true);

    try {
      const formData = new FormData();
      formData.append('completion_image', completionFile);
      formData.append('completion_note', completionNote.trim() || 'Work completed satisfactorily.');

      await adminApi.resolveAssignment(resolvingItem.complaint_id || resolvingItem.id, formData);
      showToast('Assignment verified and resolved successfully!', 'success');
      setResolvingItem(null);
      fetchInProgress();
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Failed to mark resolved');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const filtered = assignments.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const rep = (item.assignment?.report_id || '').toLowerCase().includes(q);
    const cmp = (item.complaint_id || '').toLowerCase().includes(q);
    const dept = (item.assignment?.department || '').toLowerCase().includes(q);
    const wrk = (item.assignment?.worker_name || '').toLowerCase().includes(q);
    return rep || cmp || dept || wrk;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="In-Progress Work Orders"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Active Field Assignments</h1>
              <p>
                Approved civic complaints currently being serviced by municipal crews with scheduled SLA deadlines.
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
                placeholder="Search by Report ID, Complaint ID, Department, or Crew Lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Loading active work orders..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Complaint ID</th>
                      <th>Issue & Department</th>
                      <th>Assigned Crew</th>
                      <th>SLA Deadline</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <PlayCircle size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No active in-progress assignments found</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.id || item.complaint_id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.95rem' }}>
                              {item.assignment?.report_id || 'REP-PENDING'}
                            </strong>
                          </td>

                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                              {item.complaint_id}
                            </span>
                          </td>

                          <td style={{ maxWidth: 260 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                              {item.title || item.category}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building size={12} />
                              {item.assignment?.department || 'Municipal Works'}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {item.assignment?.worker_name || 'Field Crew'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                              {item.assignment?.worker_count || 3} technicians assigned
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: '#be123c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={13} />
                              {formatDate(item.assignment?.deadline_at)}
                            </div>
                          </td>

                          <td>
                            <StatusBadge status={item.status} />
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleOpenResolve(item)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Mark Resolved</span>
                            </button>
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

      {/* Mark Resolved Modal */}
      {resolvingItem && (
        <div className="modal-overlay" onClick={() => setResolvingItem(null)}>
          <div className="modal-content" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                  COMPLETION VERIFICATION
                </span>
                <h3 className="card-title">
                  Resolve Report {resolvingItem.assignment?.report_id || resolvingItem.complaint_id}
                </h3>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setResolvingItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit}>
              <div className="card-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                  To mark this civic issue resolved, provide proof of repair. The original complaint image is preserved permanently in the database audit log.
                </p>

                {/* Proof Image Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Completed-Work Image Proof <span className="required">*</span>
                  </label>

                  {completionPreview ? (
                    <div style={{ position: 'relative', height: 220, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <img src={completionPreview} alt="Resolution proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => {
                          setCompletionFile(null);
                          setCompletionPreview(null);
                        }}
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      className="dropzone-box"
                      style={{ padding: '2rem 1rem' }}
                      onClick={() => document.getElementById('resolution-image-input').click()}
                    >
                      <Camera size={32} style={{ color: 'var(--primary)', marginBottom: 8 }} />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                        Select Post-Repair Photo
                      </strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 2 }}>
                        Upload clear photo of fixed road surface, cleared bin, or repaired pipe
                      </p>
                    </div>
                  )}

                  <input
                    id="resolution-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {/* Supervisor Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Supervisor Completion Notes</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="e.g. Pothole filled with cold asphalt mix and compacted with 2-ton roller. Surface tested for drainage flow."
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setResolvingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submittingResolve || !completionFile}
                >
                  {submittingResolve ? 'Verifying & Closing...' : 'Submit Resolution Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressAssignments;

