import React, { useState, useEffect, useCallback } from 'react';
import websocketService, { 
  AgentStatus, 
  WorkflowUpdate, 
  AgentMessage, 
  FileGenerated, 
  WorkflowCompleted 
} from '../services/websocket';

interface RealTimeCollaborationProps {
  workflowId?: string;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({ workflowId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowUpdate[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [files, setFiles] = useState<FileGenerated[]>([]);
  const [completedWorkflows, setCompletedWorkflows] = useState<WorkflowCompleted[]>([]);

  useEffect(() => {
    // WebSocket event listeners
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    const handleCurrentState = (data: any) => {
      setAgentStatuses(data.agent_status || []);
      setWorkflowProgress(data.workflow_progress || []);
    };

    const handleAgentStatusUpdate = (data: any) => {
      setAgentStatuses(prev => {
        const index = prev.findIndex(agent => agent.agent_id === data.agent.agent_id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data.agent;
          return updated;
        } else {
          return [...prev, data.agent];
        }
      });
    };

    const handleWorkflowProgressUpdate = (data: any) => {
      setWorkflowProgress(prev => {
        const index = prev.findIndex(wf => wf.workflow_id === data.workflow.workflow_id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data.workflow;
          return updated;
        } else {
          return [...prev, data.workflow];
        }
      });
    };

    const handleAgentMessage = (data: any) => {
      setMessages(prev => [...prev.slice(-49), data]); // Keep last 50 messages
    };

    const handleFileGenerated = (data: any) => {
      setFiles(prev => [...prev, data]);
    };

    const handleWorkflowCompleted = (data: any) => {
      setCompletedWorkflows(prev => [...prev, data]);
    };

    // Register event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('current_state', handleCurrentState);
    websocketService.on('agent_status_update', handleAgentStatusUpdate);
    websocketService.on('workflow_progress_update', handleWorkflowProgressUpdate);
    websocketService.on('agent_message', handleAgentMessage);
    websocketService.on('file_generated', handleFileGenerated);
    websocketService.on('workflow_completed', handleWorkflowCompleted);

    // Cleanup
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('current_state', handleCurrentState);
      websocketService.off('agent_status_update', handleAgentStatusUpdate);
      websocketService.off('workflow_progress_update', handleWorkflowProgressUpdate);
      websocketService.off('agent_message', handleAgentMessage);
      websocketService.off('file_generated', handleFileGenerated);
      websocketService.off('workflow_completed', handleWorkflowCompleted);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'working': return 'text-blue-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2 p-3 bg-slate-800 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-slate-300">
          {isConnected ? 'Connected' : 'Disconnected'} to AI Agents
        </span>
      </div>

      {/* Agent Status */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">AI Agent Status</h3>
        <div className="space-y-3">
          {agentStatuses.map((agent) => (
            <div key={agent.agent_id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-300">
                      {agent.agent_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200">{agent.agent_name}</h4>
                    <p className="text-sm text-slate-400">{agent.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              
              <div className="mb-2">
                <p className="text-sm text-slate-300 mb-1">{agent.current_task}</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(agent.progress)}`}
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{agent.progress}% complete</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Progress */}
      {workflowProgress.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Workflow Progress</h3>
          {workflowProgress.map((workflow) => (
            <div key={workflow.workflow_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">{workflow.workflow_name}</h4>
                <span className={`text-sm font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(workflow.current_step / workflow.total_steps) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400">
                Step {workflow.current_step} of {workflow.total_steps}
                {workflow.current_agent && ` - ${workflow.current_agent}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Messages */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Recent Messages</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {messages.slice(-10).map((message, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-slate-300">
                  {message.agent_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-200">{message.agent_name}</span>
                  <span className={`text-xs ${getMessageTypeColor(message.message_type)}`}>
                    {message.message_type}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{message.message}</p>
                <p className="text-xs text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Files */}
      {files.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Generated Files</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {files.slice(-5).map((file, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{file.filename}</p>
                  <p className="text-xs text-slate-400">{file.agent_name} • {file.file_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Workflows */}
      {completedWorkflows.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Completed Workflows</h3>
          <div className="space-y-2">
            {completedWorkflows.slice(-3).map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-200">{workflow.workflow_name}</p>
                  <p className="text-xs text-slate-400">
                    {workflow.total_files} files • {workflow.total_agents} agents
                  </p>
                </div>
                <span className="text-xs text-green-500">✓ Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeCollaboration; 