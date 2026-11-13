// frontend/src/pages/authority/OverdueReports.jsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  Search,
  Building,
  Calendar,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { authorityApi } from '../../api/authorityApi';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const OverdueReports = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('CURRENT'); // 'CURRENT' | 'HISTORICAL'
  const [currentOverdue, setCurrentOverdue] = useState([]);
  const [historicalOverdue, setHistoricalOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [currRes, histRes] = await Promise.all([
          authorityApi.getCurrentOverdue(),
          authorityApi.getHistoricalOverdue(),
        ]);
        const currRaw = currRes?.data;
        const currList = Array.isArray(currRaw) ? currRaw : (Array.isArray(currRaw?.assignments) ? currRaw.assignments : []);
        const histRaw = histRes?.data;
        const histList = Array.isArray(histRaw) ? histRaw : (Array.isArray(histRaw?.assignments) ? histRaw.assignments : []);
        setCurrentOverdue(currList);
        setHistoricalOverdue(histList);
      } catch (err) {
        console.error('Failed to load authority overdue reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const displayedList = activeTab === 'CURRENT' ? currentOverdue : historicalOverdue;
  const safeList = Array.isArray(displayedList) ? displayedList : [];

  const filtered = safeList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const rep = (item.assignment?.report_id || '').toLowerCase().includes(q);
    const cmp = (item.complaint_id || '').toLowerCase().includes(q);
    const title = (item.title || item.category || '').toLowerCase().includes(q);
    const dept = (item.assignment?.department || '').toLowerCase().includes(q);
    return rep || cmp || title || dept;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="SLA Overdue Audit Reports"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Metropolitan SLA Breach Audit</h1>
              <p>
                Permanent institutional compliance log. Tracks all active breaches and preserved historical overdue events.
              </p>
            </div>
          </div>

          {/* Policy Notice */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #fecdd3',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#9f1239',
            }}
          >
            <ShieldAlert size={28} style={{ color: '#e11d48', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Immutable Accountability Rule:</strong>
              <div style={{ fontSize: '0.85rem', color: '#be123c', marginTop: 2 }}>
                Even after an overdue assignment is repaired and marked "Resolved", it cannot be erased from the Historical Overdue Incidents registry.
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'CURRENT' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('CURRENT')}
            >
              <AlertTriangle size={15} />
              <span>Active Overdue Work ({currentOverdue.length})</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'HISTORICAL' ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setActiveTab('HISTORICAL')}
            >
              <Clock size={15} />
              <span>Permanent Historical Overdue Log ({historicalOverdue.length})</span>
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
            <div className="form-input-wrapper" style={{ maxWidth: 450 }}>
              <Search size={16} className="form-input-icon" />
              <input
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Search audit records by Report ID, Complaint ID, or Department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Compiling executive overdue audit..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Complaint Reference</th>
                      <th>Department</th>
                      <th>Assigned Supervisor</th>
                      <th>SLA Deadline</th>
                      <th>Resolution Status</th>
                      <th>Audit Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                          <Clock size={36} style={{ color: 'var(--slate-300)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontWeight: 600 }}>No overdue records match the active criteria</p>
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
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              {item.title || item.category}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
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
                                Active Breach
                              </span>
                            ) : (
                              <span className="badge badge-amber">
                                Resolved after Overdue Breach
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

export default OverdueReports;

