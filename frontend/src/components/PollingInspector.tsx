import React, { useState, useEffect } from 'react';
import { pollingDebugger } from '../utils/pollingDebugger';

export const PollingInspector: React.FC = () => {
  const [stats, setStats] = useState(pollingDebugger.getStats());
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setStats(pollingDebugger.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10001,
          fontFamily: 'monospace'
        }}
      >
        🔍 Polling Inspector
      </button>

      {/* Inspector Panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 10002,
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🔍 Polling Inspector</h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Controls */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                pollingDebugger.clearAll();
                setStats(pollingDebugger.getStats());
              }}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🛑 Clear All
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                background: autoRefresh ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
            </button>
          </div>

          {/* Stats */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📊 Summary:</div>
            <div>Total Active Intervals: <span style={{ color: '#ffc107' }}>{stats.totalActive}</span></div>
          </div>

          {/* By Component */}
          {Object.keys(stats.byComponent).length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🏗️ By Component:</div>
              {Object.entries(stats.byComponent).map(([component, count]) => (
                <div key={component} style={{ marginBottom: '2px' }}>
                  {component}: <span style={{ color: '#ffc107' }}>{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Active Intervals */}
          {stats.intervals.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⏱️ Active Intervals:</div>
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {stats.intervals.map((interval, index) => (
                  <div key={index} style={{
                    padding: '5px',
                    marginBottom: '2px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}>
                    <div>{interval.component}</div>
                    <div style={{ color: '#ccc' }}>
                      Interval: {interval.interval}ms | Age: {Math.round(interval.age / 1000)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.totalActive === 0 && (
            <div style={{ color: '#28a745', textAlign: 'center', padding: '20px' }}>
              ✅ No active polling intervals
            </div>
          )}
        </div>
      )}
    </>
  );
}; 