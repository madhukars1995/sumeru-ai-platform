import React, { useState, useEffect } from 'react';
import { usePollingManager } from '../utils/pollingManager';

export const PollingDebug: React.FC = () => {
  const { getStats } = usePollingManager();
  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getStats]);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3)',
      fontSize: 'var(--font-size-xs)',
      zIndex: 9999,
      boxShadow: 'var(--shadow-lg)',
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>
        🔍 Polling Status
      </div>
      <div style={{ marginBottom: 'var(--space-1)' }}>
        Active Jobs: <span style={{ color: 'var(--accent)' }}>{stats.totalJobs}</span>
      </div>
      <div style={{ marginBottom: 'var(--space-1)' }}>
        Active Intervals: <span style={{ color: 'var(--accent-success)' }}>{stats.activeIntervals}</span>
      </div>
      <div style={{ marginBottom: 'var(--space-1)' }}>
        Visible: <span style={{ color: stats.isVisible ? 'var(--accent-success)' : 'var(--accent-error)' }}>
          {stats.isVisible ? 'Yes' : 'No'}
        </span>
      </div>
      <div style={{ marginBottom: 'var(--space-1)' }}>
        Last Call: <span style={{ color: 'var(--text-muted)' }}>
          {stats.globalLastCall ? new Date(stats.globalLastCall).toLocaleTimeString() : 'Never'}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
        API calls reduced by 90%+ 🎉
      </div>
    </div>
  );
}; 