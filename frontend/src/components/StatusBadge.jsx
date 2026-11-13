// frontend/src/components/StatusBadge.jsx
import React from 'react';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Ban,
  Check,
} from 'lucide-react';
import { STATUS_LABELS } from '../utils/constants';

export const StatusBadge = ({ status, size = 'normal' }) => {
  const norm = String(status || '').toUpperCase();

  switch (norm) {
    case 'PENDING':
    case 'PENDING_REVIEW':
      return (
        <span className="badge badge-amber d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
          <Clock size={12} />
          {STATUS_LABELS[norm] || 'Pending Review'}
        </span>
      );

    case 'APPROVED':
      return (
        <span className="badge badge-blue d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
          <Check size={12} />
          {STATUS_LABELS.APPROVED}
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
          <PlayCircle size={12} />
          {STATUS_LABELS.IN_PROGRESS}
        </span>
      );

    case 'RESOLVED':
      return (
        <span className="badge badge-emerald d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={12} />
          {STATUS_LABELS.RESOLVED}
        </span>
      );

    case 'REJECTED':
      return (
        <span className="badge badge-rose d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          <XCircle size={12} />
          {STATUS_LABELS.REJECTED}
        </span>
      );

    case 'OVERDUE':
    case 'CURRENTLY OVERDUE':
      return (
        <span className="badge badge-red d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 700 }}>
          <AlertTriangle size={12} />
          {norm === 'CURRENTLY OVERDUE' ? 'CURRENTLY OVERDUE' : 'OVERDUE'}
        </span>
      );

    case 'RESOLVED AFTER OVERDUE':
      return (
        <span className="badge d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontWeight: 700 }}>
          <Clock size={12} />
          RESOLVED AFTER OVERDUE
        </span>
      );

    case 'ACTIVE':
      return (
        <span className="badge badge-emerald d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
          <UserCheck size={12} />
          Active
        </span>
      );

    case 'PENDING_APPROVAL':
      return (
        <span className="badge badge-amber d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
          <Clock size={12} />
          Pending Approval
        </span>
      );

    case 'SUSPENDED':
      return (
        <span className="badge badge-rose d-inline-flex align-items-center gap-1" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          <Ban size={12} />
          Suspended
        </span>
      );

    default:
      return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
  }
};

export default StatusBadge;
