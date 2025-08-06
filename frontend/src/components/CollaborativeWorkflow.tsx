import React, { useState, useEffect } from 'react';
import { getAvailableWorkflows, createWorkflow, startWorkflow, continueWorkflow, getWorkflowStatus } from '../services/api';

interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  status: string;
}

interface WorkflowStatus {
  workflow_id: string;
  name: string;
  status: string;
  current_step: number;
  total_steps: number;
  current_agent: string | null;
  completed_agents: string[];
  remaining_agents: string[];
  results: Record<string, any>;
}

export const CollaborativeWorkflow: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowStatus | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const agents = [
    { id: 'product_manager', name: 'Sarah Chen', role: 'Product Manager' },
    { id: 'architect', name: 'Marcus Rodriguez', role: 'Architect' },
    { id: 'engineer', name: 'Alex Thompson', role: 'Engineer' },
    { id: 'qa_engineer', name: 'Chris Lee', role: 'QA Engineer' },
    { id: 'technical_writer', name: 'Maria Garcia', role: 'Technical Writer' }
  ];

  const predefinedWorkflows = [
    {
      name: 'Standard Project',
      description: 'Complete project development workflow',
      agents: ['product_manager', 'architect', 'engineer', 'qa_engineer', 'technical_writer']
    },
    {
      name: 'Full-Stack Project',
      description: 'Complete full-stack development workflow (includes UI/UX, Data Science, DevOps)',
      agents: ['product_manager', 'architect', 'engineer', 'qa_engineer', 'technical_writer']
    },
    {
      name: 'Data Science Project',
      description: 'Data science focused workflow with ML and analytics',
      agents: ['product_manager', 'architect', 'engineer', 'qa_engineer', 'technical_writer']
    }
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await getAvailableWorkflows();
      if (response.success) {
        setWorkflows(response.workflows || []);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const createNewWorkflow = async (workflowType: string) => {
    if (!projectName.trim()) {
      setMessage('Please enter a project name');
      return;
    }

    setLoading(true);
    try {
      let workflowId = '';
      let response;
      
      switch (workflowType) {
        case 'standard':
          response = await fetch('http://127.0.0.1:8001/api/metagpt/create-standard-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_name: projectName })
          });
          break;
          
        case 'fullstack':
          response = await fetch('http://127.0.0.1:8001/api/metagpt/create-fullstack-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_name: projectName })
          });
          break;
          
        case 'datascience':
          response = await fetch('http://127.0.0.1:8001/api/metagpt/create-datascience-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_name: projectName })
          });
          break;
          
        default:
          setMessage('Invalid workflow type');
          setLoading(false);
          return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`Failed to create workflow: ${response.status} - ${errorText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.workflow_id) {
        workflowId = data.workflow_id;
        setSelectedWorkflow(workflowId);
        setMessage(`✅ Workflow created successfully: ${workflowId}`);
        await loadWorkflows();
      } else {
        setMessage(`Failed to create workflow: ${data.error || 'No workflow ID returned'}`);
      }
    } catch (error) {
      setMessage('Error creating workflow: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Error creating workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWorkflowExecution = async () => {
    if (!selectedWorkflow || !requirements.trim()) {
      setMessage('Please select a workflow and enter requirements');
      return;
    }

    setLoading(true);
    try {
      const response = await startWorkflow(selectedWorkflow, requirements);
      if (response.success) {
        setMessage('Workflow started successfully');
        await loadWorkflowStatus(selectedWorkflow);
      } else {
        setMessage(response.error || 'Failed to start workflow');
      }
    } catch (error) {
      setMessage('Error starting workflow');
      console.error('Error starting workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueWorkflowExecution = async () => {
    if (!selectedWorkflow) {
      setMessage('Please select a workflow');
      return;
    }

    setLoading(true);
    try {
      const response = await continueWorkflow(selectedWorkflow);
      if (response.success) {
        if (response.status === 'completed') {
          setMessage('Workflow completed successfully!');
        } else {
          setMessage('Workflow continued to next agent');
        }
        await loadWorkflowStatus(selectedWorkflow);
      } else {
        setMessage(response.error || 'Failed to continue workflow');
      }
    } catch (error) {
      setMessage('Error continuing workflow');
      console.error('Error continuing workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowStatus = async (workflowId: string) => {
    try {
      const response = await getWorkflowStatus(workflowId);
      if (response.success) {
        setActiveWorkflow(response);
      }
    } catch (error) {
      console.error('Error loading workflow status:', error);
    }
  };

  const getAgentDisplayName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.name} (${agent.role})` : agentId;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200">
          🤝 Collaborative Workflows
        </h2>
        <div className="text-sm text-slate-400">
          Multi-Agent Development Teams
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Workflow Creation */}
        <div className="w-1/2 border-r border-slate-700 p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Create New Workflow</h3>
          
          {/* Project Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name..."
            />
          </div>

          {/* Predefined Workflows */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Predefined Workflows</h4>
            <div className="space-y-2">
              {predefinedWorkflows.map((workflow, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-1">{workflow.name}</h5>
                  <p className="text-sm text-slate-400 mb-2">{workflow.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {workflow.agents.map(agentId => (
                      <span key={agentId} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {getAgentDisplayName(agentId)}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => createNewWorkflow(['standard', 'fullstack', 'datascience'][index])}
                    disabled={loading || !projectName.trim()}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    Create {workflow.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Requirements
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe your project requirements..."
            />
          </div>

          {/* Workflow Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Workflow
            </label>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a workflow...</option>
              {workflows.map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={startWorkflowExecution}
              disabled={loading || !selectedWorkflow || !requirements.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Start Workflow
            </button>
            <button
              onClick={continueWorkflowExecution}
              disabled={loading || !selectedWorkflow}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Continue Workflow
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className="mt-4 p-3 bg-slate-800 border border-slate-600 rounded-lg">
              <p className="text-sm text-slate-300">{message}</p>
            </div>
          )}
        </div>

        {/* Right Panel - Workflow Status */}
        <div className="w-1/2 p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Workflow Status</h3>
          
          {activeWorkflow ? (
            <div className="space-y-4">
              {/* Workflow Info */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h4 className="font-medium text-slate-200 mb-2">{activeWorkflow.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    activeWorkflow.status === 'completed' ? 'bg-green-600 text-white' :
                    activeWorkflow.status === 'running' ? 'bg-blue-600 text-white' :
                    'bg-slate-600 text-slate-200'
                  }`}>
                    {activeWorkflow.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-slate-200">{activeWorkflow.current_step + 1} / {activeWorkflow.total_steps}</span>
                </div>
              </div>

              {/* Current Agent */}
              {activeWorkflow.current_agent && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Current Agent</h5>
                  <p className="text-slate-300">{getAgentDisplayName(activeWorkflow.current_agent)}</p>
                </div>
              )}

              {/* Completed Agents */}
              {activeWorkflow.completed_agents.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Completed Agents</h5>
                  <div className="space-y-1">
                    {activeWorkflow.completed_agents.map(agentId => (
                      <div key={agentId} className="flex items-center text-sm">
                        <span className="text-green-400 mr-2">✓</span>
                        <span className="text-slate-300">{getAgentDisplayName(agentId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remaining Agents */}
              {activeWorkflow.remaining_agents.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Remaining Agents</h5>
                  <div className="space-y-1">
                    {activeWorkflow.remaining_agents.map(agentId => (
                      <div key={agentId} className="flex items-center text-sm">
                        <span className="text-slate-400 mr-2">○</span>
                        <span className="text-slate-300">{getAgentDisplayName(agentId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {Object.keys(activeWorkflow.results).length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h5 className="font-medium text-slate-200 mb-2">Agent Results</h5>
                  <div className="space-y-2">
                    {Object.entries(activeWorkflow.results).map(([agentId, result]) => (
                      <div key={agentId} className="text-sm">
                        <span className="text-slate-400">{getAgentDisplayName(agentId)}:</span>
                        <p className="text-slate-300 mt-1">{String(result)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p>No active workflow</p>
              <p className="text-sm mt-2">Create and start a workflow to see status here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 