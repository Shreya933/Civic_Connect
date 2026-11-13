// frontend/src/pages/admin/ComplaintReview.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Sparkles,
  Building,
  Users,
  Clock,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Shield,
  FileCheck,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS, PRIORITIES } from '../../utils/constants';
import { formatDateTime, formatCoordinates, formatAddress } from '../../utils/formatters';

export const ComplaintReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get passed complaint or fallback to demo
  const passedComplaint = location.state?.complaint;
  const [complaint, setComplaint] = useState(
    passedComplaint || {
      id: 'cmp-001',
      complaint_id: 'CC-2026-001',
      title: 'Severe deep potholes near Metro Pillar 142',
      description: 'Multiple deep potholes on the main carriageway posing hazard to traffic.',
      category: 'Road damage and potholes',
      confidence: 0.94,
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      address: 'Near Metro Pillar 142, Outer Ring Road, Sector 4',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      status: 'PENDING_REVIEW',
      submitted_at: new Date().toISOString(),
      citizen_name: 'Rahul Sharma',
      citizen_email: 'rahul.s@example.com',
      citizen_phone: '+91 98765 43210',
      priority: 'HIGH',
    }
  );

  // Approval Form fields
  const [departmentsList, setDepartmentsList] = useState(DEPARTMENTS);
  const [departmentId, setDepartmentId] = useState(DEPARTMENTS[0].id);
  const [workerCount, setWorkerCount] = useState(3);
  const [workerName, setWorkerName] = useState('Kiran Swamy (Asst. Engineer Roads)');
  const [priority, setPriority] = useState(complaint.priority || 'HIGH');
  
  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setDepartmentsList(res.data);
        if (!departmentId) {
          setDepartmentId(res.data[0].id || res.data[0]._id || res.data[0].name);
        }
      }
    }).catch(() => {});
  }, []);
  
  // Set default deadline 3 days from today in ISO format YYYY-MM-DD
  const defaultDeadline = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const [deadlineDate, setDeadlineDate] = useState(defaultDeadline);

  // Rejection Form fields
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Approval Success modal state
  const [generatedReport, setGeneratedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle Approve
  const handleApprove = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedDept = departmentsList.find((d) => (d.id === departmentId || d._id === departmentId || d.name === departmentId));
      const payload = {
        department_id: departmentId,
        department_name: selectedDept?.name || 'Public Works',
        worker_count: Number(workerCount),
        worker_name: workerName,
        deadline: new Date(`${deadlineDate}T18:00:00Z`).toISOString(),
        priority,
      };

      const res = await adminApi.approveComplaint(complaint.complaint_id || complaint.id, payload);
      setGeneratedReport({
        report_id: res.data?.report_id || `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
        department: selectedDept?.name,
        deadline: deadlineDate,
        worker: workerName,
      });
      showToast('Complaint approved and assigned!', 'success');
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('A valid mandatory rejection reason is required.');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.rejectComplaint(complaint.complaint_id || complaint.id, rejectReason.trim());
      showToast('Complaint has been rejected.', 'info');
      setShowRejectModal(false);
      navigate('/admin/pending');
    } catch (err) {
      alert(typeof err === 'string' ? err : err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Complaint Review & Assignment"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/pending')}
              style={{ marginBottom: '0.85rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Pending Queue</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Review: {complaint.complaint_id}
              </h1>
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
            {/* Left Column: Complaint Details & Photographic Evidence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Photo Card */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 320, backgroundColor: '#0f172a' }}>
                  <img
                    src={complaint.image_url || complaint.thumbnail_url}
                    alt="Civic defect photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Original Uploaded Image
                  </div>
                </div>

                <div className="card-body">
                  {/* AI Classification Info Banner */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                      border: '1px solid #bfdbfe',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          AI VISION PREDICTION
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                          {complaint.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Confidence</div>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                        {(complaint.confidence ? complaint.confidence * 100 : 94).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                    {complaint.title || complaint.category}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {complaint.description || 'No additional text description supplied by citizen.'}
                  </p>

                  {/* Citizen Info Box */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Reporting Citizen Details
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--navy-900)' }}>
                      <User size={15} style={{ color: 'var(--primary)' }} />
                      <span>{complaint.citizen_name || 'Rahul Sharma'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: 4, fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={13} /> {complaint.citizen_email || 'citizen@example.com'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={13} /> {complaint.citizen_phone || '+91 98765 43210'}
                      </span>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 4 }}>
                      <MapPin size={16} style={{ color: 'var(--rose-500)' }} />
                      <span>Geographic Location</span>
                    </div>
                    <div style={{ color: 'var(--slate-700)' }}>{formatAddress(complaint.address)}</div>
                    {complaint.location?.coordinates && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>
                        {formatCoordinates(complaint.location.coordinates[1], complaint.location.coordinates[0])}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Administrative Actions Panel */}
            <div>
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    Work Order Assignment
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                    Approve to generate a formal municipal Report ID and dispatch crew
                  </p>
                </div>

                <form onSubmit={handleApprove}>
                  {/* Department Assignment */}
                  <div className="form-group">
                    <label className="form-label">
                      Assign Responsible Department <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      {departmentsList.map((dept) => {
                        const val = dept.id || dept._id || dept.name;
                        return (
                          <option key={val} value={val}>
                            {dept.name} {dept.code ? `(${dept.code})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Worker & Crew count */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Field Supervisor / Lead Engineer <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Crew Count <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="form-input"
                        value={workerCount}
                        onChange={(e) => setWorkerCount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Priority & Deadline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Priority Level <span className="required">*</span></label>
                      <select
                        className="form-input"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">SLA Deadline <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input"
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      disabled={submitting}
                    >
                      <CheckCircle2 size={18} />
                      <span>{submitting ? 'Generating Report ID...' : 'Approve & Issue Work Order'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ width: '100%', color: 'var(--rose-600)', borderColor: '#fecaca' }}
                      onClick={() => setShowRejectModal(true)}
                    >
                      <XCircle size={16} />
                      <span>Reject Complaint with Reason</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Approval Success Modal with Report ID Display */}
      {generatedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 520, textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <FileCheck size={36} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
              Assignment Approved!
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Work order generated and queued in departmental field schedule.
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--slate-500)' }}>Generated Report ID:</span>
                <strong style={{ fontSize: '1rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {generatedReport.report_id}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--slate-500)' }}>Department:</span>
                <strong style={{ color: 'var(--navy-900)' }}>{generatedReport.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--slate-500)' }}>Assigned Lead:</span>
                <strong style={{ color: 'var(--navy-900)' }}>{generatedReport.worker}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Resolution Deadline:</span>
                <strong style={{ color: '#be123c' }}>{generatedReport.deadline}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  setGeneratedReport(null);
                  navigate('/admin/pending');
                }}
              >
                Pending Queue
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setGeneratedReport(null);
                  navigate('/admin/in-progress');
                }}
              >
                View In Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Mandatory Reason */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title" style={{ color: '#b91c1c' }}>Reject Civic Complaint</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowRejectModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                Rejection requires an official mandatory reason that will be permanently logged and sent to the citizen.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Mandatory Rejection Justification <span className="required">*</span>
                </label>
                <textarea
                  rows={4}
                  className="form-input"
                  placeholder="Explain why this complaint is being rejected (e.g. duplicate submission, private property outside municipal jurisdiction)..."
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
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintReview;

