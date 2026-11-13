// frontend/src/utils/formatters.js

import { STATUS_LABELS } from './constants';

export const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateValue);
  }
};

export const formatDateTime = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateValue);
  }
};

export const formatTimeAgo = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const d = new Date(dateValue);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateValue);
  } catch {
    return String(dateValue);
  }
};

export const formatCoordinates = (lat, lng) => {
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return 'Coordinates unavailable';
  }
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return `${lat}, ${lng}`;
  return `${latNum.toFixed(5)}° N, ${lngNum.toFixed(5)}° E`;
};

export const formatConfidence = (confidence) => {
  if (confidence === undefined || confidence === null) return 'N/A';
  const num = Number(confidence);
  if (isNaN(num)) return 'N/A';
  const pct = num > 1 ? num : num * 100;
  return `${pct.toFixed(1)}%`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const truncate = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatStatus = (status) => {
  return STATUS_LABELS[status] || status || 'Unknown';
};

export const formatAddress = (address) => {
  if (!address) return 'Location registered';
  if (typeof address === 'object') {
    return address.formatted || address.locality || address.display_name || address.city || 'Location registered';
  }
  return String(address);
};


