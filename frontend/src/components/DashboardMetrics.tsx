import React, { useState, useEffect } from 'react';

interface DashboardMetricsProps {
  onRefresh?: () => void;
}

interface Metrics {
  activeProjects: number;
  teamMembers: number;
  tasksCompleted: number;
  filesGenerated: number;
  chatMessages: number;
  agentOutputs: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState<Metrics>({
    activeProjects: 0,
    teamMembers: 0,
    tasksCompleted: 0,
    filesGenerated: 0,
    chatMessages: 0,
    agentOutputs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch team members
      const teamResponse = await fetch('/api/team');
      const teamData = await teamResponse.json();
      const teamMembers = teamData.length;

      // Fetch chat messages
      const chatResponse = await fetch('/api/chat/messages');
      const chatData = await chatResponse.json();
      const chatMessages = Array.isArray(chatData) ? chatData.length : 0;

      // Fetch files
      const filesResponse = await fetch('/api/files');
      const filesData = await filesResponse.json();
      const filesGenerated = Array.isArray(filesData) ? filesData.length : 0;

      // Fetch active projects (placeholder for now)
      const activeProjects = 0; // TODO: Implement project API

      // Fetch tasks completed (placeholder for now)
      const tasksCompleted = 0; // TODO: Implement task API

      // Fetch agent outputs (placeholder for now)
      const agentOutputs = 0; // TODO: Implement agent outputs API

      setMetrics({
        activeProjects,
        teamMembers,
        tasksCompleted,
        filesGenerated,
        chatMessages,
        agentOutputs
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricsData = [
    { label: 'Active Projects', value: metrics.activeProjects, icon: '🚀', color: 'text-blue-400' },
    { label: 'Team Members', value: metrics.teamMembers, icon: '👥', color: 'text-green-400' },
    { label: 'Tasks Completed', value: metrics.tasksCompleted, icon: '✅', color: 'text-yellow-400' },
    { label: 'Files Generated', value: metrics.filesGenerated, icon: '📄', color: 'text-purple-400' },
    { label: 'Chat Messages', value: metrics.chatMessages, icon: '💬', color: 'text-cyan-400' },
    { label: 'Agent Outputs', value: metrics.agentOutputs, icon: '🤖', color: 'text-orange-400' }
  ];

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 'var(--space-8)' }}>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-slate-300">Loading metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: 'var(--space-8)' }}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️ {error}</div>
            <button
              onClick={fetchMetrics}
              className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 'var(--space-8)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Platform Metrics</h3>
        <button
          onClick={fetchMetrics}
          className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-6)',
        textAlign: 'center'
      }}>
        {metricsData.map((stat, index) => (
          <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-2xl mb-2">
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-slate-200 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 