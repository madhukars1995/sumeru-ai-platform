"""
Sequential Agent Execution System

This module implements sequential execution of AI agents in a collaborative workflow,
ensuring proper dependencies and handoffs between agents.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
import uuid

from websocket_manager import websocket_manager

@dataclass
class AgentStep:
    step_id: str
    agent_role: str
    agent_name: str
    task_description: str
    dependencies: List[str]
    status: str = "pending"  # pending, running, completed, failed
    result: Optional[str] = None
    files_generated: List[Dict[str, Any]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    estimated_duration: str = "2-4 hours"
    
    def __post_init__(self):
        if self.files_generated is None:
            self.files_generated = []

@dataclass
class SequentialWorkflow:
    workflow_id: str
    name: str
    description: str
    requirements: str
    steps: List[AgentStep]
    status: str = "created"  # created, running, completed, failed
    current_step_index: int = 0
    completed_steps: List[str] = None
    failed_steps: List[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    
    def __post_init__(self):
        if self.completed_steps is None:
            self.completed_steps = []
        if self.failed_steps is None:
            self.failed_steps = []

class SequentialAgentExecutor:
    def __init__(self):
        self.workflows: Dict[str, SequentialWorkflow] = {}
        self.agent_executors: Dict[str, Callable] = {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize agent executors
        self._initialize_agent_executors()
        
    def _initialize_agent_executors(self):
        """Initialize functions for each agent type"""
        self.agent_executors = {
            "product_manager": self._execute_product_manager,
            "architect": self._execute_architect,
            "engineer": self._execute_engineer,
            "qa_engineer": self._execute_qa_engineer,
            "technical_writer": self._execute_technical_writer
        }
        
    async def create_sequential_workflow(self, name: str, description: str, 
                                       requirements: str) -> str:
        """Create a new sequential workflow"""
        workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
        
        # Define the sequential steps
        steps = [
            AgentStep(
                step_id=f"step_1",
                agent_role="product_manager",
                agent_name="Sarah Chen",
                task_description="Define requirements and scope",
                dependencies=[],
                estimated_duration="2-3 hours"
            ),
            AgentStep(
                step_id=f"step_2",
                agent_role="architect",
                agent_name="Marcus Rodriguez",
                task_description="Design system architecture",
                dependencies=["step_1"],
                estimated_duration="4-6 hours"
            ),
            AgentStep(
                step_id=f"step_3",
                agent_role="engineer",
                agent_name="Alex Thompson",
                task_description="Implement core functionality",
                dependencies=["step_2"],
                estimated_duration="8-12 hours"
            ),
            AgentStep(
                step_id=f"step_4",
                agent_role="qa_engineer",
                agent_name="Chris Lee",
                task_description="Quality assurance testing",
                dependencies=["step_3"],
                estimated_duration="4-6 hours"
            ),
            AgentStep(
                step_id=f"step_5",
                agent_role="technical_writer",
                agent_name="Maria Garcia",
                task_description="Create documentation",
                dependencies=["step_4"],
                estimated_duration="2-3 hours"
            )
        ]
        
        workflow = SequentialWorkflow(
            workflow_id=workflow_id,
            name=name,
            description=description,
            requirements=requirements,
            steps=steps
        )
        
        self.workflows[workflow_id] = workflow
        
        # Notify WebSocket clients
        await websocket_manager.update_workflow_progress(
            workflow_id=workflow_id,
            workflow_name=name,
            status="created",
            current_step=0,
            total_steps=len(steps),
            completed_steps=[],
            pending_steps=[step.step_id for step in steps]
        )
        
        return workflow_id
        
    async def start_sequential_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Start executing a sequential workflow"""
        workflow = self.workflows.get(workflow_id)
        if not workflow:
            return {"success": False, "error": "Workflow not found"}
            
        workflow.status = "running"
        workflow.start_time = datetime.now().isoformat()
        
        # Notify WebSocket clients
        await websocket_manager.update_workflow_progress(
            workflow_id=workflow_id,
            workflow_name=workflow.name,
            status="running",
            current_step=0,
            total_steps=len(workflow.steps),
            completed_steps=[],
            pending_steps=[step.step_id for step in workflow.steps]
        )
        
        # Start execution in background
        asyncio.create_task(self._execute_workflow(workflow_id))
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "message": "Sequential workflow started"
        }
        
    async def _execute_workflow(self, workflow_id: str):
        """Execute the workflow steps sequentially"""
        workflow = self.workflows[workflow_id]
        
        try:
            for i, step in enumerate(workflow.steps):
                # Check dependencies
                if not await self._check_dependencies(workflow, step):
                    self.logger.warning(f"Dependencies not met for step {step.step_id}")
                    continue
                    
                # Update workflow progress
                workflow.current_step_index = i
                current_agent = f"{step.agent_name} ({step.agent_role})"
                
                await websocket_manager.update_workflow_progress(
                    workflow_id=workflow_id,
                    workflow_name=workflow.name,
                    status="running",
                    current_step=i + 1,
                    total_steps=len(workflow.steps),
                    completed_steps=workflow.completed_steps,
                    pending_steps=[s.step_id for s in workflow.steps[i:]],
                    current_agent=current_agent
                )
                
                # Execute the step
                await self._execute_step(workflow, step)
                
                # Mark as completed
                workflow.completed_steps.append(step.step_id)
                
            # Workflow completed
            workflow.status = "completed"
            workflow.end_time = datetime.now().isoformat()
            
            await websocket_manager.update_workflow_progress(
                workflow_id=workflow_id,
                workflow_name=workflow.name,
                status="completed",
                current_step=len(workflow.steps),
                total_steps=len(workflow.steps),
                completed_steps=workflow.completed_steps,
                pending_steps=[],
                current_agent=None
            )
            
            await websocket_manager.send_workflow_completed(
                workflow_id=workflow_id,
                workflow_name=workflow.name,
                total_files=sum(len(step.files_generated) for step in workflow.steps),
                total_agents=len(workflow.steps)
            )
            
        except Exception as e:
            self.logger.error(f"Error executing workflow {workflow_id}: {e}")
            workflow.status = "failed"
            await websocket_manager.update_workflow_progress(
                workflow_id=workflow_id,
                workflow_name=workflow.name,
                status="failed",
                current_step=workflow.current_step_index,
                total_steps=len(workflow.steps),
                completed_steps=workflow.completed_steps,
                pending_steps=[s.step_id for s in workflow.steps[workflow.current_step_index:]],
                current_agent=None
            )
            
    async def _check_dependencies(self, workflow: SequentialWorkflow, step: AgentStep) -> bool:
        """Check if all dependencies for a step are completed"""
        for dependency in step.dependencies:
            if dependency not in workflow.completed_steps:
                return False
        return True
        
    async def _execute_step(self, workflow: SequentialWorkflow, step: AgentStep):
        """Execute a single agent step"""
        step.status = "running"
        step.start_time = datetime.now().isoformat()
        
        # Update agent status
        await websocket_manager.update_agent_status(
            agent_id=step.step_id,
            agent_name=step.agent_name,
            role=step.agent_role,
            status="working",
            current_task=step.task_description,
            progress=0
        )
        
        # Send start message
        await websocket_manager.send_agent_message(
            agent_id=step.step_id,
            agent_name=step.agent_name,
            role=step.agent_role,
            message=f"Starting: {step.task_description}",
            message_type="start"
        )
        
        try:
            # Execute the agent
            executor = self.agent_executors.get(step.agent_role)
            if executor:
                result = await executor(workflow, step)
                step.result = result
                step.status = "completed"
            else:
                step.status = "failed"
                step.result = f"No executor found for agent role: {step.agent_role}"
                
        except Exception as e:
            step.status = "failed"
            step.result = f"Error: {str(e)}"
            self.logger.error(f"Error executing step {step.step_id}: {e}")
            
        step.end_time = datetime.now().isoformat()
        
        # Update final agent status
        await websocket_manager.update_agent_status(
            agent_id=step.step_id,
            agent_name=step.agent_name,
            role=step.agent_role,
            status=step.status,
            current_task=step.task_description,
            progress=100 if step.status == "completed" else 0
        )
        
        # Send completion message
        message_type = "complete" if step.status == "completed" else "error"
        await websocket_manager.send_agent_message(
            agent_id=step.step_id,
            agent_name=step.agent_name,
            role=step.agent_role,
            message=f"{'Completed' if step.status == 'completed' else 'Failed'}: {step.task_description}",
            message_type=message_type
        )
        
    async def _execute_product_manager(self, workflow: SequentialWorkflow, step: AgentStep) -> str:
        """Execute Product Manager agent"""
        # Simulate progress updates
        for i in range(5):
            await asyncio.sleep(1)
            progress = (i + 1) * 20
            await websocket_manager.update_agent_status(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                status="working",
                current_task=step.task_description,
                progress=progress
            )
            
            await websocket_manager.send_agent_message(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                message=f"Analyzing requirements... {progress}% complete",
                message_type="progress"
            )
            
        # Generate files
        files = [
            {"name": "product_requirements.md", "path": "docs/requirements.md", "type": "markdown"},
            {"name": "user_stories.md", "path": "docs/user_stories.md", "type": "markdown"}
        ]
        
        for file_info in files:
            step.files_generated.append(file_info)
            await websocket_manager.send_file_generated(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                filename=file_info["name"],
                file_path=file_info["path"],
                file_type=file_info["type"]
            )
            
        return "Requirements analysis completed with user stories and acceptance criteria"
        
    async def _execute_architect(self, workflow: SequentialWorkflow, step: AgentStep) -> str:
        """Execute Architect agent"""
        # Simulate progress updates
        for i in range(5):
            await asyncio.sleep(1)
            progress = (i + 1) * 20
            await websocket_manager.update_agent_status(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                status="working",
                current_task=step.task_description,
                progress=progress
            )
            
        # Generate files
        files = [
            {"name": "system_architecture.md", "path": "docs/architecture.md", "type": "markdown"},
            {"name": "api_specs.json", "path": "docs/api_specs.json", "type": "json"}
        ]
        
        for file_info in files:
            step.files_generated.append(file_info)
            await websocket_manager.send_file_generated(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                filename=file_info["name"],
                file_path=file_info["path"],
                file_type=file_info["type"]
            )
            
        return "System architecture designed with API specifications"
        
    async def _execute_engineer(self, workflow: SequentialWorkflow, step: AgentStep) -> str:
        """Execute Engineer agent"""
        # Simulate progress updates
        for i in range(8):
            await asyncio.sleep(1)
            progress = (i + 1) * 12
            await websocket_manager.update_agent_status(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                status="working",
                current_task=step.task_description,
                progress=progress
            )
            
        # Generate files
        files = [
            {"name": "main.py", "path": "src/main.py", "type": "python"},
            {"name": "package.json", "path": "package.json", "type": "json"},
            {"name": "requirements.txt", "path": "requirements.txt", "type": "text"}
        ]
        
        for file_info in files:
            step.files_generated.append(file_info)
            await websocket_manager.send_file_generated(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                filename=file_info["name"],
                file_path=file_info["path"],
                file_type=file_info["type"]
            )
            
        return "Core functionality implemented with main application and dependencies"
        
    async def _execute_qa_engineer(self, workflow: SequentialWorkflow, step: AgentStep) -> str:
        """Execute QA Engineer agent"""
        # Simulate progress updates
        for i in range(5):
            await asyncio.sleep(1)
            progress = (i + 1) * 20
            await websocket_manager.update_agent_status(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                status="working",
                current_task=step.task_description,
                progress=progress
            )
            
        # Generate files
        files = [
            {"name": "test_suite.py", "path": "tests/test_suite.py", "type": "python"},
            {"name": "test_report.md", "path": "docs/test_report.md", "type": "markdown"}
        ]
        
        for file_info in files:
            step.files_generated.append(file_info)
            await websocket_manager.send_file_generated(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                filename=file_info["name"],
                file_path=file_info["path"],
                file_type=file_info["type"]
            )
            
        return "Quality assurance testing completed with comprehensive test suite"
        
    async def _execute_technical_writer(self, workflow: SequentialWorkflow, step: AgentStep) -> str:
        """Execute Technical Writer agent"""
        # Simulate progress updates
        for i in range(3):
            await asyncio.sleep(1)
            progress = (i + 1) * 33
            await websocket_manager.update_agent_status(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                status="working",
                current_task=step.task_description,
                progress=progress
            )
            
        # Generate files
        files = [
            {"name": "README.md", "path": "README.md", "type": "markdown"},
            {"name": "API_Documentation.md", "path": "docs/api_docs.md", "type": "markdown"},
            {"name": "User_Guide.md", "path": "docs/user_guide.md", "type": "markdown"}
        ]
        
        for file_info in files:
            step.files_generated.append(file_info)
            await websocket_manager.send_file_generated(
                agent_id=step.step_id,
                agent_name=step.agent_name,
                role=step.agent_role,
                filename=file_info["name"],
                file_path=file_info["path"],
                file_type=file_info["type"]
            )
            
        return "Technical documentation completed with README, API docs, and user guide"
        
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a workflow"""
        workflow = self.workflows.get(workflow_id)
        if workflow:
            return {
                "success": True,
                "workflow": asdict(workflow)
            }
        return None

# Global sequential executor instance
sequential_executor = SequentialAgentExecutor() 