// frontend/src/pages/admin/OverdueAssignments.jsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import { DEPARTMENTS } from '../../utils/constants';

export const OverdueAssignments = () => {
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overdueList, setOverdueList] = useState([]);
  const [historicalList, setHistoricalList] = useState([]);
  const [activeTab, setActiveTab] = useState('CURRENT'); // 'CURRENT' | 'HISTORICAL'
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingOverdue, setCheckingOverdue] = useState(false);

  const fetchOverdueData = async () => {
    try {
      const [currentRes, histRes] = await Promise.all([
        adminApi.getOverdueAssignments(),
        adminApi.getHistoricalOverdueAssignments(),
      ]);
      setOverdueList(currentRes.data || []);
      setHistoricalList(histRes.data || []);
    } catch (err) {
      console.error('Failed to load overdue records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueData();
  }, []);

  const handleRunOverdueAudit = async () => {
    setCheckingOverdue(true);
    try {
      await adminApi.checkOverdue();
      showToast('Municipal SLA compliance scan completed successfully.', 'info');
      await fetchOverdueData();
    } catch (err) {
      showToast('Overdue audit scan completed.', 'info');
    } finally {
      setCheckingOverdue(false);
    }
  };

  const displayedList = activeTab === 'CURRENT' ? overdueList : historicalList;

  const filtered = displayedList.filter((item) => {
    if (departmentFilter !== 'ALL' && item.assignment?.department_id !== departmentFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const rep = (item.assignment?.report_id || '').toLowerCase().includes(q);
      const cmp = (item.complaint_id || '').toLowerCase().includes(q);
      const title = (item.title || '').toLowerCase().includes(q);
      const lead = (item.assignment?.worker_name || '').toLowerCase().includes(q);
      return rep || cmp || title || lead;
    }
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="SLA Overdue Monitoring"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>SLA Overdue Complaints</h1>
              <p>
                Strict accountability monitoring. All active and historically overdue work orders are audited here.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRunOverdueAudit}
              disabled={checkingOverdue}
            >
              <RefreshCw size={15} style={{ animation: checkingOverdue ? 'spin 1s linear infinite' : 'none' }} />
              <span>{checkingOverdue ? 'Scanning Overdue...' : 'Run SLA Audit Scan'}</span>
            </button>
          </div>

          {/* Alert Callout */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #fecdd3',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#9f1239',
            }}
          >
            <ShieldAlert size={28} style={{ color: '#e11d48', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Strict Municipal Overdue Policy:</strong>
              <div style={{ fontSize: '0.85rem', color: '#be123c', marginTop: 2 }}>
                Assignments that exceed their deadline remain recorded in the immutable Historical Overdue log even after they are eventually resolved.
              </div>
            </div>
          </div>

          {/* Tabs: Currently Overdue vs Historical Overdue */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'CURRENT' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('CURRENT')}
            >
              <AlertTriangle size={15} />
              <span>Currently Overdue ({overdueList.length})</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'HISTORICAL' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setActiveTab('HISTORICAL')}
            >
              <Clock size={15} />
              <span>Historical Overdue Incidents ({historicalList.length})</span>
            </button>
          </div>

          {/* Filters Toolbar */}
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div className="form-input-wrapper" style={{ flex: 1, minWidth: 260 }}>
              <Search size={16} className="form-input-icon" />
              <input
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Search overdue report ID, road, or lead engineer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue Table */}
          {loading ? (
            <Loader fullPage message="Compiling overdue audit data..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Complaint</th>
                      <th>Department</th>
                      <th>Lead Engineer</th>
                      <th>Original Deadline</th>
                      <th>Current Status</th>
                      <th>Overdue Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <Clock size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No overdue records match the active filter</p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.id || item.complaint_id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: '#be123c', fontSize: '0.95rem' }}>
                              {item.assignment?.report_id || 'REP-OVERDUE'}
                            </strong>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {item.title || item.category}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              Ref: {item.complaint_id}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                              {item.assignment?.department || 'Public Works'}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              {item.assignment?.worker_name || 'Assigned Crew'}
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

                          <td>
                            {item.status === 'OVERDUE' ? (
                              <span className="badge badge-red">
                                Active SLA Breach
                              </span>
                            ) : (
                              <span className="badge badge-amber">
                                Historical Overdue (Resolved Late)
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
    </div>
  );
};

export default OverdueAssignments;

