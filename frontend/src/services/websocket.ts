/**
 * WebSocket Service for Real-Time AI Agent Collaboration
 * 
 * This service handles real-time communication with the backend
 * to receive live updates from AI agents during project creation.
 */

export interface AgentStatus {
  agent_id: string;
  agent_name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  current_task: string;
  progress: number;
  estimated_completion?: string;
  last_update: string;
}

export interface WorkflowUpdate {
  workflow_id: string;
  workflow_name: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  current_step: number;
  total_steps: number;
  completed_steps: string[];
  pending_steps: string[];
  current_agent?: string;
  estimated_completion?: string;
  last_update: string;
}

export interface AgentMessage {
  agent_id: string;
  agent_name: string;
  role: string;
  message: string;
  message_type: 'start' | 'progress' | 'complete' | 'error';
  timestamp: string;
}

export interface FileGenerated {
  agent_id: string;
  agent_name: string;
  role: string;
  filename: string;
  file_path: string;
  file_type: string;
  timestamp: string;
}

export interface WorkflowCompleted {
  workflow_id: string;
  workflow_name: string;
  total_files: number;
  total_agents: number;
  timestamp: string;
}

export type WebSocketMessage = 
  | { type: 'current_state'; agent_status: AgentStatus[]; workflow_progress: WorkflowUpdate[]; timestamp: string }
  | { type: 'agent_status_update'; agent: AgentStatus; timestamp: string }
  | { type: 'workflow_progress_update'; workflow: WorkflowUpdate; timestamp: string }
  | { type: 'agent_message'; agent_id: string; agent_name: string; role: string; message: string; message_type: string; timestamp: string }
  | { type: 'file_generated'; agent_id: string; agent_name: string; role: string; filename: string; file_path: string; file_type: string; timestamp: string }
  | { type: 'workflow_completed'; workflow_id: string; workflow_name: string; total_files: number; total_agents: number; timestamp: string }
  | { type: 'pong'; timestamp: string };

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = `ws://localhost:8001/ws`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected', {});
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed', {});
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'current_state':
        this.emit('current_state', message);
        break;
      case 'agent_status_update':
        this.emit('agent_status_update', message);
        break;
      case 'workflow_progress_update':
        this.emit('workflow_progress_update', message);
        break;
      case 'agent_message':
        this.emit('agent_message', message);
        break;
      case 'file_generated':
        this.emit('file_generated', message);
        break;
      case 'workflow_completed':
        this.emit('workflow_completed', message);
        break;
      case 'pong':
        this.emit('pong', message);
        break;
      default:
        console.warn('Unknown message type:', message);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  public send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  public ping() {
    this.send({ type: 'ping' });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService();

// Auto-reconnect on page visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !websocketService.isConnected()) {
    websocketService.connect();
  }
});

export default websocketService; 