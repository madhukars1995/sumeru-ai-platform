import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getAgentAnalytics, getPerformanceInsights, getTaskHistory } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  agents: Record<string, any>;
  overall_stats: {
    total_tasks: number;
    total_successful_tasks: number;
    success_rate: number;
    total_time_hours: number;
    avg_task_duration: number;
    active_agents: number;
  };
  recent_activity: any[];
}

interface PerformanceInsights {
  top_performers: any[];
  bottlenecks: any[];
  recommendations: any[];
  trends: any[];
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedChart, setSelectedChart] = useState('performance');

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
      if (historyRes.success) setTaskHistory(historyRes.history || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  // Chart data preparation
  const getPerformanceChartData = () => {
    if (!analytics) return null;

    const agentNames = Object.keys(analytics.agents);
    const successRates = agentNames.map(role => analytics.agents[role].success_rate || 0);
    const taskCounts = agentNames.map(role => analytics.agents[role].total_tasks || 0);

    return {
      labels: agentNames.map(role => analytics.agents[role].name || role),
      datasets: [
        {
          label: 'Success Rate (%)',
          data: successRates,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Task Count',
          data: taskCounts,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };

  const getTaskTrendChartData = () => {
    if (!taskHistory.length) return null;

    // Group tasks by date
    const tasksByDate = taskHistory.reduce((acc, task) => {
      const date = new Date(task.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = { completed: 0, failed: 0 };
      if (task.success) acc[date].completed++;
      else acc[date].failed++;
      return acc;
    }, {} as Record<string, { completed: number; failed: number }>);

    const dates = Object.keys(tasksByDate).slice(-7); // Last 7 days
    const completed = dates.map(date => tasksByDate[date]?.completed || 0);
    const failed = dates.map(date => tasksByDate[date]?.failed || 0);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Completed Tasks',
          data: completed,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Failed Tasks',
          data: failed,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const getAgentDistributionData = () => {
    if (!analytics) return null;

    const agentNames = Object.keys(analytics.agents);
    const taskCounts = agentNames.map(role => analytics.agents[role].total_tasks || 0);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384'
    ];

    return {
      labels: agentNames.map(role => analytics.agents[role].name || role),
      datasets: [
        {
          data: taskCounts,
          backgroundColor: colors.slice(0, agentNames.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
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
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Analytics Dashboard</h2>
        <div className="flex space-x-2">
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
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="performance">Performance Overview</option>
            <option value="trends">Task Trends</option>
            <option value="distribution">Agent Distribution</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance Overview</h3>
          {getPerformanceChartData() && (
            <Bar
              data={getPerformanceChartData()!}
              options={{
                ...chartOptions,
                plugins: {
                  title: {
                    display: true,
                    text: 'Success Rate vs Task Count by Agent',
                  },
                },
              }}
            />
          )}
        </div>

        {/* Task Trends Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Completion Trends</h3>
          {getTaskTrendChartData() && (
            <Line
              data={getTaskTrendChartData()!}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Daily Task Completion Trends',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          )}
        </div>

        {/* Agent Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution by Agent</h3>
          {getAgentDistributionData() && (
            <Doughnut
              data={getAgentDistributionData()!}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Task Distribution',
                  },
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          )}
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
          {insights && (
            <div className="space-y-4">
              {insights.top_performers?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Top Performers</h4>
                  <ul className="space-y-2">
                    {insights.top_performers.slice(0, 3).map((performer: any, index: number) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{performer.agent_name}</span>
                        <span className="text-sm text-gray-600">{performer.metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {insights.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {insights.recommendations.slice(0, 3).map((rec: any, index: number) => (
                      <li key={index} className="p-2 bg-blue-50 rounded">
                        <p className="text-sm text-blue-900">{rec.suggestion}</p>
                        <p className="text-xs text-blue-700 mt-1">{rec.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
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
                {taskHistory.slice(0, 10).map((task: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.agent_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.task_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(task.duration || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {task.success ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.timestamp).toLocaleString()}
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

export default EnhancedAnalyticsDashboard; 