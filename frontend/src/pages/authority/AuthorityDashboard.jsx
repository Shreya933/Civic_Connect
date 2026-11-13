// frontend/src/pages/authority/AuthorityDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { authorityApi } from '../../api/authorityApi';

export const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [perfData, setPerfData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashRes, perfRes] = await Promise.all([
          authorityApi.getDashboardData(),
          authorityApi.getDepartmentPerformance(),
        ]);
        setDashboardData(dashRes.data);
        setPerfData(perfRes.data || []);
      } catch (err) {
        console.error('Failed to load higher authority dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Executive Civic Governance"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Executive Municipal Intelligence</h1>
              <p>
                Citywide performance oversight, departmental compliance metrics, and SLA enforcement.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/authority/actions" className="btn btn-primary">
                <ShieldAlert size={16} />
                <span>Issue Administrative Directive</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Aggregating metropolitan civic intelligence..." />
          ) : (
            <>
              {/* Top KPI Metrics Cards */}
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <StatCard
                  title="Total Complaints"
                  value={dashboardData?.total_complaints || 745}
                  icon={Layers}
                  trend="+8.4%"
                  subtitle="Citywide submissions"
                  color="#2563eb"
                  bgLight="#eff6ff"
                />
                <StatCard
                  title="Total Resolved"
                  value={dashboardData?.resolved || 556}
                  icon={CheckCircle2}
                  trend="+14.2%"
                  subtitle="Verified with photo proofs"
                  color="#10b981"
                  bgLight="#ecfdf5"
                />
                <StatCard
                  title="Resolution Rate"
                  value={`${dashboardData?.resolution_rate || 74.6}%`}
                  icon={Award}
                  trend="+4.1%"
                  subtitle="Citywide SLA efficiency"
                  color="#4f46e5"
                  bgLight="#eef2ff"
                />
                <StatCard
                  title="Currently Overdue"
                  value={dashboardData?.currently_overdue_assignments || 18}
                  icon={AlertTriangle}
                  subtitle="Active SLA breaches"
                  color="#e11d48"
                  bgLight="#fff1f2"
                />
                <StatCard
                  title="Historical Overdue"
                  value={dashboardData?.historical_overdue_assignments || 64}
                  icon={Clock}
                  subtitle="Total breaches logged"
                  color="#d97706"
                  bgLight="#fffbeb"
                />
              </div>

              {/* Charts Row 1: Monthly Trends & Overdue Incidence */}
              <div className="chart-grid">
                {/* Monthly Volume & Resolution Trend */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Monthly Grievance & Resolution Trends</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Complaints reported vs successfully resolved over 6 months
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData?.monthly_trends || []}>
                        <defs>
                          <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="reported"
                          stroke="#2563eb"
                          fillOpacity={1}
                          fill="url(#colorReported)"
                          name="Reported"
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorResolved)"
                          name="Resolved"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Overdue Complaint Trend */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">SLA Overdue Incidents Trend</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        Monthly count of complaints that crossed the maximum deadline
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData?.monthly_trends || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="overdue"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          name="Overdue Incidents"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Department Performance Comparison */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Department Work Order Distribution</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Total assigned vs resolved vs overdue work orders per municipal department
                    </p>
                  </div>
                  <Link to="/authority/departments" className="btn btn-outline btn-sm">
                    <span>Full Performance Matrix</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="card-body" style={{ height: 340 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perfData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_assigned" fill="#3b82f6" name="Total Assigned" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuthorityDashboard;

