import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    swap: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    latency: number;
  };
  disk: {
    used: number;
    total: number;
    readSpeed: number;
    writeSpeed: number;
  };
  application: {
    responseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    activeConnections: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: { usage: 0, cores: 8, temperature: 45 },
    memory: { used: 0, total: 16, available: 0, swap: 0 },
    network: { bytesIn: 0, bytesOut: 0, connections: 0, latency: 0 },
    disk: { used: 0, total: 1000, readSpeed: 0, writeSpeed: 0 },
    application: { responseTime: 0, requestsPerSecond: 0, errorRate: 0, activeConnections: 0 }
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [isRealTime, setIsRealTime] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  // Try to get real system metrics
  useEffect(() => {
    const updateMetrics = async () => {
      try {
        // Try to get real system metrics from the backend
        const response = await fetch('/api/system/metrics');
        if (response.ok) {
          const realMetrics = await response.json();
          setMetrics(realMetrics);
          setHasRealData(true);
        } else {
          // No real metrics available, show zeros
          setHasRealData(false);
          setMetrics({
            cpu: { usage: 0, cores: 8, temperature: 45 },
            memory: { used: 0, total: 16, available: 0, swap: 0 },
            network: { bytesIn: 0, bytesOut: 0, connections: 0, latency: 0 },
            disk: { used: 0, total: 1000, readSpeed: 0, writeSpeed: 0 },
            application: { responseTime: 0, requestsPerSecond: 0, errorRate: 0, activeConnections: 0 }
          });
        }
      } catch (error) {
        console.log('No real system metrics available');
        setHasRealData(false);
        setMetrics({
          cpu: { usage: 0, cores: 8, temperature: 45 },
          memory: { used: 0, total: 16, available: 0, swap: 0 },
          network: { bytesIn: 0, bytesOut: 0, connections: 0, latency: 0 },
          disk: { used: 0, total: 1000, readSpeed: 0, writeSpeed: 0 },
          application: { responseTime: 0, requestsPerSecond: 0, errorRate: 0, activeConnections: 0 }
        });
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Only generate alerts if we have real data and thresholds are exceeded
  useEffect(() => {
    if (!hasRealData) {
      setAlerts([]);
      return;
    }

    const newAlerts: Alert[] = [];
    
    if (metrics.cpu.usage > 0 && metrics.cpu.usage > 90) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'warning',
        title: 'High CPU Usage',
        message: `CPU usage is at ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        severity: 'medium',
        resolved: false
      });
    }

    if (metrics.memory.used > 0 && metrics.memory.used / metrics.memory.total > 0.9) {
      newAlerts.push({
        id: (Date.now() + 1).toString(),
        type: 'error',
        title: 'High Memory Usage',
        message: `Memory usage is at ${((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        severity: 'high',
        resolved: false
      });
    }

    if (metrics.application.errorRate > 0 && metrics.application.errorRate > 3) {
      newAlerts.push({
        id: (Date.now() + 2).toString(),
        type: 'error',
        title: 'High Error Rate',
        message: `Error rate is at ${metrics.application.errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        severity: 'high',
        resolved: false
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
    }
  }, [metrics, hasRealData]);

  const getStatusColor = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMetricCard = (title: string, value: number, unit: string, thresholds: { warning: number; error: number }, icon: string) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className={`text-lg font-bold ${getStatusColor(value, thresholds)}`}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            value >= thresholds.error ? 'bg-red-500' :
            value >= thresholds.warning ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min((value / thresholds.error) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-200">
              Performance Dashboard
            </h2>
            <p className="text-sm text-slate-400">
              Real-time system monitoring and analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {(['1h', '6h', '24h', '7d'] as const).map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                isRealTime
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              {isRealTime ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Metrics */}
        <div className="flex-1 p-6">
          {!hasRealData && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <span className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Demo Mode
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Real system metrics are not available. This dashboard shows placeholder data for demonstration purposes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {getMetricCard('CPU Usage', metrics.cpu.usage, '%', { warning: 70, error: 90 }, '🖥️')}
            {getMetricCard('Memory Usage', (metrics.memory.used / metrics.memory.total) * 100, '%', { warning: 80, error: 90 }, '💾')}
            {getMetricCard('Response Time', metrics.application.responseTime, 'ms', { warning: 100, error: 200 }, '⚡')}
            {getMetricCard('Error Rate', metrics.application.errorRate, '%', { warning: 2, error: 5 }, '⚠️')}
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">CPU Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usage</span>
                  <span className="text-sm font-medium">{metrics.cpu.usage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cores</span>
                  <span className="text-sm font-medium">{metrics.cpu.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                  <span className="text-sm font-medium">{metrics.cpu.temperature.toFixed(1)}°C</span>
                </div>
              </div>
            </div>

            {/* Memory Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Memory Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Used</span>
                  <span className="text-sm font-medium">{metrics.memory.used.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                  <span className="text-sm font-medium">{metrics.memory.available.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Swap</span>
                  <span className="text-sm font-medium">{metrics.memory.swap.toFixed(1)} GB</span>
                </div>
              </div>
            </div>

            {/* Network Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Network Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bytes In</span>
                  <span className="text-sm font-medium">{(metrics.network.bytesIn / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bytes Out</span>
                  <span className="text-sm font-medium">{(metrics.network.bytesOut / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                  <span className="text-sm font-medium">{metrics.network.connections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latency</span>
                  <span className="text-sm font-medium">{metrics.network.latency.toFixed(1)} ms</span>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Application Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="text-sm font-medium">{metrics.application.responseTime.toFixed(1)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Requests/sec</span>
                  <span className="text-sm font-medium">{metrics.application.requestsPerSecond.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                  <span className="text-sm font-medium">{metrics.application.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                  <span className="text-sm font-medium">{metrics.application.errorRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Alerts ({alerts.filter(a => !a.resolved).length})
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, resolved: true } : a))}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm">No alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 