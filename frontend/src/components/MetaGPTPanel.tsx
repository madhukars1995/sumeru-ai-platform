import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { metagptAPI } from '../services/api';
import { useSmartPolling } from '../utils/smartPollingManager';
import { config } from '../config/environment';

interface MetaGPTAgent {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  is_available: boolean;
  status?: string;
  current_task?: string;
  progress?: number;
}

interface MetaGPTTask {
  id: string;
  agent_role: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: string;
}

interface MetaGPTPanelProps {
  selectedAgent?: string | null;
}

export const MetaGPTPanel: React.FC<MetaGPTPanelProps> = ({ selectedAgent }) => {
  const [agents, setAgents] = useState<MetaGPTAgent[]>([]);
  const [tasks, setTasks] = useState<MetaGPTTask[]>([]);
  const [activeAgents, setActiveAgents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const { registerJob } = useSmartPolling();
  const navigate = useNavigate();
  
  // Project creation state
  const [projectRequirements, setProjectRequirements] = useState('');
  const [projectName, setProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  
  // Agent task state
  const [selectedAgentState, setSelectedAgentState] = useState(selectedAgent || '');
  const [taskDescription, setTaskDescription] = useState('');
  const [runningTask, setRunningTask] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  
  // Active tab
  const [activeTab, setActiveTab] = useState<'create-project' | 'run-task'>('create-project');

  const projectTypes = [
    {
      id: 'standard',
      name: 'Standard Project',
      description: 'Complete project development workflow',
      icon: '🚀',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    },
    {
      id: 'fullstack',
      name: 'Full-Stack Project',
      description: 'Complete full-stack development workflow (includes UI/UX, Data Science, DevOps)',
      icon: '💻',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    },
    {
      id: 'datascience',
      name: 'Data Science Project',
      description: 'Data science focused workflow with ML and analytics',
      icon: '📊',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    },
    {
      id: 'webapp',
      name: 'Web Application',
      description: 'Modern web application with responsive design',
      icon: '🌐',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      icon: '📱',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    },
    {
      id: 'api',
      name: 'API Service',
      description: 'RESTful API with documentation',
      icon: '🔌',
      agents: ['Product Manager', 'Architect', 'Engineer', 'QA Engineer', 'Technical Writer']
    }
  ];

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await metagptAPI.getAgents();
      if (response.success) {
        setAgents(response.agents || []);
      } else {
        setError(response.error || 'Failed to load agents');
      }
    } catch (err) {
      setError('Failed to load agents');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await metagptAPI.getTasks();
      if (response.success) {
        setTasks(response.tasks || []);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadAgents();
    loadTasks();
  }, []);

  // Use smart polling for active agents
  useEffect(() => {
    const cleanup = registerJob('metagpt-agents', async () => {
      try {
        const response = await metagptAPI.getActiveAgents();
        if (response && response.active_agents) {
          setActiveAgents(response.active_agents);
        }
      } catch (error) {
        console.error('Failed to fetch active agents:', error);
      }
    }, config.ui.pollingIntervals.agents, 'medium');

    return cleanup;
  }, [registerJob]);

  const handleCreateProject = async () => {
    if (!projectRequirements.trim() || !selectedProjectType) {
      setError('Please select a project type and enter project requirements');
      return;
    }

    try {
      setCreatingProject(true);
      setProjectProgress(0);
      setError(null);
      
      const response = await metagptAPI.createProject(projectRequirements, projectName, selectedProjectType);
      
      if (response.success) {
        setProjectProgress(100);
        // Clear form
        setProjectRequirements('');
        setProjectName('');
        setSelectedProjectType('');
        
        // Reload tasks
        await loadTasks();
        
        // Show success message
        setTimeout(() => {
          setCreatingProject(false);
          setProjectProgress(0);
        }, 1000);
      } else {
        setError(response.error || 'Failed to create project');
        setCreatingProject(false);
        setProjectProgress(0);
      }
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
      setCreatingProject(false);
      setProjectProgress(0);
    }
  };

  const handleRunAgentTask = async () => {
    if (!selectedAgentState || !taskDescription.trim()) {
      setError('Please select an agent and enter a task description');
      return;
    }

    try {
      setRunningTask(true);
      setTaskProgress(0);
      setError(null);
      
      const response = await metagptAPI.runAgentTask(selectedAgentState, taskDescription);
      
      if (response.success) {
        setTaskProgress(100);
        // Clear form
        setTaskDescription('');
        setSelectedAgentState('');
        
        // Reload tasks
        await loadTasks();
        
        // Show success message
        setTimeout(() => {
          setRunningTask(false);
          setTaskProgress(0);
        }, 1000);
      } else {
        setError(response.error || 'Failed to run task');
        setRunningTask(false);
        setTaskProgress(0);
      }
    } catch (err) {
      setError('Failed to run task');
      console.error('Error running task:', err);
      setRunningTask(false);
      setTaskProgress(0);
    }
  };

  const handleNavigateToAgents = () => {
    navigate('/workflows');
  };

  const handleViewProjectFiles = () => {
    // Navigate to file manager to view project files
    navigate('/files');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  return (
    <div style={{ 
      width: '100%',
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>🤖 MetaGPT</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Multi-Agent AI Development Framework
          </div>
        </div>
        <button
          onClick={handleNavigateToAgents}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--accent)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            3 Agents Available
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        overflow: 'hidden'
      }}>
        {[
          { id: 'create-project', label: 'Create Project', icon: '🚀' },
          { id: 'run-task', label: 'Run Task', icon: '⚡' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'create-project' | 'run-task')}
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--duration-normal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <span style={{ fontSize: 'var(--font-size-lg)' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        {activeTab === 'create-project' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Create New Project</h3>
            
            {/* Project Type Selection */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Project Type
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                {projectTypes.map(projectType => (
                  <div
                    key={projectType.id}
                    onClick={() => setSelectedProjectType(projectType.id)}
                    style={{
                      padding: 'var(--space-4)',
                      border: `2px solid ${selectedProjectType === projectType.id ? 'var(--accent)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: selectedProjectType === projectType.id ? 'var(--accent-bg)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-normal)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProjectType !== projectType.id) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProjectType !== projectType.id) {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-card)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--font-size-xl)' }}>{projectType.icon}</span>
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{projectType.name}</span>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {projectType.description}
                    </p>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      Agents: {projectType.agents.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Project Requirements
              </label>
              <textarea
                value={projectRequirements}
                onChange={(e) => setProjectRequirements(e.target.value)}
                placeholder="Describe your project requirements in natural language..."
                rows={6}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  resize: 'vertical'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={handleCreateProject}
                disabled={creatingProject || !projectRequirements.trim() || !selectedProjectType}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: creatingProject ? 'var(--disabled-bg)' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: creatingProject ? 'not-allowed' : 'pointer',
                  opacity: creatingProject ? 0.6 : 1,
                  transition: 'all var(--duration-normal)'
                }}
              >
                {creatingProject ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Creating Project... ({projectProgress}%)
                  </div>
                ) : (
                  'Create Project'
                )}
              </button>

              <button
                onClick={handleViewProjectFiles}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                📁 View Files
              </button>
            </div>
          </div>
        )}

        {activeTab === 'run-task' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Run Agent Task</h3>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Select Agent
              </label>
              <select
                value={selectedAgentState}
                onChange={(e) => setSelectedAgentState(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.role} value={agent.role}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>
                Task Description
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the task you want the agent to perform..."
                rows={4}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  resize: 'vertical'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={handleRunAgentTask}
                disabled={runningTask || !selectedAgentState || !taskDescription.trim()}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: runningTask ? 'var(--disabled-bg)' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: runningTask ? 'not-allowed' : 'pointer',
                  opacity: runningTask ? 0.6 : 1,
                  transition: 'all var(--duration-normal)'
                }}
              >
                {runningTask ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Running Task... ({taskProgress}%)
                  </div>
                ) : (
                  'Run Task'
                )}
              </button>

              <button
                onClick={handleViewProjectFiles}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                📁 View Files
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}; 