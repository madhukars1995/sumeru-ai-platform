import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationSystem';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  cpu: {
    usage: number;
  };
  network: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
  rendering: {
    fps: number;
    frameTime: number;
  };
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, limit: 0 },
    cpu: { usage: 0 },
    network: { requests: 0, errors: 0, avgResponseTime: 0 },
    rendering: { fps: 0, frameTime: 0 }
  });
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        }));

        // Alert if memory usage is high
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (memoryUsage > 0.8 && !alerts.includes('memory')) {
          setAlerts(prev => [...prev, 'memory']);
          addNotification({
            type: 'warning',
            title: 'High Memory Usage',
            message: `Memory usage is at ${(memoryUsage * 100).toFixed(1)}%`,
            duration: 5000
          });
        } else if (memoryUsage <= 0.8 && alerts.includes('memory')) {
          setAlerts(prev => prev.filter(a => a !== 'memory'));
        }
      }
    };

    const interval = setInterval(updateMemoryMetrics, 5000);
    return () => clearInterval(interval);
  }, [alerts, addNotification]);

  // Monitor FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const frameTime = 1000 / fps;
        
        setMetrics(prev => ({
          ...prev,
          rendering: { fps, frameTime }
        }));

        // Alert if FPS is low
        if (fps < 30 && !alerts.includes('fps')) {
          setAlerts(prev => [...prev, 'fps']);
          addNotification({
            type: 'warning',
            title: 'Low Frame Rate',
            message: `FPS is ${fps}, consider closing some tabs`,
            duration: 5000
          });
        } else if (fps >= 30 && alerts.includes('fps')) {
          setAlerts(prev => prev.filter(a => a !== 'fps'));
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }, [alerts, addNotification]);

  const getMemoryUsagePercentage = () => {
    return metrics.memory.limit > 0 
      ? (metrics.memory.used / metrics.memory.limit) * 100 
      : 0;
  };

  const getMemoryColor = (usage: number) => {
    if (usage > 80) return '#ef4444';
    if (usage > 60) return '#f59e0b';
    return '#10b981';
  };

  const getFPSColor = (fps: number) => {
    if (fps < 30) return '#ef4444';
    if (fps < 50) return '#f59e0b';
    return '#10b981';
  };

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
          left: '120px',
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
        📊 Performance
      </button>

      {/* Monitor Panel */}
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
          maxWidth: '400px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>📊 Performance Monitor</h3>
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

          {/* Memory Usage */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>💾 Memory:</div>
            <div style={{ marginBottom: '5px' }}>
              Usage: <span style={{ color: getMemoryColor(getMemoryUsagePercentage()) }}>
                {getMemoryUsagePercentage().toFixed(1)}%
              </span>
            </div>
            <div style={{ 
              background: '#333', 
              height: '8px', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: getMemoryColor(getMemoryUsagePercentage()),
                height: '100%',
                width: `${getMemoryUsagePercentage()}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
              {Math.round(metrics.memory.used / 1024 / 1024)}MB / {Math.round(metrics.memory.limit / 1024 / 1024)}MB
            </div>
          </div>

          {/* FPS */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🎬 Rendering:</div>
            <div>
              FPS: <span style={{ color: getFPSColor(metrics.rendering.fps) }}>
                {metrics.rendering.fps}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              Frame Time: {metrics.rendering.frameTime.toFixed(1)}ms
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>⚠️ Alerts:</div>
              {alerts.map(alert => (
                <div key={alert} style={{ color: '#f59e0b', fontSize: '11px' }}>
                  • {alert.charAt(0).toUpperCase() + alert.slice(1)} issue detected
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}; 