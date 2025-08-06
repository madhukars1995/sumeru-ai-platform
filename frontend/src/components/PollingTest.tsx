import React, { useState, useEffect } from 'react';
import { usePollingManager } from '../utils/pollingManager';

export const PollingTest: React.FC = () => {
  const [testCount, setTestCount] = useState(0);
  const { registerJob, getStats } = usePollingManager();
  const [stats, setStats] = useState({ totalJobs: 0, activeIntervals: 0, isVisible: true });

  const testPolling = async () => {
    console.log('🔍 Polling test executed:', new Date().toISOString());
    setTestCount(prev => prev + 1);
  };

  useEffect(() => {
    const cleanup = registerJob('test-polling', testPolling, 10000); // 10 seconds
    
    // Update stats every second
    const statsInterval = setInterval(() => {
      setStats(getStats());
    }, 1000);

    return () => {
      cleanup();
      clearInterval(statsInterval);
    };
  }, [registerJob, getStats]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🧪 Polling Test</div>
      <div>Test Count: {testCount}</div>
      <div>Total Jobs: {stats.totalJobs}</div>
      <div>Active Intervals: {stats.activeIntervals}</div>
      <div>Visible: {stats.isVisible ? '✅' : '❌'}</div>
    </div>
  );
}; 