// frontend/src/components/StatCard.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  subtitle,
  color = '#2563eb',
  bgLight = '#eff6ff',
}) => {
  const isPositive = trend && !trend.startsWith('-');

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: bgLight, color: color }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div>
        <div className="stat-card-value">{value ?? 0}</div>
        <div className="stat-card-desc">
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 600,
                color: isPositive ? '#10b981' : '#f43f5e',
              }}
            >
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}
            </span>
          )}
          <span>{trend ? trendLabel : subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

