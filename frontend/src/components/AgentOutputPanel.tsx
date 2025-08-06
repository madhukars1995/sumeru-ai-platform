import React, { useState, useEffect } from 'react';
import { metagptAPI } from '../services/api';
import { usePollingManager } from '../utils/pollingManager';
import { config } from '../config/environment';

interface AgentFile {
  id: string;
  name: string;
  type: string;
  content: string;
  task_id: string;
  created_at: string;
  icon: string;
}

interface TaskResult {
  task: any;
  files: AgentFile[];
}

export const AgentOutputPanel: React.FC = () => {
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskResults, setTaskResults] = useState<TaskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { registerJob } = usePollingManager();

  const loadAgentFiles = async () => {
    // COMPLETELY DISABLED to stop excessive API calls
    console.log('AgentOutputPanel: loadAgentFiles COMPLETELY DISABLED');
    return;
    
    // try {
    //   const response = await metagptAPI.getAgentFiles();
    //   if (response.success && response.files) {
    //     setAgentFiles(response.files);
    //   }
    // } catch (error) {
    //   console.error('Error loading agent files:', error);
    // }
  };

  // Use centralized polling manager for agent files
  useEffect(() => {
    // COMPLETELY DISABLED to stop excessive API calls
    console.log('AgentOutputPanel polling COMPLETELY DISABLED');
    // const cleanup = registerJob('agent-output-files', loadAgentFiles, config.ui.pollingIntervals.files);
    // return cleanup;
  }, [registerJob]);

  const loadTaskResults = async (taskId: string) => {
    // COMPLETELY DISABLED to stop excessive API calls
    console.log('AgentOutputPanel: loadTaskResults COMPLETELY DISABLED');
    return;
    
    // try {
    //   setLoading(true);
    //   const response = await metagptAPI.getTaskResults(taskId);
    //   if (response.success) {
    //     setTaskResults({
    //       task: response.task,
    //       files: response.files || []
    //     });
    //     setSelectedTask(taskId);
    //   }
    // } catch (error) {
    //   console.error('Error loading task results:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const getFileIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      'markdown': '📝',
      'python': '🐍',
      'json': '📄',
      'yaml': '⚙️',
      'terraform': '🏗️',
      'jupyter': '📊',
      'image': '🖼️',
      'pdf': '📋',
      'text': '📄'
    };
    return icons[fileType] || '📄';
  };

  const formatContent = (content: string, fileType: string) => {
    if (fileType === 'json') {
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch {
        return content;
      }
    }
    return content;
  };

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
          🤖 Agent Outputs
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)'
        }}>
          <span>Files: {agentFiles.length}</span>
          <span>•</span>
          <span>Tasks: {new Set(agentFiles.map(f => f.task_id)).size}</span>
        </div>
      </div>

      {/* Task Selection */}
      <div>
        <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-lg)' }}>
          📋 Recent Tasks
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)'
        }}>
          {Array.from(new Set(agentFiles.map(f => f.task_id))).map(taskId => (
            <button
              key={taskId}
              onClick={() => loadTaskResults(taskId)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: selectedTask === taskId ? 'var(--accent)' : 'var(--bg-card)',
                color: selectedTask === taskId ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              Task {taskId.split('_').pop()}
            </button>
          ))}
        </div>
      </div>

      {/* Task Results */}
      {taskResults && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)'
        }}>
          <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-lg)' }}>
            📊 Task Results
          </h3>
          
          {/* Task Info */}
          <div style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)'
          }}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Task:</strong> {taskResults.task.title}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Description:</strong> {taskResults.task.description}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Status:</strong> {taskResults.task.status}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Progress:</strong> {taskResults.task.progress}%
            </div>
            {taskResults.task.result && (
              <div>
                <strong>Result:</strong>
                <pre style={{
                  background: 'var(--bg-canvas)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  whiteSpace: 'pre-wrap',
                  marginTop: 'var(--space-1)'
                }}>
                  {taskResults.task.result}
                </pre>
              </div>
            )}
          </div>

          {/* Generated Files */}
          <div>
            <h4 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-md)' }}>
              📁 Generated Files ({taskResults.files.length})
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--space-3)'
            }}>
              {taskResults.files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{file.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {file.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-muted)'
                      }}>
                        {file.type} • {new Date(file.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'var(--bg-rail)',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    maxHeight: '100px',
                    overflow: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {formatContent(file.content, file.type)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Files List */}
      {!taskResults && (
        <div>
          <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-lg)' }}>
            📁 All Agent Files
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}>
            {agentFiles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: 'var(--space-8)'
              }}>
                No agent files generated yet
              </div>
            ) : (
              agentFiles.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                  onClick={() => loadTaskResults(file.task_id)}
                >
                  <span style={{ fontSize: '1.5rem' }}>{file.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {file.name}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)'
                    }}>
                      Task {file.task_id.split('_').pop()} • {file.type} • {new Date(file.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)'
                  }}>
                    {file.content.length > 100 ? `${file.content.substring(0, 100)}...` : file.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 