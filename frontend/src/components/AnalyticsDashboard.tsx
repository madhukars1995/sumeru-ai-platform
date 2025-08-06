import React, { useState, useEffect } from 'react';
import { getAgentAnalytics, getPerformanceInsights, getTaskHistory } from '../services/api';

interface AnalyticsData {
  agents: Record<string, unknown>;
  overall_stats: {
    total_tasks: number;
    total_successful_tasks: number;
    success_rate: number;
    total_time_hours: number;
    avg_task_duration: number;
    active_agents: number;
  };
  recent_activity: unknown[];
}

interface PerformanceInsights {
  top_performers: unknown[];
  bottlenecks: unknown[];
  recommendations: unknown[];
  trends: unknown[];
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [taskHistory, setTaskHistory] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, insightsRes, historyRes] = await Promise.all([
        getAgentAnalytics(),
        getPerformanceInsights(),
        getTaskHistory()
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (insightsRes.success) setInsights(insightsRes.insights);
      if (historyRes.success) setTaskHistory((historyRes.history as unknown[]) || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to demo data if backend is not available
      setAnalytics({
        agents: {
          'Product Manager': {
            name: 'Alice Johnson',
            total_tasks: 12,
            success_rate: 95.8,
            avg_completion_time: 2.5
          },
          'Software Engineer': {
            name: 'Bob Smith',
            total_tasks: 18,
            success_rate: 88.9,
            avg_completion_time: 4.2
          },
          'UI/UX Designer': {
            name: 'Carol Davis',
            total_tasks: 8,
            success_rate: 100.0,
            avg_completion_time: 3.1
          }
        },
        overall_stats: {
          total_tasks: 38,
          total_successful_tasks: 35,
          success_rate: 92.1,
          total_time_hours: 125.5,
          avg_task_duration: 3.3,
          active_agents: 3
        },
        recent_activity: []
      });
      
      setInsights({
        top_performers: [
          { agent_name: 'Carol Davis', metric: '100% Success Rate' },
          { agent_name: 'Alice Johnson', metric: '95.8% Success Rate' },
          { agent_name: 'Bob Smith', metric: '18 Tasks Completed' }
        ],
        bottlenecks: [],
        recommendations: [
          { suggestion: 'Consider adding more UI/UX tasks', reason: 'Carol has 100% success rate' },
          { suggestion: 'Optimize task distribution', reason: 'Bob has highest task count' }
        ],
        trends: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const getAgentPerformanceColor = (successRate: number) => {
    if (successRate >= 90) return 'text-green-600';
    if (successRate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">Real-time performance metrics and insights</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // TODO: Implement real-time mode toggle
              console.log('Toggle real-time mode');
            }}
            className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            🔄 Live Mode
          </button>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overall_stats.total_tasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overall_stats.success_rate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.overall_stats.avg_task_duration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overall_stats.active_agents}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Performance */}
      {analytics && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Agent Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(analytics.agents).map(([role, data]: [string, unknown]) => (
                  <tr key={role}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{((data as { name?: string })?.name?.[0]) || role[0]}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{(data as { name?: string })?.name || role}</div>
                          <div className="text-sm text-gray-500">{role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(data as { total_tasks: number }).total_tasks}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getAgentPerformanceColor((data as { success_rate?: number })?.success_rate || 0)}`}>
                        {((data as { success_rate?: number })?.success_rate || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration((data as { avg_completion_time?: number })?.avg_completion_time || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (data as { total_tasks: number }).total_tasks > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(data as { total_tasks: number }).total_tasks > 0 ? 'Active' : 'Idle'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
            </div>
            <div className="p-6">
              {insights.top_performers?.length > 0 ? (
                <ul className="space-y-3">
                  {insights.top_performers.map((performer: unknown, index: number) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{(performer as { agent_name: string }).agent_name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{(performer as { metric: string }).metric}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No performance data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
            </div>
            <div className="p-6">
              {insights.recommendations?.length > 0 ? (
                <ul className="space-y-3">
                  {insights.recommendations.map((rec: unknown, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{(rec as { suggestion: string }).suggestion}</p>
                        <p className="text-xs text-gray-500 mt-1">{(rec as { reason: string }).reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recommendations available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {taskHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskHistory.slice(0, 10).map((task: unknown, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(task as { agent_role: string }).agent_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{(task as { task_description: string }).task_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration((task as { duration?: number })?.duration || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (task as { success: boolean }).success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {(task as { success: boolean }).success ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date((task as { timestamp: string }).timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 