// frontend/src/components/ComplaintCard.jsx
import React from 'react';
import { MapPin, Calendar, ArrowRight, Sparkles, Building } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, formatTimeAgo, formatAddress } from '../utils/formatters';

export const ComplaintCard = ({ complaint, onViewDetails }) => {
  const {
    complaint_id,
    title,
    category,
    image_url,
    thumbnail_url,
    address,
    status,
    submitted_at,
    confidence,
    assignment,
  } = complaint;

  const displayImage =
    thumbnail_url ||
    image_url ||
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      {/* Thumbnail & Badges Overlay */}
      <div style={{ position: 'relative', width: '100%', height: 180, backgroundColor: '#0f172a' }}>
        <img
          src={displayImage}
          alt={category || 'Complaint photo'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <StatusBadge status={status} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.725rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          {complaint_id}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Sparkles size={13} />
          {category}
        </div>

        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--navy-900)',
            marginBottom: '0.65rem',
            lineHeight: 1.35,
          }}
        >
          {title || category}
        </h3>

        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--slate-500)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            marginBottom: '0.5rem',
          }}
        >
          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--slate-400)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {formatAddress(address)}
          </span>
        </div>

        {assignment && assignment.department && (
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--slate-600)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: '0.5rem',
            }}
          >
            <Building size={13} style={{ color: 'var(--slate-400)' }} />
            <span>Assigned: {assignment.department}</span>
          </div>
        )}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            {formatTimeAgo(submitted_at)}
          </span>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => onViewDetails && onViewDetails(complaint)}
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;

