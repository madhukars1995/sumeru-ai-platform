import React, { useState, useEffect } from 'react';
import { metagptAPI } from '../services/api';

interface AgentOutput {
  id: string;
  agent_name: string;
  agent_role: string;
  output_type: 'terminal' | 'preview' | 'file' | 'code';
  content: string;
  filename?: string;
  filepath?: string;
  timestamp: string;
  task_id?: string;
}

interface AgentOutputOrganizerProps {
  onFileSelect?: (file: AgentOutput) => void;
  onPreviewSelect?: (output: AgentOutput) => void;
}

export const AgentOutputOrganizer: React.FC<AgentOutputOrganizerProps> = ({
  onFileSelect,
  onPreviewSelect
}) => {
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'terminal' | 'preview' | 'file' | 'code'>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAgentOutputs();
  }, []);

  const loadAgentOutputs = async () => {
    // COMPLETELY DISABLED to stop excessive API calls
    console.log('AgentOutputOrganizer: loadAgentOutputs COMPLETELY DISABLED');
    return;
    
    // try {
    //   const response = await metagptAPI.getAgentFiles();
    //   if (response.success && response.files) {
    //     // Transform files into organized outputs
    //     const organizedOutputs: AgentOutput[] = response.files.map((file: any) => ({
    //       id: file.id || Math.random().toString(),
    //       agent_name: file.agent_name || 'Unknown Agent',
    //       agent_role: file.agent_role || 'Unknown Role',
    //       output_type: determineOutputType(file.filename || '', file.content || ''),
    //       content: file.content || '',
    //       filename: file.filename || '',
    //       filepath: file.filepath || '',
    //       timestamp: file.timestamp || new Date().toISOString(),
    //       task_id: file.task_id
    //     }));
    //     setOutputs(organizedOutputs);
    //   }
    // } catch (error) {
    //   console.error('Error loading agent outputs:', error);
    // }
  };

  const determineOutputType = (filename: string, content: string): 'terminal' | 'preview' | 'file' | 'code' => {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Terminal outputs
    if (lowerContent.includes('$ ') || lowerContent.includes('> ') || 
        lowerContent.includes('command') || lowerContent.includes('terminal')) {
      return 'terminal';
    }

    // Preview outputs (HTML, images, etc.)
    if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm') || 
        lowerContent.includes('<html') || lowerContent.includes('<div')) {
      return 'preview';
    }

    // Code files
    if (lowerFilename.endsWith('.js') || lowerFilename.endsWith('.ts') || 
        lowerFilename.endsWith('.py') || lowerFilename.endsWith('.java') ||
        lowerFilename.endsWith('.cpp') || lowerFilename.endsWith('.c') ||
        lowerFilename.endsWith('.go') || lowerFilename.endsWith('.rs')) {
      return 'code';
    }

    // Default to file
    return 'file';
  };

  const getOutputsByType = (type: 'all' | 'terminal' | 'preview' | 'file' | 'code') => {
    if (type === 'all') return outputs;
    return outputs.filter(output => output.output_type === type);
  };

  const getOutputsByAgent = () => {
    const agentGroups: Record<string, AgentOutput[]> = {};
    outputs.forEach(output => {
      if (!agentGroups[output.agent_name]) {
        agentGroups[output.agent_name] = [];
      }
      agentGroups[output.agent_name].push(output);
    });
    return agentGroups;
  };

  const toggleFolder = (agentName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(agentName)) {
      newExpanded.delete(agentName);
    } else {
      newExpanded.add(agentName);
    }
    setExpandedFolders(newExpanded);
  };

  const handleOutputClick = (output: AgentOutput) => {
    if (output.output_type === 'file' || output.output_type === 'code') {
      onFileSelect?.(output);
    } else if (output.output_type === 'preview') {
      onPreviewSelect?.(output);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'terminal': return '💻';
      case 'preview': return '👁️';
      case 'file': return '📄';
      case 'code': return '📝';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'terminal': return 'var(--accent-warning)';
      case 'preview': return 'var(--accent-success)';
      case 'file': return 'var(--accent)';
      case 'code': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  const filteredOutputs = getOutputsByType(selectedType);
  const agentGroups = getOutputsByAgent();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-canvas)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          margin: '0 0 var(--space-3) 0'
        }}>
          Agent Outputs
        </h2>
        
        {/* Type Filter */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap'
        }}>
          {(['all', 'terminal', 'preview', 'file', 'code'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: selectedType === type ? 'var(--accent)' : 'var(--bg-canvas)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: selectedType === type ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'all 0.2s ease'
              }}
            >
              {type === 'all' ? '📁 All' : `${getTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Output List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)'
      }}>
        {filteredOutputs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            padding: 'var(--space-8)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📁</div>
            <p>No agent outputs found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {Object.entries(agentGroups).map(([agentName, agentOutputs]) => {
              const filteredAgentOutputs = agentOutputs.filter(output => 
                selectedType === 'all' || output.output_type === selectedType
              );
              
              if (filteredAgentOutputs.length === 0) return null;

              return (
                <div key={agentName} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden'
                }}>
                  {/* Agent Header */}
                  <button
                    onClick={() => toggleFolder(agentName)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'var(--bg-subtle)',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-md)',
                      fontWeight: 'var(--font-weight-medium)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  >
                    <span>🤖 {agentName}</span>
                    <span style={{
                      transform: expandedFolders.has(agentName) ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      ▶️
                    </span>
                  </button>

                  {/* Agent Outputs */}
                  {expandedFolders.has(agentName) && (
                    <div style={{
                      padding: 'var(--space-2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}>
                      {filteredAgentOutputs.map(output => (
                        <div
                          key={output.id}
                          onClick={() => handleOutputClick(output)}
                          style={{
                            padding: 'var(--space-3)',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-canvas)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            fontSize: 'var(--font-size-lg)',
                            color: getTypeColor(output.output_type)
                          }}>
                            {getTypeIcon(output.output_type)}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--text-primary)',
                              marginBottom: 'var(--space-1)'
                            }}>
                              {output.filename || `${output.output_type} output`}
                            </div>
                            <div style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--text-muted)'
                            }}>
                              {new Date(output.timestamp).toLocaleTimeString()}
                            </div>
                          </div>

                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: getTypeColor(output.output_type),
                            fontWeight: 'var(--font-weight-medium)',
                            textTransform: 'uppercase'
                          }}>
                            {output.output_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 