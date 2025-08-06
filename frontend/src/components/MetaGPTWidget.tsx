import React, { useState, useEffect } from 'react';
import { metagptAPI } from '../services/api';

interface MetaGPTWidgetProps {
  onOpenMetaGPT: () => void;
}

export const MetaGPTWidget: React.FC<MetaGPTWidgetProps> = ({ onOpenMetaGPT }) => {
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentTasks();
  }, []);

  const loadRecentTasks = async () => {
    // COMPLETELY DISABLED to stop excessive API calls
    console.log('MetaGPTWidget: loadRecentTasks COMPLETELY DISABLED');
    return;
    
    // try {
    //   setLoading(true);
    //   const response = await metagptAPI.getTasks();
    //   if (response.success && response.tasks) {
    //     setRecentTasks(response.tasks.slice(0, 3)); // Show last 3 tasks
    //   }
    // } catch (err) {
    //   console.error('Error loading recent tasks:', err);
    // } finally {
    //   setLoading(false);
    // }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--accent-success)';
      case 'in_progress': return 'var(--accent-warning)';
      case 'failed': return 'var(--accent-error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      width: '100%',
      maxWidth: '400px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>MetaGPT</h3>
        </div>
        <button
          onClick={onOpenMetaGPT}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Open
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => onOpenMetaGPT()}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-canvas)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🚀</span>
            Create Project
          </button>
          <button
            onClick={() => onOpenMetaGPT()}
            style={{
              flex: 1,
              padding: 'var(--space-2)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-canvas)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            Run Task
          </button>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Recent Tasks
        </h4>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3)', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No recent tasks
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {recentTasks.map(task => (
              <div
                key={task.id}
                style={{
                  padding: 'var(--space-2)',
                  background: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onOpenMetaGPT()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(2px)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'var(--bg-canvas)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>
                    {getStatusIcon(task.status)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {task.title}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {task.description}
                    </div>
                  </div>
                  <span style={{
                    padding: '1px 4px',
                    background: getStatusColor(task.status),
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--font-size-xs)',
                    textTransform: 'capitalize'
                  }}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'var(--space-3)',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--border-primary)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Press ⌘5 to open MetaGPT
      </div>
    </div>
  );
}; 