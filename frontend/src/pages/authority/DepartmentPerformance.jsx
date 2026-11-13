// frontend/src/pages/authority/DepartmentPerformance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  ArrowUpDown,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { authorityApi } from '../../api/authorityApi';

export const DepartmentPerformance = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('resolution_rate');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await authorityApi.getDepartmentPerformance();
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.departments) ? raw.departments : []);
        setDepartments(list);
      } catch (err) {
        console.error('Failed to load department performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const safeDepts = Array.isArray(departments) ? departments : [];
  const sorted = [...safeDepts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const filtered = sorted.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Department Performance Matrix"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Departmental Efficiency & SLA Compliance</h1>
              <p>
                Comprehensive operational breakdown comparing resolution speed, backlog, and overdue penalties across municipal divisions.
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
                placeholder="Search department name or municipal code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Compiling departmental analytics..." />
          ) : (
            <div className="card">
              <div className="table-container" style={{ border: 'none' }}>
                <table className="civic-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        Department <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th onClick={() => handleSort('total_assigned')} style={{ cursor: 'pointer' }}>
                        Assigned <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th onClick={() => handleSort('resolved')} style={{ cursor: 'pointer' }}>
                        Resolved <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th>Pending</th>
                      <th onClick={() => handleSort('overdue')} style={{ cursor: 'pointer' }}>
                        Overdue <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th onClick={() => handleSort('avg_resolution_days')} style={{ cursor: 'pointer' }}>
                        Avg Turnaround <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th onClick={() => handleSort('resolution_rate')} style={{ cursor: 'pointer' }}>
                        Resolution Rate <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th style={{ textAlign: 'right' }}>Directive Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((dept) => {
                      const rate = dept.resolution_rate || 80;
                      const isHigh = rate >= 90;
                      const isMed = rate >= 80 && rate < 90;

                      return (
                        <tr key={dept.id || dept.code}>
                          <td>
                            <strong style={{ color: 'var(--navy-900)', fontSize: '0.9rem' }}>
                              {dept.name}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              Code: {dept.code}
                            </div>
                          </td>

                          <td>
                            <strong>{dept.total_assigned}</strong>
                          </td>

                          <td>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{dept.resolved}</span>
                          </td>

                          <td>
                            <span style={{ color: '#b45309', fontWeight: 600 }}>{dept.pending}</span>
                          </td>

                          <td>
                            <span
                              style={{
                                color: dept.overdue > 0 ? '#b91c1c' : 'var(--slate-600)',
                                fontWeight: dept.overdue > 0 ? 700 : 400,
                              }}
                            >
                              {dept.overdue}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={13} style={{ color: 'var(--slate-400)' }} />
                              <span>{dept.avg_resolution_days} Days</span>
                            </div>
                          </td>

                          <td style={{ minWidth: 160 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem', fontWeight: 700 }}>
                              <span style={{ color: isHigh ? '#059669' : isMed ? '#2563eb' : '#d97706' }}>
                                {rate}%
                              </span>
                            </div>
                            <div style={{ height: 6, backgroundColor: 'var(--slate-200)', borderRadius: 999, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${rate}%`,
                                  backgroundColor: isHigh ? '#10b981' : isMed ? '#3b82f6' : '#f59e0b',
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                navigate('/authority/actions', {
                                  state: { preselectedDeptId: dept.id, preselectedDeptName: dept.name },
                                })
                              }
                            >
                              <ShieldAlert size={13} />
                              <span>Issue Directive</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

export default DepartmentPerformance;

