// frontend/src/pages/citizen/MyComplaints.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  LayoutGrid,
  List,
  PlusCircle,
  X,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ComplaintCard from '../../components/ComplaintCard';
import ComplaintTable from '../../components/ComplaintTable';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { citizenApi } from '../../api/citizenApi';
import { formatDate, formatDateTime, formatCoordinates, formatAddress } from '../../utils/formatters';
import { ISSUE_CATEGORIES } from '../../utils/constants';

export const MyComplaints = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Search & Filters for Grid View
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await citizenApi.getMyComplaints();
        setComplaints(res.data || []);
      } catch (err) {
        console.error('Failed to load complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const idMatch = (item.complaint_id || '').toLowerCase().includes(q);
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const catMatch = (item.category || '').toLowerCase().includes(q);
      const addrMatch = (item.address || '').toLowerCase().includes(q);
      return idMatch || titleMatch || catMatch || addrMatch;
    }
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="My Civic Complaints"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          {/* Header */}
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>My Grievance Submissions</h1>
              <p>Track the live status, assigned crews, and resolution proofs of your reported civic issues.</p>
            </div>
            <Link to="/citizen/report" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Report New Issue</span>
            </Link>
          </div>

          {/* View Toggle & Filters Toolbar */}
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 260 }}>
              <div className="form-input-wrapper" style={{ flex: 1 }}>
                <Search size={16} className="form-input-icon" />
                <input
                  type="text"
                  className="form-input form-input-with-icon"
                  placeholder="Filter your complaints by ID, title, or road..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="OVERDUE">Overdue</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--slate-100)', padding: 3, borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setViewMode('table')}
                title="Table List View"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Content View */}
          {loading ? (
            <Loader fullPage message="Fetching your complaints..." />
          ) : viewMode === 'grid' ? (
            filtered.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <FileText size={44} style={{ color: 'var(--slate-300)', margin: '0 auto 1rem' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--navy-900)' }}>No complaints found</h4>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: 4 }}>
                  No complaints match your active filter criteria.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filtered.map((item) => (
                  <ComplaintCard
                    key={item.id || item.complaint_id}
                    complaint={item}
                    onViewDetails={(c) => setSelectedComplaint(c)}
                  />
                ))}
              </div>
            )
          ) : (
            <ComplaintTable
              complaints={filtered}
              onRowAction={(c) => setSelectedComplaint(c)}
              actionLabel="View Details"
              showCitizenInfo={false}
              showReportId={true}
            />
          )}
        </main>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  COMPLAINT REF: {selectedComplaint.complaint_id}
                </span>
                <h3 className="card-title" style={{ marginTop: 2 }}>
                  {selectedComplaint.title || selectedComplaint.category}
                </h3>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="card-body">
              {/* Photo Evidence Side-by-side if Resolved */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectedComplaint.assignment?.completion_image ? '1fr 1fr' : '1fr',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: 4 }}>
                    ORIGINAL CITIZEN PHOTO
                  </div>
                  <img
                    src={selectedComplaint.image_url || selectedComplaint.thumbnail_url}
                    alt="Original civic defect"
                    style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                {selectedComplaint.assignment?.completion_image && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      COMPLETED WORK RESOLUTION PHOTO
                    </div>
                    <img
                      src={selectedComplaint.assignment.completion_image}
                      alt="Completed work proof"
                      style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid #10b981' }}
                    />
                  </div>
                )}
              </div>

              {/* Status and Attributes Row */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <StatusBadge status={selectedComplaint.status} />
                <span className="badge badge-gray">
                  {selectedComplaint.category}
                </span>
                {selectedComplaint.assignment?.report_id && (
                  <span className="badge badge-blue">
                    Report ID: {selectedComplaint.assignment.report_id}
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.825rem', color: 'var(--slate-600)', textTransform: 'uppercase' }}>
                  Description
                </strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: 4 }}>
                  {selectedComplaint.description || 'No detailed description supplied.'}
                </p>
              </div>

              {/* Location Card */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--navy-900)' }}>
                  <MapPin size={16} style={{ color: 'var(--rose-500)' }} />
                  <span>Reported Location</span>
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: 4 }}>
                  {formatAddress(selectedComplaint.address)}
                </div>
                {selectedComplaint.location?.coordinates && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>
                    Coordinates: {formatCoordinates(selectedComplaint.location.coordinates[1], selectedComplaint.location.coordinates[0])}
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <strong style={{ fontSize: '0.825rem', color: 'var(--slate-600)', textTransform: 'uppercase', display: 'block', marginBottom: '0.85rem' }}>
                  Progress History Timeline
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--slate-200)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
                  {/* Event 1 */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                      Complaint Submitted
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {formatDateTime(selectedComplaint.submitted_at)}
                    </div>
                  </div>

                  {/* Event 2 */}
                  {selectedComplaint.assignment && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                        Work Assigned & Approved ({selectedComplaint.assignment.report_id})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        Department: {selectedComplaint.assignment.department} • Field Crew: {selectedComplaint.assignment.worker_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        Target SLA Deadline: {formatDate(selectedComplaint.assignment.deadline_at)}
                      </div>
                    </div>
                  )}

                  {/* Event 3 */}
                  {selectedComplaint.status === 'RESOLVED' && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#059669' }}>
                        Issue Resolved by Municipal Crew
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        Completed on {formatDateTime(selectedComplaint.assignment?.completed_at)}
                      </div>
                      {selectedComplaint.assignment?.completion_note && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: 4, fontStyle: 'italic' }}>
                          Supervisor Notes: "{selectedComplaint.assignment.completion_note}"
                        </div>
                      )}
                    </div>
                  )}

                  {selectedComplaint.status === 'REJECTED' && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#b91c1c' }}>
                        Complaint Rejected by Municipal Admin
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: 4 }}>
                        Reason: {selectedComplaint.rejection_reason || 'Does not fall within municipal jurisdiction.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedComplaint(null)}
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

export default MyComplaints;

