import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}