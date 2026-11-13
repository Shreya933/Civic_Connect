// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { adminApi } from '../../api/adminApi';
import { formatDate, formatTimeAgo, formatAddress } from '../../utils/formatters';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getPendingComplaints(),
        ]);
        setStats(statsRes?.data);
        const pendingRaw = pendingRes?.data;
        const pendingItems = Array.isArray(pendingRaw) ? pendingRaw : (Array.isArray(pendingRaw?.complaints) ? pendingRaw.complaints : []);
        setPendingList(pendingItems);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Category distribution data for chart
  const categoryData = [
    { name: 'Roads & Potholes', count: 42 },
    { name: 'Waste Mgmt', count: 36 },
    { name: 'Water Leakage', count: 24 },
    { name: 'Drainage & Sewers', count: 20 },
    { name: 'Streetlights', count: 28 },
    { name: 'Public Infra', count: 14 },
    { name: 'Sanitation', count: 18 },
  ];

  // Status breakdown data for bar chart
  const statusData = [
    { name: 'Pending Review', value: stats?.pending_review || 6, color: '#3b82f6' },
    { name: 'In Progress', value: stats?.in_progress || 8, color: '#f59e0b' },
    { name: 'Overdue', value: stats?.overdue_assignments || 3, color: '#ef4444' },
    { name: 'Resolved', value: stats?.resolved || 24, color: '#10b981' },
    { name: 'Rejected', value: stats?.rejected || 2, color: '#64748b' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Municipal Administrative Console"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          {/* Header */}
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Municipal Operations Overview</h1>
              <p>Review incoming citizen complaints, dispatch departmental work orders, and oversee resolution SLAs.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/pending" className="btn btn-primary">
                <Clock size={16} />
                <span>Review Pending Complaints ({stats?.pending_review || 0})</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Compiling municipal metrics..." />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="stat-grid">
                <StatCard
                  title="Total Complaints"
                  value={stats?.total_complaints || 0}
                  icon={FileText}
                  trend="+12%"
                  subtitle="Total civic submissions"
                  color="#2563eb"
                  bgLight="#eff6ff"
                />
                <StatCard
                  title="Pending Review"
                  value={stats?.pending_review || 0}
                  icon={Clock}
                  subtitle="Requires department assignment"
                  color="#3b82f6"
                  bgLight="#eff6ff"
                />
                <StatCard
                  title="Active Work Orders"
                  value={stats?.in_progress || 0}
                  icon={PlayCircle}
                  subtitle="Field teams on duty"
                  color="#f59e0b"
                  bgLight="#fffbeb"
                />
                <StatCard
                  title="Overdue SLA Incidents"
                  value={stats?.overdue_assignments || 0}
                  icon={AlertTriangle}
                  subtitle="Past deadline SLA threshold"
                  color="#ef4444"
                  bgLight="#fef2f2"
                />
                <StatCard
                  title="Resolved & Verified"
                  value={stats?.resolved || 0}
                  icon={CheckCircle2}
                  trend="+18%"
                  subtitle="Repairs closed with photo proof"
                  color="#10b981"
                  bgLight="#ecfdf5"
                />
              </div>

              {/* Interactive Charts Grid */}
              <div className="chart-grid">
                {/* Chart 1: Categories Breakdown */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Complaints by Issue Category</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Volume distribution across municipal divisions
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={105}
                          innerRadius={60}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Status Breakdown */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Resolution Workflow Distribution</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Current status of active and archived records
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} interval={0} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {statusData.map((entry, idx) => (
                            <Cell key={`bar-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pending Complaints Review Quick Table */}
              <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Complaints Awaiting Immediate Review</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Assign department and set SLA deadline to generate formal Report ID
                    </p>
                  </div>
                  <Link to="/admin/pending" className="btn btn-outline btn-sm">
                    <span>View All Pending</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="table-container" style={{ border: 'none' }}>
                  <table className="civic-table">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Photo</th>
                        <th>Category</th>
                        <th>Citizen</th>
                        <th>Location</th>
                        <th>Reported</th>
                        <th>AI Confidence</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!Array.isArray(pendingList) || pendingList.length === 0) ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>
                            <CheckCircle2 size={32} style={{ color: 'var(--emerald-500)', margin: '0 auto 0.5rem' }} />
                            <p style={{ fontWeight: 600 }}>Zero pending complaints!</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                              All citizen submissions have been assigned.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        (Array.isArray(pendingList) ? pendingList : []).slice(0, 5).map((item) => (
                          <tr key={item.id || item.complaint_id}>
                            <td>
                              <strong style={{ color: 'var(--primary)' }}>{item.complaint_id}</strong>
                            </td>
                            <td>
                              <img
                                src={item.thumbnail_url || item.image_url}
                                alt={item.category}
                                style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.category}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                {item.title}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{item.citizen_name || 'Citizen'}</div>
                            </td>
                            <td style={{ maxWidth: 200, fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formatAddress(item.address)}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                              {formatTimeAgo(item.submitted_at)}
                            </td>
                            <td>
                              <span className="badge badge-blue">
                                {(item.confidence ? item.confidence * 100 : 94).toFixed(0)}% AI
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate('/admin/review', { state: { complaint: item } })}
                              >
                                <Eye size={13} />
                                <span>Review & Assign</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

