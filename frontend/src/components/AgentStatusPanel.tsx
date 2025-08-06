import React, { useState, useEffect, useCallback } from 'react';
import { metagptAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useSmartPolling } from '../utils/smartPollingManager';
import { config } from '../config/environment';

interface AgentStatus {
  agent: {
    name: string;
    role: string;
    description: string;
    capabilities: string[];
  };
  task_id: string;
  started_at: string;
  current_step: string;
  progress: number;
}

interface AgentMessage {
  id: string;
  timestamp: string;
  agent_role: string;
  agent_name: string;
  agent_avatar: string;
  message: string;
  message_type: string;
  is_agent: boolean;
}

export const AgentStatusPanel: React.FC = () => {
  const [activeAgents, setActiveAgents] = useState<Record<string, AgentStatus>>({});
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { registerJob } = useSmartPolling();

  const loadActiveAgents = useCallback(async () => {
    try {
      const response = await metagptAPI.getActiveAgents();
      if (response.success && response.active_agents) {
        setActiveAgents(response.active_agents);
      }
    } catch (error) {
      console.error('Error loading active agents:', error);
    }
  }, []);

  const loadAgentMessages = async () => {
    try {
      const response = await metagptAPI.getAgentMessages(20);
      if (response.success && response.messages) {
        setAgentMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading agent messages:', error);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadActiveAgents();
    loadAgentMessages();
    setInitialLoading(false);
  }, [loadActiveAgents]);

  // Use smart polling for agent status
  useEffect(() => {
    const cleanup = registerJob('agent-status', async () => {
      try {
        const response = await metagptAPI.getActiveAgents();
        if (response && response.active_agents) {
          setActiveAgents(response.active_agents);
        }
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
      }
    }, config.ui.pollingIntervals.agents, 'high');

    return cleanup;
  }, [registerJob]);

  // Use smart polling for agent messages
  useEffect(() => {
    const cleanup2 = registerJob('agent-status-messages', loadAgentMessages, config.ui.pollingIntervals.agents, 'medium');
    return cleanup2;
  }, [registerJob]);

  const handleStopAgent = async (agentRole: string) => {
    try {
      setLoading(true);
      const response = await metagptAPI.stopAgentTask(agentRole);
      if (response.success) {
        // Refresh data
        loadActiveAgents();
        loadAgentMessages();
      }
    } catch (error) {
      console.error('Error stopping agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'start': return 'var(--accent-success)';
      case 'progress': return 'var(--accent)';
      case 'complete': return 'var(--accent-success)';
      case 'error': return 'var(--accent-error)';
      default: return 'var(--text-muted)';
    }
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'start': return '🚀';
      case 'progress': return '⚡';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '💬';
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text="Loading agent status..." />;
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      background: 'var(--bg-canvas)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: 'var(--space-3)'
      }}>
        <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>
          🤖 Agent Status
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)'
        }}>
          <span>Active: {Object.keys(activeAgents).length}</span>
          <span>•</span>
          <span>Messages: {agentMessages.length}</span>
        </div>
      </div>

      {/* Active Agents Section */}
      {Object.keys(activeAgents).length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-lg)' }}>
            🟢 Active Agents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {Object.entries(activeAgents).map(([role, status]) => (
              <div
                key={role}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  position: 'relative'
                }}
              >
                {/* Agent Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      fontSize: '2rem',
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {status.agent.name === 'Product Manager' && '🤝'}
                      {status.agent.name === 'Software Architect' && '🏗️'}
                      {status.agent.name === 'Software Engineer' && '💻'}
                      {status.agent.name === 'Project Manager' && '📊'}
                      {status.agent.name === 'UI/UX Designer' && '🎨'}
                      {status.agent.name === 'Data Scientist' && '📈'}
                      {status.agent.name === 'DevOps Engineer' && '⚙️'}
                      {status.agent.name === 'Security Expert' && '🔒'}
                      {status.agent.name === 'QA Engineer' && '🧪'}
                      {status.agent.name === 'Technical Writer' && '📝'}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {status.agent.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)'
                      }}>
                        {status.agent.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStopAgent(role)}
                    disabled={loading}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--accent-error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Stop
                  </button>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Progress</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                      {status.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${status.progress}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Current Step */}
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic'
                }}>
                  Currently: {status.current_step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Messages Section */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-lg)' }}>
          💬 Agent Messages
        </h3>
        <div style={{
          height: '300px',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3)'
        }}>
          {agentMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: 'var(--space-8)'
            }}>
              No agent messages yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {agentMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-canvas)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    color: getMessageTypeColor(message.message_type)
                  }}>
                    {getMessageTypeIcon(message.message_type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {message.agent_name}
                      </span>
                      <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-muted)'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-primary)',
                      lineHeight: 'var(--line-height-normal)'
                    }}>
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 