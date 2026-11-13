// frontend/src/pages/sysadmin/SysAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Building,
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { sysadminApi } from '../../api/sysadminApi';
import { formatDate } from '../../utils/formatters';

export const SysAdminDashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [statsRes, staffRes] = await Promise.all([
          sysadminApi.getDashboardStats(),
          sysadminApi.getPendingStaff(),
        ]);
        setStats(statsRes?.data);
        const rawStaff = staffRes?.data;
        const staffList = Array.isArray(rawStaff) ? rawStaff : (Array.isArray(rawStaff?.users) ? rawStaff.users : []);
        setPendingStaff(staffList);
      } catch (err) {
        console.error('Failed to load sysadmin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="System Administration Console"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>System Administration & Security Control</h1>
              <p>
                Manage authenticated accounts, vet municipal staff credential requests, and enforce role-based access control (RBAC).
              </p>
            </div>
            <Link to="/sysadmin/pending-staff" className="btn btn-primary">
              <UserCheck size={16} />
              <span>Review Staff Requests ({stats?.pending_staff_approvals || 0})</span>
            </Link>
          </div>

          {loading ? (
            <Loader fullPage message="Querying municipal security directory..." />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="stat-grid">
                <StatCard
                  title="Total Registered Accounts"
                  value={stats?.total_users || 0}
                  icon={Users}
                  subtitle="Citizens and officials"
                  color="#2563eb"
                  bgLight="#eff6ff"
                />
                <StatCard
                  title="Citizens"
                  value={stats?.citizens || 0}
                  icon={Users}
                  subtitle="Verified citizen users"
                  color="#10b981"
                  bgLight="#ecfdf5"
                />
                <StatCard
                  title="Municipal Admins"
                  value={stats?.municipal_admins || 0}
                  icon={Building}
                  subtitle="Departmental officers"
                  color="#f59e0b"
                  bgLight="#fffbeb"
                />
                <StatCard
                  title="Higher Authority"
                  value={stats?.higher_authority || 0}
                  icon={ShieldAlert}
                  subtitle="Commissioners & Directors"
                  color="#6366f1"
                  bgLight="#eef2ff"
                />
                <StatCard
                  title="Pending Staff Requests"
                  value={stats?.pending_staff_approvals || 0}
                  icon={UserCheck}
                  subtitle="Awaiting SysAdmin vetting"
                  color="#e11d48"
                  bgLight="#fff1f2"
                />
              </div>

              {/* Security Health & System Diagnostics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div className="card-header" style={{ padding: '0 0 1rem 0' }}>
                    <div>
                      <h3 className="card-title">Pending Staff Access Approvals</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Staff cannot log in until approved by System Administrator
                      </p>
                    </div>
                    <Link to="/sysadmin/pending-staff" className="btn btn-outline btn-sm">
                      <span>View All ({Array.isArray(pendingStaff) ? pendingStaff.length : 0})</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="table-container" style={{ border: 'none' }}>
                    <table className="civic-table">
                      <thead>
                        <tr>
                          <th>Officer Name</th>
                          <th>Department</th>
                          <th>Requested Role</th>
                          <th style={{ textAlign: 'right' }}>Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!Array.isArray(pendingStaff) || pendingStaff.length === 0) ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                              <CheckCircle2 size={32} style={{ color: 'var(--emerald-500)', margin: '0 auto 0.5rem' }} />
                              <p style={{ fontWeight: 600 }}>All staff requests reviewed</p>
                            </td>
                          </tr>
                        ) : (
                          (Array.isArray(pendingStaff) ? pendingStaff : []).slice(0, 4).map((staff) => (
                            <tr key={staff.id || staff.user_id}>
                              <td>
                                <strong style={{ color: 'var(--navy-900)' }}>{staff.full_name}</strong>
                                <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
                                  {staff.email}
                                </div>
                              </td>
                              <td style={{ fontSize: '0.825rem' }}>{staff.department}</td>
                              <td>
                                <span className="badge badge-amber">{staff.requested_role}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Link to="/sysadmin/pending-staff" className="btn btn-primary btn-sm">
                                  Review
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Infrastructure Security */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
                    Security & Platform Health
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                    Security safeguards and cryptographic token status
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>
                        Two-Factor OTP Service
                      </span>
                      <span className="badge badge-emerald">Operational</span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>
                        AI Vision Inference Engine (YOLO)
                      </span>
                      <span className="badge badge-emerald">Active (0.60 conf)</span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4ed8' }}>
                        MongoDB Indexes & Audit Logs
                      </span>
                      <span className="badge badge-blue">Synced</span>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                        Overdue Job Automation
                      </span>
                      <span className="badge badge-gray">SLA Enforced</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SysAdminDashboard;

