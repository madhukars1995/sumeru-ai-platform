"""
WebSocket Manager for Real-Time AI Agent Collaboration

This module provides real-time communication between AI agents and the frontend
for live progress tracking and collaboration updates.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
import uuid

# WebSocket connection management
active_connections: Set[Any] = set()
agent_status_updates: Dict[str, Dict[str, Any]] = {}
workflow_progress: Dict[str, Dict[str, Any]] = {}

@dataclass
class AgentStatus:
    agent_id: str
    agent_name: str
    role: str
    status: str  # idle, working, completed, error
    current_task: str
    progress: int  # 0-100
    estimated_completion: Optional[str] = None
    last_update: str = None
    
    def __post_init__(self):
        if self.last_update is None:
            self.last_update = datetime.now().isoformat()

@dataclass
class WorkflowUpdate:
    workflow_id: str
    workflow_name: str
    status: str  # created, running, completed, failed
    current_step: int
    total_steps: int
    completed_steps: List[str]
    pending_steps: List[str]
    current_agent: Optional[str] = None
    estimated_completion: Optional[str] = None
    last_update: str = None
    
    def __post_init__(self):
        if self.last_update is None:
            self.last_update = datetime.now().isoformat()

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[Any] = set()
        self.agent_status_updates: Dict[str, AgentStatus] = {}
        self.workflow_progress: Dict[str, WorkflowUpdate] = {}
        self.logger = logging.getLogger(__name__)
        
    async def connect(self, websocket):
        """Add new WebSocket connection"""
        self.active_connections.add(websocket)
        self.logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")
        
        # Send current state to new connection
        await self.send_current_state(websocket)
        
    async def disconnect(self, websocket):
        """Remove WebSocket connection"""
        self.active_connections.discard(websocket)
        self.logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
            
        message_str = json.dumps(message)
        disconnected = set()
        
        for websocket in self.active_connections:
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                self.logger.error(f"Error sending message: {e}")
                disconnected.add(websocket)
                
        # Remove disconnected websockets
        for websocket in disconnected:
            self.active_connections.discard(websocket)
            
    async def send_current_state(self, websocket):
        """Send current state to a specific connection"""
        state = {
            "type": "current_state",
            "agent_status": [asdict(status) for status in self.agent_status_updates.values()],
            "workflow_progress": [asdict(progress) for progress in self.workflow_progress.values()],
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            await websocket.send_text(json.dumps(state))
        except Exception as e:
            self.logger.error(f"Error sending current state: {e}")
            
    async def update_agent_status(self, agent_id: str, agent_name: str, role: str, 
                                status: str, current_task: str, progress: int, 
                                estimated_completion: Optional[str] = None):
        """Update agent status and broadcast to all clients"""
        agent_status = AgentStatus(
            agent_id=agent_id,
            agent_name=agent_name,
            role=role,
            status=status,
            current_task=current_task,
            progress=progress,
            estimated_completion=estimated_completion
        )
        
        self.agent_status_updates[agent_id] = agent_status
        
        message = {
            "type": "agent_status_update",
            "agent": asdict(agent_status),
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
        self.logger.info(f"Agent {agent_name} ({role}) status: {status} - {current_task} ({progress}%)")
        
    async def update_workflow_progress(self, workflow_id: str, workflow_name: str,
                                     status: str, current_step: int, total_steps: int,
                                     completed_steps: List[str], pending_steps: List[str],
                                     current_agent: Optional[str] = None,
                                     estimated_completion: Optional[str] = None):
        """Update workflow progress and broadcast to all clients"""
        workflow_update = WorkflowUpdate(
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            status=status,
            current_step=current_step,
            total_steps=total_steps,
            completed_steps=completed_steps,
            pending_steps=pending_steps,
            current_agent=current_agent,
            estimated_completion=estimated_completion
        )
        
        self.workflow_progress[workflow_id] = workflow_update
        
        message = {
            "type": "workflow_progress_update",
            "workflow": asdict(workflow_update),
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
        self.logger.info(f"Workflow {workflow_name} progress: {current_step}/{total_steps} ({status})")
        
    async def send_agent_message(self, agent_id: str, agent_name: str, role: str,
                               message: str, message_type: str = "progress"):
        """Send agent message to all clients"""
        message_data = {
            "type": "agent_message",
            "agent_id": agent_id,
            "agent_name": agent_name,
            "role": role,
            "message": message,
            "message_type": message_type,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message_data)
        self.logger.info(f"Agent {agent_name} ({role}): {message}")
        
    async def send_file_generated(self, agent_id: str, agent_name: str, role: str,
                                filename: str, file_path: str, file_type: str):
        """Send file generation notification to all clients"""
        file_data = {
            "type": "file_generated",
            "agent_id": agent_id,
            "agent_name": agent_name,
            "role": role,
            "filename": filename,
            "file_path": file_path,
            "file_type": file_type,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(file_data)
        self.logger.info(f"Agent {agent_name} ({role}) generated: {filename}")
        
    async def send_workflow_completed(self, workflow_id: str, workflow_name: str,
                                    total_files: int, total_agents: int):
        """Send workflow completion notification"""
        completion_data = {
            "type": "workflow_completed",
            "workflow_id": workflow_id,
            "workflow_name": workflow_name,
            "total_files": total_files,
            "total_agents": total_agents,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(completion_data)
        self.logger.info(f"Workflow {workflow_name} completed with {total_files} files from {total_agents} agents")
        
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
        
    def get_agent_status(self, agent_id: str) -> Optional[AgentStatus]:
        """Get current status of an agent"""
        return self.agent_status_updates.get(agent_id)
        
    def get_workflow_progress(self, workflow_id: str) -> Optional[WorkflowUpdate]:
        """Get current progress of a workflow"""
        return self.workflow_progress.get(workflow_id)

# Global WebSocket manager instance
websocket_manager = WebSocketManager() 