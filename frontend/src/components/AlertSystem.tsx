import React, { useState, useEffect } from 'react';
import { getAgentAnalytics, getPerformanceInsights } from '../services/api';
import { usePollingManager } from '../utils/pollingManager';
import { config } from '../config/environment';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
}

interface AlertThresholds {
  successRate: number;
  taskDuration: number;
  agentIdleTime: number;
  errorRate: number;
}

const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    successRate: 80,
    taskDuration: 2, // hours
    agentIdleTime: 24, // hours
    errorRate: 10
  });
  const [showSettings, setShowSettings] = useState(false);
  const [monitoring, setMonitoring] = useState(true);
  const { registerJob } = usePollingManager();

  const checkPerformance = async () => {
    try {
      const [analyticsRes, insightsRes] = await Promise.all([
        getAgentAnalytics(),
        getPerformanceInsights()
      ]);

      if (analyticsRes.success && insightsRes.success) {
        const analytics = analyticsRes.analytics;
        const insights = insightsRes.insights;
        const newAlerts: Alert[] = [];

        // Check overall performance
        if (analytics.success_rate < thresholds.successRate) {
          newAlerts.push({
            id: `performance-${Date.now()}`,
            type: 'error',
            title: 'Performance Alert',
            message: `Overall success rate is ${analytics.success_rate.toFixed(1)}%, below threshold of ${thresholds.successRate}%`,
            timestamp: new Date(),
            read: false,
            action: 'Review system performance'
          });
        }

        // Check individual agent performance
        Object.entries(analytics.agents).forEach(([role, agent]: [string, any]) => {
          if (agent.success_rate < thresholds.successRate) {
            newAlerts.push({
              id: `agent-${role}-${Date.now()}`,
              type: 'error',
              title: `Agent Performance Issue: ${agent.name || role}`,
              message: `${agent.name || role} has a success rate of ${agent.success_rate.toFixed(1)}%, below threshold`,
              timestamp: new Date(),
              read: false,
              action: 'Review agent configuration'
            });
          }

          if (agent.total_tasks === 0) {
            newAlerts.push({
              id: `agent-idle-${role}-${Date.now()}`,
              type: 'info',
              title: `Agent Idle: ${agent.name || role}`,
              message: `${agent.name || role} has not completed any tasks recently`,
              timestamp: new Date(),
              read: false,
              action: 'Assign tasks to agent'
            });
          }
        });

        // Add new alerts
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error checking performance:', error);
    }
  };

  // Temporarily disable polling to reduce API spam
  useEffect(() => {
    // const cleanup = registerJob('alert-system', async () => {
    //   try {
    //     const response = await metagptAPI.getActiveAgents();
    //     if (response && response.active_agents) {
    //       // Process alerts based on agent status
    //       console.log('Alert system checking agent status');
    //     }
    //   } catch (error) {
    //     console.error('Failed to check alerts:', error);
    //   }
    // }, config.ui.pollingIntervals.analytics);

    // return cleanup;
  }, [registerJob]);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-medium text-gray-900">Alert System</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setMonitoring(!monitoring)}
            className={`px-3 py-1 text-sm rounded ${
              monitoring 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {monitoring ? '🟢 Monitoring' : '🔴 Paused'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Alert Thresholds</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Rate Threshold (%)
              </label>
              <input
                type="number"
                value={thresholds.successRate}
                onChange={(e) => setThresholds(prev => ({ ...prev, successRate: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Task Duration (hours)
              </label>
              <input
                type="number"
                value={thresholds.taskDuration}
                onChange={(e) => setThresholds(prev => ({ ...prev, taskDuration: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Idle Time (hours)
              </label>
              <input
                type="number"
                value={thresholds.agentIdleTime}
                onChange={(e) => setThresholds(prev => ({ ...prev, agentIdleTime: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Rate Threshold (%)
              </label>
              <input
                type="number"
                value={thresholds.errorRate}
                onChange={(e) => setThresholds(prev => ({ ...prev, errorRate: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p>No alerts at the moment</p>
            <p className="text-sm">System is running smoothly</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getAlertColor(alert.type)} ${
                !alert.read ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      {!alert.read && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    {alert.action && (
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Suggested action: {alert.action}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {alerts.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {alerts.length} total alerts • {unreadCount} unread
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, read: true })))}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
            <button
              onClick={() => setAlerts([])}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem; 