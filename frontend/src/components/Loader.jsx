// frontend/src/components/Loader.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading civic records...', fullPage = false, size = 32 }) => {
  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--slate-600)',
        }}
      >
        <Loader2 size={size} className="spin-animation" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.925rem', fontWeight: 500 }}>{message}</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      {message && <span>{message}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;

