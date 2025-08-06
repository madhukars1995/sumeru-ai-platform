// Core API Types
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

// Team and Agent Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isActive?: boolean;
  agentType?: string;
  capabilities?: string[];
  description?: string;
}

export interface AgentStatus {
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

export interface AgentMessage {
  id: string;
  timestamp: string;
  agent_role: string;
  agent_name: string;
  agent_avatar: string;
  message: string;
  message_type: string;
  is_agent: boolean;
}

// File Management Types
export interface FileItem {
  name: string;
  type: string;
  icon: string;
  content?: string;
  path?: string;
}

export interface AgentFile {
  id: string;
  name: string;
  type: string;
  content: string;
  task_id: string;
  created_at: string;
  icon: string;
}

// MetaGPT Types
export interface MetaGPTAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  is_active: boolean;
}

export interface MetaGPTTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  agent_role?: string;
  progress?: number;
}

// Analytics Types
export interface AnalyticsData {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  success_rate: number;
  average_duration: number;
  agent_performance: Record<string, number>;
}

export interface PerformanceInsights {
  recommendations: string[];
  bottlenecks: string[];
  optimizations: string[];
}

// Alert Types
export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: number;
}

export interface AlertThresholds {
  successRate: number;
  taskDuration: number;
  agentIdleTime: number;
  errorRate: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  message?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
} 