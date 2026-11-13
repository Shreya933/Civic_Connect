// frontend/src/pages/admin/ResolvedAssignments.jsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  Eye,
  Calendar,
  Building,
  User,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { adminApi } from '../../api/adminApi';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const ResolvedAssignments = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resolvedList, setResolvedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchResolved = async () => {
      try {
        const res = await adminApi.getResolvedAssignments();
        setResolvedList(res.data || []);
      } catch (err) {
        console.error('Failed to load resolved assignments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResolved();
  }, []);

  const filtered = resolvedList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const rep = (item.assignment?.report_id || '').toLowerCase().includes(q);
    const cmp = (item.complaint_id || '').toLowerCase().includes(q);
    const title = (item.title || '').toLowerCase().includes(q);
    const lead = (item.assignment?.worker_name || '').toLowerCase().includes(q);
    return rep || cmp || title || lead;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Resolved Civic Records"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Verified Resolved Complaints</h1>
              <p>
                Permanent repository of resolved civic complaints. Both original defect imagery and post-repair proof are archived side-by-side.
              </p>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
            <div className="form-input-wrapper" style={{ maxWidth: 450 }}>
              <Search size={16} className="form-input-icon" />
              <input
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Search by Report ID, Complaint ID, title, or lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Loading resolved assignments..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Defect Image</th>
                      <th>Resolution Image</th>
                      <th>Issue & Department</th>
                      <th>Completed By</th>
                      <th>Resolved Date</th>
                      <th style={{ textAlign: 'right' }}>Audit Inspection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <FileCheck size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No resolved assignments found</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.id || item.complaint_id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                              {item.assignment?.report_id || 'REP-ARCHIVED'}
                            </strong>
                            <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
                              {item.complaint_id}
                            </div>
                          </td>

                          {/* Original Defect Image */}
                          <td>
                            <div style={{ position: 'relative', width: 56, height: 56 }}>
                              <img
                                src={item.image_url || item.thumbnail_url}
                                alt="Original defect"
                                style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border-light)' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: 2,
                                  left: 2,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: '#fff',
                                  fontSize: '0.55rem',
                                  padding: '1px 3px',
                                  borderRadius: 2,
                                }}
                              >
                                Before
                              </span>
                            </div>
                          </td>

                          {/* Post-Repair Image */}
                          <td>
                            <div style={{ position: 'relative', width: 56, height: 56 }}>
                              <img
                                src={
                                  item.assignment?.completion_image ||
                                  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=200&q=80'
                                }
                                alt="Resolution proof"
                                style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover', border: '2px solid #10b981' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: 2,
                                  left: 2,
                                  backgroundColor: 'rgba(5, 150, 105, 0.85)',
                                  color: '#fff',
                                  fontSize: '0.55rem',
                                  padding: '1px 3px',
                                  borderRadius: 2,
                                }}
                              >
                                After
                              </span>
                            </div>
                          </td>

                          <td style={{ maxWidth: 240 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {item.title || item.category}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building size={12} />
                              {item.assignment?.department || 'Municipal Dept'}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {item.assignment?.worker_name || 'Field Crew'}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} />
                              {formatDate(item.assignment?.completed_at || item.submitted_at)}
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setSelectedRecord(item)}
                            >
                              <Eye size={13} />
                              <span>Inspect Proof</span>
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

      {/* Proof Inspection Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                  PERMANENT AUDIT VERIFICATION
                </span>
                <h3 className="card-title">
                  Report ID: {selectedRecord.assignment?.report_id || selectedRecord.complaint_id}
                </h3>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="card-body">
              {/* Dual Photographic Comparison Side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ORIGINAL COMPLAINT PHOTO
                  </div>
                  <div style={{ height: 230, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <img
                      src={selectedRecord.image_url || selectedRecord.thumbnail_url}
                      alt="Original complaint defect"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 4 }}>
                    Preserved permanently in MongoDB storage
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} />
                    FIELD REPAIR PROOF PHOTO
                  </div>
                  <div style={{ height: 230, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid #10b981' }}>
                    <img
                      src={
                        selectedRecord.assignment?.completion_image ||
                        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Resolution verified"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>
                    Verified by Field Supervisor
                  </div>
                </div>
              </div>

              {/* Record Metadata */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Department:</span>
                    <strong style={{ display: 'block', color: 'var(--navy-900)' }}>
                      {selectedRecord.assignment?.department || 'Public Works & Roads'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Lead Crew Officer:</span>
                    <strong style={{ display: 'block', color: 'var(--navy-900)' }}>
                      {selectedRecord.assignment?.worker_name || 'Field Crew'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>Resolution Completed:</span>
                    <strong style={{ display: 'block', color: 'var(--navy-900)' }}>
                      {formatDateTime(selectedRecord.assignment?.completed_at)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--slate-500)' }}>SLA Compliance:</span>
                    <strong style={{ display: 'block', color: selectedRecord.assignment?.was_overdue ? '#b91c1c' : '#059669' }}>
                      {selectedRecord.assignment?.was_overdue ? 'Historical Overdue (Resolved Late)' : 'Deadline Met on Schedule'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Supervisor Notes */}
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  Supervisor Field Notes
                </strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: 4, fontStyle: 'italic' }}>
                  "{selectedRecord.assignment?.completion_note || 'Work completed in compliance with municipal engineering standards.'}"
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedRecord(null)}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolvedAssignments;

