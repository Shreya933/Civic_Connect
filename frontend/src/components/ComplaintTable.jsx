// frontend/src/components/ComplaintTable.jsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, formatTimeAgo, formatAddress } from '../utils/formatters';
import { ISSUE_CATEGORIES } from '../utils/constants';

export const ComplaintTable = ({
  complaints = [],
  onRowAction,
  actionLabel = 'View',
  showCitizenInfo = false,
  showReportId = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Search complaints
  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const idMatch = (item.complaint_id || '').toLowerCase().includes(q);
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const categoryMatch = (item.category || '').toLowerCase().includes(q);
        const addressMatch = (item.address || '').toLowerCase().includes(q);
        const citizenMatch = (item.citizen_name || '').toLowerCase().includes(q);
        const reportMatch = (item.assignment?.report_id || '').toLowerCase().includes(q);
        return idMatch || titleMatch || categoryMatch || addressMatch || citizenMatch || reportMatch;
      }
      return true;
    });
  }, [complaints, searchTerm, selectedStatus, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  return (
    <div className="card">
      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 260 }}>
          <div className="form-input-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="form-input-icon" />
            <input
              type="text"
              className="form-input form-input-with-icon"
              placeholder="Search by ID, keyword, address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.6rem 0.85rem' }}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category filter */}
          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.6rem 0.85rem' }}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Categories</option>
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="table-container" style={{ border: 'none' }}>
        <table className="civic-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Category & Description</th>
              {showCitizenInfo && <th>Citizen</th>}
              {showReportId && <th>Report ID</th>}
              <th>Location</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={showCitizenInfo || showReportId ? 9 : 8} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <Inbox size={40} style={{ color: 'var(--slate-400)', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontWeight: 600, color: 'var(--navy-900)' }}>No civic complaints found</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 4 }}>
                    Try adjusting your search criteria or filters.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id || item.complaint_id}>
                  <td>
                    <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      {item.complaint_id}
                    </strong>
                  </td>

                  <td>
                    <img
                      src={
                        item.thumbnail_url ||
                        item.image_url ||
                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={item.category}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-light)',
                      }}
                    />
                  </td>

                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.875rem' }}>
                      {item.title || item.category}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--slate-500)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <Sparkles size={11} style={{ color: 'var(--teal-600)' }} />
                      <span>{item.category}</span>
                    </div>
                  </td>

                  {showCitizenInfo && (
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {item.citizen_name || 'Citizen'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {item.citizen_phone || item.citizen_email || 'Contact on file'}
                      </div>
                    </td>
                  )}

                  {showReportId && (
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: 'var(--slate-100)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {item.assignment?.report_id || 'N/A'}
                      </span>
                    </td>
                  )}

                  <td style={{ maxWidth: 220, fontSize: '0.825rem', color: 'var(--slate-600)' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatAddress(item.address)}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={item.status} />
                  </td>

                  <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                    {formatDate(item.submitted_at)}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => onRowAction && onRowAction(item)}
                    >
                      <Eye size={13} />
                      <span>{actionLabel}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filtered.length > pageSize && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
            color: 'var(--slate-500)',
          }}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} complaints
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTable;

