import React from 'react';

export const QuotaNotice = () => {
  return (
    <div className="card hover-lift">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white">API Quota</h4>
        <span className="text-xs text-slate-400">Daily</span>
      </div>
      <div className="quota-bar">
        <div className="quota-fill" style={{ width: '75%' }}></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">750 / 1000 requests</span>
        <span className="text-xs text-warning-500">25% remaining</span>
      </div>
    </div>
  );
}; 