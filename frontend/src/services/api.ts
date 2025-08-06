// API Service for Sumeru AI Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// API interfaces
export interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  timestamp?: number;
  avatar: string;
  message_type: 'user' | 'assistant' | 'system';
  is_working?: boolean;
  thinkingSteps?: ThinkingStep[];
  isThinkingExpanded?: boolean;
  model?: string;
}

export interface ThinkingStep {
  step: string;
  status: 'pending' | 'working' | 'completed' | 'error';
}

export interface ChatResponse {
  success: boolean;
  message: string;
  model?: string;
  thinkingSteps?: ThinkingStep[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  active: boolean;
  is_thinking: boolean;
  steps_remaining: number;
}

export interface FileItem {
  name: string;
  type: string;
  icon: string;
  content?: string;
  path?: string;
  isGenerated?: boolean;
}

export interface Credits {
  daily: Record<string, number>;
  total: Record<string, number>;
}

// API functions
export const chatAPI = {
  async getMessages(): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(messageData: ChatMessage): Promise<ChatResponse> {
    try {
      console.log('API: Sending message data:', messageData);
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      console.log('API: Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Response not ok:', errorText);
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      console.log('API: Response data:', data);
      return {
        success: data.success || true,
        message: data.response || data.message || 'Message sent successfully',
        model: data.model_used || data.model,
        thinkingSteps: data.thinkingSteps
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message'
      };
    }
  }
};

// Team API
export const teamAPI = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/team`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },
};

// Files API
export const filesAPI = {
  async getFiles(): Promise<FileItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/files`);
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
  },

  async getFileContent(filename: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/files/${filename}`);
    if (!response.ok) throw new Error('Failed to fetch file content');
    return response.text();
  },

  async createFile(fileData: { name: string; content: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileData),
    });
    if (!response.ok) throw new Error('Failed to create file');
  },

  async updateFile(filename: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/files/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to update file');
  },

  async deleteFile(filename: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/files/${filename}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
  },
};

// Credits API
export const creditsAPI = {
  async getCredits(): Promise<Credits> {
    const response = await fetch(`${API_BASE_URL}/api/credits`);
    if (!response.ok) throw new Error('Failed to fetch credits');
    return response.json();
  },

  async getQuotas(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/api/quotas`);
    if (!response.ok) throw new Error('Failed to fetch quotas');
    return response.json();
  },
};

// Model API
export const modelAPI = {
  async getCurrentModel(): Promise<{ provider: string; model: string }> {
    const response = await fetch(`${API_BASE_URL}/api/model`);
    if (!response.ok) throw new Error('Failed to fetch current model');
    const data = await response.json();
    // Handle the case where backend returns provider_code instead of provider
    return {
      provider: data.provider_code || data.provider,
      model: data.model
    };
  },

  async changeModel(provider: string, model: string): Promise<void> {
    console.log(`API: Changing model to ${provider}/${model}`);
    const response = await fetch(`${API_BASE_URL}/api/model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Model change failed:', errorText);
      throw new Error('Failed to change model');
    }
    const result = await response.json();
    console.log('API: Model change result:', result);
  },



  async getAvailableModels(): Promise<Record<string, string[]>> {
    const response = await fetch(`${API_BASE_URL}/api/models/available`);
    if (!response.ok) throw new Error('Failed to fetch available models');
    return response.json();
  },

  async getAvailableModelsWithQuota(): Promise<{
    success: boolean;
    available_models: any[];
    exhausted_models: any[];
    current_model: { provider: string; model: string };
  }> {
    const response = await fetch(`${API_BASE_URL}/api/models/available-with-quota`);
    if (!response.ok) throw new Error('Failed to fetch models with quota');
    return response.json();
  },

  async autoSwitchModel(): Promise<{
    status: string;
    message: string;
    provider: string;
    model: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/model/auto-switch`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to auto-switch model');
    return response.json();
  },
};

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  connect(onMessage: (data: any) => void, onError?: (error: any) => void) {
    try {
      this.ws = new WebSocket('ws://localhost:8001/ws');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
          
          // Handle specific message types
          if (data.type && this.messageHandlers.has(data.type)) {
            this.messageHandlers.get(data.type)!(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(onMessage, onError);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      if (onError) onError(error);
    }
  }

  // Add message handler for specific types
  onMessageType(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Remove message handler
  offMessageType(type: string) {
    this.messageHandlers.delete(type);
  }

  private attemptReconnect(onMessage: (data: any) => void, onError?: (error: any) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(onMessage, onError);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Subscribe to agent updates
  subscribeToAgentUpdates(agentRole: string) {
    this.send({
      type: 'subscribe',
      channel: 'agent_updates',
      agent_role: agentRole
    });
  }

  // Subscribe to task updates
  subscribeToTaskUpdates(taskId: string) {
    this.send({
      type: 'subscribe',
      channel: 'task_updates',
      task_id: taskId
    });
  }
}

// MetaGPT API
export const metagptAPI = {
  async getAgents(): Promise<{ success: boolean; agents?: any[]; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/agents`);
    if (!response.ok) throw new Error('Failed to fetch MetaGPT agents');
    return response.json();
  },

  async createProject(requirements: string, projectName?: string, projectType?: string): Promise<{ success: boolean; error?: string; [key: string]: any }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/create-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements, project_name: projectName, project_type: projectType }),
    });
    if (!response.ok) throw new Error('Failed to create MetaGPT project');
    return response.json();
  },

  async runAgentTask(agentName: string, taskDescription: string): Promise<{ success: boolean; error?: string; [key: string]: any }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/run-agent-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_name: agentName, task_description: taskDescription }),
    });
    if (!response.ok) throw new Error('Failed to run MetaGPT agent task');
    return response.json();
  },

  async getTasks(): Promise<{ success: boolean; tasks?: any[]; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/tasks`);
    if (!response.ok) throw new Error('Failed to fetch MetaGPT tasks');
    return response.json();
  },

  async getTask(taskId: string): Promise<{ success: boolean; task?: any; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/tasks/${taskId}`);
    if (!response.ok) throw new Error('Failed to fetch MetaGPT task');
    return response.json();
  },

  // New real-time endpoints
  async getActiveAgents(): Promise<{ success: boolean; active_agents?: any; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/active-agents`);
    if (!response.ok) throw new Error('Failed to fetch active agents');
    return response.json();
  },

  async getAgentProgress(agentRole: string): Promise<{ success: boolean; progress?: any; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-progress/${agentRole}`);
    if (!response.ok) throw new Error('Failed to fetch agent progress');
    return response.json();
  },

  async getAgentMessages(limit: number = 50): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-messages?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch agent messages');
    return response.json();
  },

  async stopAgentTask(agentRole: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/stop-agent/${agentRole}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to stop agent task');
    return response.json();
  },

  async getAgentFiles(taskId?: string): Promise<{ success: boolean; files?: any[]; error?: string }> {
    const url = taskId 
      ? `${API_BASE_URL}/api/metagpt/agent-files?task_id=${taskId}`
      : `${API_BASE_URL}/api/metagpt/agent-files`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch agent files');
    return response.json();
  },

  async getTaskResults(taskId: string): Promise<{ success: boolean; task?: any; files?: any[]; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/task-results/${taskId}`);
    if (!response.ok) throw new Error('Failed to fetch task results');
    return response.json();
  },
};

// Agent collaboration APIs
export const getAgentConversations = async (limit: number = 50) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-conversations?limit=${limit}`);
  return response.json();
};

export const addAgentConversation = async (fromAgent: string, toAgent: string, message: string, conversationType: string = "collaboration") => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_agent: fromAgent,
      to_agent: toAgent,
      message,
      conversation_type: conversationType
    }),
  });
  return response.json();
};

export const setAgentDependency = async (agentRole: string, dependsOn: string[]) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/set-dependency`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_role: agentRole,
      depends_on: dependsOn
    }),
  });
  return response.json();
};

// ===== COLLABORATIVE WORKFLOW API FUNCTIONS =====

export const getAvailableWorkflows = async () => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/available-workflows`);
  return response.json();
};

export const createWorkflow = async (name: string, description: string, agentSequence: string[]) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/create-workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      agent_sequence: agentSequence
    }),
  });
  return response.json();
};

export const startWorkflow = async (workflowId: string, initialRequirements: string) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/start-workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      initial_requirements: initialRequirements
    }),
  });
  return response.json();
};

export const continueWorkflow = async (workflowId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/continue-workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: workflowId
    }),
  });
  return response.json();
};

export const getWorkflowStatus = async (workflowId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/workflow-status/${workflowId}`);
  return response.json();
};

// ===== CHAT API FUNCTIONS =====

export const sendMessage = async (message: string, files: File[] = [], agentName?: string, agentRole?: string): Promise<{ success: boolean; message?: string; error?: string; agent_name?: string; agent_role?: string }> => {
  try {
    // Use JSON for simple messages, FormData for files
    if (files.length === 0) {
      // JSON request for text-only messages
      const jsonData = {
        message: message,
        sender: 'User',
        avatar: '👤',
        is_working: false,
        message_type: 'user',
        steps_remaining: 0,
        is_error: false,
        agent_name: agentName,
        agent_role: agentRole || 'Assistant'
      };

      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { 
        message?: string; 
        response?: string; 
        agent_name?: string; 
        agent_role?: string;
        success?: boolean;
        error?: string;
      };
      
      return { 
        success: data.success !== false, 
        message: data.message || data.response || 'Message sent successfully',
        agent_name: data.agent_name,
        agent_role: data.agent_role,
        error: data.error
      };
    } else {
      // FormData for messages with files
      const formData = new FormData();
      formData.append('sender', 'User');
      formData.append('message', message);
      formData.append('avatar', '👤');
      formData.append('is_working', 'false');
      formData.append('message_type', 'user');
      formData.append('steps_remaining', '0');
      formData.append('is_error', 'false');
      
      // Add agent information if provided
      if (agentName) {
        formData.append('agent_name', agentName);
      }
      if (agentRole) {
        formData.append('agent_role', agentRole);
      }
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { 
        message?: string; 
        response?: string; 
        agent_name?: string; 
        agent_role?: string;
        success?: boolean;
        error?: string;
      };
      
      return { 
        success: data.success !== false, 
        message: data.message || data.response || 'Message sent successfully',
        agent_name: data.agent_name,
        agent_role: data.agent_role,
        error: data.error
      };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
};

export const getChatHistory = async (): Promise<{ success: boolean; messages?: Record<string, unknown>[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/messages`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as { messages?: Record<string, unknown>[] } | Record<string, unknown>[];
    const messages = 'messages' in data ? data.messages : Array.isArray(data) ? data : [];
    return { success: true, messages };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch chat history' 
    };
  }
};

export const getActiveProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/api/projects/active`);
  return response.json();
};

// ===== PROJECT-SPECIFIC CHAT FUNCTIONS =====

export const getProjectChatHistory = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/project/${projectId}/history`);
  return response.json();
};

export const sendProjectMessage = async (projectId: string, message: string, files: File[] = []) => {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('project_id', projectId);
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/chat/project/${projectId}/send`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const getProjectAgentOutputs = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/agent-outputs`);
  return response.json();
};

export const getAgentDependencies = async (agentRole: string) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-dependencies/${agentRole}`);
  return response.json();
};

export const getAgentProfile = async (agentRole: string) => {
  const response = await fetch(`${API_BASE_URL}/api/metagpt/agent-profile/${agentRole}`);
  return response.json();
};

export const getAgentAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
};

export const getPerformanceInsights = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/performance-insights`);
    if (!response.ok) {
      throw new Error('Failed to fetch performance insights');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance insights:', error);
    return { success: false, error: 'Failed to fetch performance insights' };
  }
};

export const getTaskHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metagpt/task-history`);
    if (!response.ok) {
      throw new Error('Failed to fetch task history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching task history:', error);
    return { success: false, error: 'Failed to fetch task history' };
  }
};

export const wsService = new WebSocketService();