// frontend/src/pages/citizen/CitizenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import ComplaintCard from '../../components/ComplaintCard';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { citizenApi } from '../../api/citizenApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, formatTimeAgo, formatCoordinates, formatAddress } from '../../utils/formatters';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await citizenApi.getMyComplaints();
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.complaints) ? raw.complaints : []);
        setComplaints(list);
      } catch (err) {
        console.error('Error fetching citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Compute metrics
  const safeList = Array.isArray(complaints) ? complaints : [];
  const total = safeList.length;
  const pending = safeList.filter((c) => c.status === 'PENDING_REVIEW').length;
  const inProgress = safeList.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'OVERDUE').length;
  const resolved = safeList.filter((c) => c.status === 'RESOLVED').length;

  const recentComplaints = safeList.slice(0, 4);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Citizen Grievance Portal"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          {/* Welcome Header */}
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Welcome, {user?.full_name || 'Citizen'}</h1>
              <p>
                Report urban infrastructure issues and track real-time resolution updates from municipal authorities.
              </p>
            </div>
            <Link to="/citizen/report" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Report a New Complaint</span>
            </Link>
          </div>

          {/* Quick Metrics Grid */}
          <div className="stat-grid">
            <StatCard
              title="Total Complaints"
              value={total}
              icon={FileText}
              subtitle="All registered grievances"
              color="#2563eb"
              bgLight="#eff6ff"
            />
            <StatCard
              title="Pending Review"
              value={pending}
              icon={Clock}
              subtitle="Awaiting municipal review"
              color="#3b82f6"
              bgLight="#eff6ff"
            />
            <StatCard
              title="In Progress"
              value={inProgress}
              icon={PlayCircle}
              subtitle="Field crews active on site"
              color="#f59e0b"
              bgLight="#fffbeb"
            />
            <StatCard
              title="Resolved"
              value={resolved}
              icon={CheckCircle2}
              subtitle="Repairs verified & closed"
              color="#10b981"
              bgLight="#ecfdf5"
            />
          </div>

          {/* Quick Action Hero Banner */}
          <div
            className="card"
            style={{
              padding: '1.75rem 2rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              marginBottom: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                <Sparkles size={14} />
                Instant Computer Vision Categorization
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                Spotted a pothole, open garbage, or streetlight failure?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 650 }}>
                Snap a photo or upload an image. Our automated AI vision assigns the issue to the appropriate municipal department in seconds.
              </p>
            </div>
            <Link to="/citizen/report" className="btn btn-primary btn-lg">
              <PlusCircle size={18} />
              <span>Submit Civic Report</span>
            </Link>
          </div>

          {/* Recent Complaints Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Recent Complaint Activity
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                  Latest grievances submitted from your citizen account
                </p>
              </div>
              <Link to="/citizen/my-complaints" className="btn btn-outline btn-sm">
                <span>View All Complaints</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <Loader fullPage message="Loading your civic reports..." />
            ) : recentComplaints.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <FileText size={48} style={{ color: 'var(--slate-300)', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  No complaints filed yet
                </h4>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  When you report road damage, waste, or broken public infrastructure, you can track it here.
                </p>
                <Link to="/citizen/report" className="btn btn-primary">
                  <PlusCircle size={16} />
                  <span>Report Your First Civic Issue</span>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {recentComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id || complaint.complaint_id}
                    complaint={complaint}
                    onViewDetails={(c) => setSelectedComplaint(c)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Complaint ID: {selectedComplaint.complaint_id}
                </div>
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
              {/* Photo View */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedComplaint.assignment?.completion_image ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: 4 }}>
                    ORIGINAL COMPLAINT PHOTO
                  </div>
                  <img
                    src={selectedComplaint.image_url || selectedComplaint.thumbnail_url}
                    alt="Original civic defect"
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                {selectedComplaint.assignment?.completion_image && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      OFFICIAL RESOLUTION PROOF
                    </div>
                    <img
                      src={selectedComplaint.assignment.completion_image}
                      alt="Completed work proof"
                      style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid #10b981' }}
                    />
                  </div>
                )}
              </div>

              {/* Status and Department Pill */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <StatusBadge status={selectedComplaint.status} />
                <span className="badge badge-gray">
                  Category: {selectedComplaint.category}
                </span>
                {selectedComplaint.confidence && (
                  <span className="badge badge-blue">
                    AI Conf: {(selectedComplaint.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.825rem', color: 'var(--slate-600)', textTransform: 'uppercase' }}>
                  Issue Description
                </strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: 4 }}>
                  {selectedComplaint.description || 'No additional notes provided.'}
                </p>
              </div>

              {/* Location details */}
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
                  <span>Location & Geotag</span>
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: 4 }}>
                  {formatAddress(selectedComplaint.address)}
                </div>
                {selectedComplaint.location?.coordinates && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>
                    Coords: {formatCoordinates(selectedComplaint.location.coordinates[1], selectedComplaint.location.coordinates[0])}
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <strong style={{ fontSize: '0.825rem', color: 'var(--slate-600)', textTransform: 'uppercase', display: 'block', marginBottom: '0.85rem' }}>
                  Resolution Progress Timeline
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--slate-200)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
                  {/* Step 1 */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                      Complaint Submitted by Citizen
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {formatDateTime(selectedComplaint.submitted_at)}
                    </div>
                  </div>

                  {/* Step 2 */}
                  {selectedComplaint.assignment && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                        Assigned to {selectedComplaint.assignment.department}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        Report ID: {selectedComplaint.assignment.report_id} • Assigned to {selectedComplaint.assignment.worker_name}
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {selectedComplaint.status === 'RESOLVED' && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#059669' }}>
                        Issue Resolved & Verified On-Site
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                        {formatDateTime(selectedComplaint.assignment?.completed_at)}
                      </div>
                      {selectedComplaint.assignment?.completion_note && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: 4, fontStyle: 'italic' }}>
                          "{selectedComplaint.assignment.completion_note}"
                        </div>
                      )}
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

export default CitizenDashboard;

