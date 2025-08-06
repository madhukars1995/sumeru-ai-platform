"""
Real MetaGPT Integration for Sumeru AI System

This module integrates with the actual MetaGPT framework to enable true multi-agent
collaboration for software development projects.
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import uuid

# Try to import MetaGPT
try:
    from metagpt.software_company import generate_repo
    from metagpt.utils.project_repo import ProjectRepo
    from metagpt.roles import ProductManager, Architect, Engineer, QAEngineer, TechnicalWriter
    from metagpt.roles import ProjectManager, UI_Designer, DataScientist, DevOpsEngineer, SecurityExpert
    METAGPT_AVAILABLE = True
except ImportError:
    print("MetaGPT not available. Using fallback implementation.")
    METAGPT_AVAILABLE = False

@dataclass
class RealMetaGPTAgent:
    name: str
    role: str
    description: str
    capabilities: List[str]
    is_available: bool
    agent_instance: Optional[Any] = None

@dataclass
class RealMetaGPTTask:
    id: str
    title: str
    description: str
    agent_role: str
    status: str = "pending"
    result: Optional[str] = None
    files_generated: List[Dict[str, Any]] = None
    workflow_id: Optional[str] = None
    
    def __post_init__(self):
        if self.files_generated is None:
            self.files_generated = []

@dataclass
class RealCollaborativeWorkflow:
    id: str
    name: str
    description: str
    requirements: str
    agents: List[str]
    current_step: int = 0
    status: str = "created"
    results: Dict[str, Any] = None
    project_repo: Optional[Any] = None
    
    def __post_init__(self):
        if self.results is None:
            self.results = {}

class RealMetaGPTIntegration:
    def __init__(self):
        self.agents = self._initialize_agents()
        self.tasks: Dict[str, RealMetaGPTTask] = {}
        self.task_counter = 0
        self.workflows: Dict[str, RealCollaborativeWorkflow] = {}
        self.active_agents: Dict[str, Dict[str, Any]] = {}
        
    def _initialize_agents(self) -> Dict[str, RealMetaGPTAgent]:
        """Initialize real MetaGPT agents"""
        agents = {}
        
        if METAGPT_AVAILABLE:
            # Initialize real MetaGPT agents
            agents = {
                "product_manager": RealMetaGPTAgent(
                    name="Sarah Chen",
                    role="product_manager",
                    description="Product Manager with expertise in requirements, planning, and user experience",
                    capabilities=["planning", "requirements", "roadmap", "prioritization", "user_stories", "market_research"],
                    is_available=True,
                    agent_instance=ProductManager() if METAGPT_AVAILABLE else None
                ),
                "architect": RealMetaGPTAgent(
                    name="Marcus Rodriguez",
                    role="architect",
                    description="Senior Software Architect with expertise in system design, UI/UX, and technical planning",
                    capabilities=["architecture", "design", "system_design", "technical_planning", "ui_design", "api_design", "data_modeling"],
                    is_available=True,
                    agent_instance=Architect() if METAGPT_AVAILABLE else None
                ),
                "engineer": RealMetaGPTAgent(
                    name="Alex Thompson",
                    role="engineer",
                    description="Full-stack developer with expertise in coding, testing, data science, and DevOps",
                    capabilities=["coding", "implementation", "testing", "debugging", "data_analysis", "ml_models", "deployment", "infrastructure"],
                    is_available=True,
                    agent_instance=Engineer() if METAGPT_AVAILABLE else None
                ),
                "qa_engineer": RealMetaGPTAgent(
                    name="Chris Lee",
                    role="qa_engineer",
                    description="QA Engineer with expertise in testing, security, and quality assurance",
                    capabilities=["test_planning", "automation", "quality_assurance", "bug_tracking", "security_audit", "performance_testing"],
                    is_available=True,
                    agent_instance=QAEngineer() if METAGPT_AVAILABLE else None
                ),
                "technical_writer": RealMetaGPTAgent(
                    name="Maria Garcia",
                    role="technical_writer",
                    description="Technical writer with expertise in documentation, API docs, and user guides",
                    capabilities=["documentation", "api_docs", "user_guides", "technical_writing", "knowledge_management"],
                    is_available=True,
                    agent_instance=TechnicalWriter() if METAGPT_AVAILABLE else None
                )
            }
        else:
            # Fallback to mock agents
            agents = {
                "product_manager": RealMetaGPTAgent(
                    name="Sarah Chen",
                    role="product_manager",
                    description="Product Manager with expertise in requirements, planning, and user experience",
                    capabilities=["planning", "requirements", "roadmap", "prioritization", "user_stories", "market_research"],
                    is_available=True
                ),
                "architect": RealMetaGPTAgent(
                    name="Marcus Rodriguez",
                    role="architect",
                    description="Senior Software Architect with expertise in system design, UI/UX, and technical planning",
                    capabilities=["architecture", "design", "system_design", "technical_planning", "ui_design", "api_design", "data_modeling"],
                    is_available=True
                ),
                "engineer": RealMetaGPTAgent(
                    name="Alex Thompson",
                    role="engineer",
                    description="Full-stack developer with expertise in coding, testing, data science, and DevOps",
                    capabilities=["coding", "implementation", "testing", "debugging", "data_analysis", "ml_models", "deployment", "infrastructure"],
                    is_available=True
                ),
                "qa_engineer": RealMetaGPTAgent(
                    name="Chris Lee",
                    role="qa_engineer",
                    description="QA Engineer with expertise in testing, security, and quality assurance",
                    capabilities=["test_planning", "automation", "quality_assurance", "bug_tracking", "security_audit", "performance_testing"],
                    is_available=True
                ),
                "technical_writer": RealMetaGPTAgent(
                    name="Maria Garcia",
                    role="technical_writer",
                    description="Technical writer with expertise in documentation, API docs, and user guides",
                    capabilities=["documentation", "api_docs", "user_guides", "technical_writing", "knowledge_management"],
                    is_available=True
                )
            }
        
        return agents

    async def create_project_with_metagpt(self, requirements: str, project_name: str = None) -> Dict[str, Any]:
        """Create a project using real MetaGPT framework"""
        try:
            if METAGPT_AVAILABLE:
                # Use real MetaGPT to generate the project
                print(f"Creating project with MetaGPT: {requirements}")
                
                # Generate the project repository
                repo: ProjectRepo = await generate_repo(requirements)
                
                # Create workflow to track the process
                workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
                workflow = RealCollaborativeWorkflow(
                    id=workflow_id,
                    name=project_name or "Generated Project",
                    description=f"Project generated from requirements: {requirements}",
                    requirements=requirements,
                    agents=["product_manager", "architect", "engineer", "qa_engineer", "technical_writer"],
                    status="completed",
                    project_repo=repo
                )
                
                self.workflows[workflow_id] = workflow
                
                # Extract files from the generated repository
                files = []
                if hasattr(repo, 'files'):
                    for file_path, content in repo.files.items():
                        files.append({
                            "name": os.path.basename(file_path),
                            "path": file_path,
                            "content": content,
                            "type": self._get_file_type(file_path),
                            "icon": self._get_file_icon(file_path)
                        })
                
                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "project_name": project_name or "Generated Project",
                    "files": files,
                    "repo_structure": str(repo) if repo else "No repository generated",
                    "message": "Project created successfully using MetaGPT"
                }
            else:
                # Fallback to mock implementation
                return await self._create_mock_project(requirements, project_name)
                
        except Exception as e:
            print(f"Error creating project with MetaGPT: {e}")
            return {
                "success": False,
                "error": f"Failed to create project: {str(e)}"
            }

    async def _create_mock_project(self, requirements: str, project_name: str = None) -> Dict[str, Any]:
        """Create a mock project when MetaGPT is not available"""
        workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
        
        # Simulate the collaborative workflow
        workflow = RealCollaborativeWorkflow(
            id=workflow_id,
            name=project_name or "Mock Project",
            description=f"Mock project generated from requirements: {requirements}",
            requirements=requirements,
            agents=["product_manager", "architect", "engineer", "qa_engineer", "technical_writer"],
            status="completed"
        )
        
        self.workflows[workflow_id] = workflow
        
        # Generate mock files based on requirements
        files = self._generate_mock_project_files(requirements)
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "project_name": project_name or "Mock Project",
            "files": files,
            "repo_structure": "Mock project structure",
            "message": "Mock project created (MetaGPT not available)"
        }

    def _generate_mock_project_files(self, requirements: str) -> List[Dict[str, Any]]:
        """Generate mock project files based on requirements"""
        files = []
        
        # Product Manager files
        files.append({
            "name": "product_requirements.md",
            "path": "docs/product_requirements.md",
            "content": f"# Product Requirements\n\n## Project: {requirements}\n\n### User Stories\n- As a user, I want to...\n- As a user, I need to...\n\n### Acceptance Criteria\n- [ ] Feature 1\n- [ ] Feature 2\n\n### Technical Requirements\n- Performance\n- Security\n- Scalability",
            "type": "markdown",
            "icon": "📄"
        })
        
        # Architect files
        files.append({
            "name": "system_architecture.md",
            "path": "docs/system_architecture.md",
            "content": f"# System Architecture\n\n## Overview\nSystem designed for: {requirements}\n\n### Components\n- Frontend: React/Next.js\n- Backend: Node.js/Python\n- Database: PostgreSQL\n- API: RESTful\n\n### Architecture Diagram\n```\n[Frontend] -> [API Gateway] -> [Backend Services]\n```",
            "type": "markdown",
            "icon": "🏗️"
        })
        
        # Engineer files
        files.append({
            "name": "main.py",
            "path": "src/main.py",
            "content": f"# Main Application\n\nimport os\nfrom flask import Flask\n\napp = Flask(__name__)\n\n@app.route('/')\ndef home():\n    return 'Hello, World!'\n\nif __name__ == '__main__':\n    app.run(debug=True)",
            "type": "python",
            "icon": "🐍"
        })
        
        files.append({
            "name": "package.json",
            "path": "package.json",
            "content": json.dumps({
                "name": "generated-project",
                "version": "1.0.0",
                "description": f"Project generated for: {requirements}",
                "main": "src/main.py",
                "scripts": {
                    "start": "python src/main.py",
                    "test": "python -m pytest"
                },
                "dependencies": {
                    "flask": "^2.0.0",
                    "requests": "^2.25.0"
                }
            }, indent=2),
            "type": "json",
            "icon": "📦"
        })
        
        # QA Engineer files
        files.append({
            "name": "test_main.py",
            "path": "tests/test_main.py",
            "content": f"# Test Suite\n\nimport pytest\nfrom src.main import app\n\n@pytest.fixture\ndef client():\n    app.config['TESTING'] = True\n    with app.test_client() as client:\n        yield client\n\ndef test_home_page(client):\n    response = client.get('/')\n    assert response.status_code == 200\n    assert b'Hello, World!' in response.data",
            "type": "python",
            "icon": "🧪"
        })
        
        # Technical Writer files
        files.append({
            "name": "README.md",
            "path": "README.md",
            "content": f"# Generated Project\n\n## Overview\nThis project was generated based on the requirements: {requirements}\n\n## Installation\n```bash\npip install -r requirements.txt\n```\n\n## Usage\n```bash\npython src/main.py\n```\n\n## Testing\n```bash\npython -m pytest\n```\n\n## Documentation\nSee the `docs/` folder for detailed documentation.",
            "type": "markdown",
            "icon": "📖"
        })
        
        return files

    def _get_file_type(self, filename: str) -> str:
        """Get file type based on extension"""
        ext = os.path.splitext(filename)[1].lower()
        type_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.md': 'markdown',
            '.txt': 'text',
            '.yml': 'yaml',
            '.yaml': 'yaml',
            '.xml': 'xml',
            '.sql': 'sql'
        }
        return type_map.get(ext, 'unknown')

    def _get_file_icon(self, filename: str) -> str:
        """Get file icon based on type"""
        file_type = self._get_file_type(filename)
        icon_map = {
            'python': '🐍',
            'javascript': '📜',
            'typescript': '📘',
            'html': '🌐',
            'css': '🎨',
            'json': '📦',
            'markdown': '📄',
            'text': '📝',
            'yaml': '⚙️',
            'xml': '📋',
            'sql': '🗄️',
            'unknown': '📄'
        }
        return icon_map.get(file_type, '📄')

    def get_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of available agents"""
        return [asdict(agent) for agent in self.agents.values()]

    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get status of a workflow"""
        workflow = self.workflows.get(workflow_id)
        if workflow:
            return {
                "success": True,
                "workflow": asdict(workflow)
            }
        return {
            "success": False,
            "error": "Workflow not found"
        }

    def get_workflow_files(self, workflow_id: str) -> List[Dict[str, Any]]:
        """Get files generated by a workflow"""
        workflow = self.workflows.get(workflow_id)
        if workflow and hasattr(workflow, 'project_repo') and workflow.project_repo:
            files = []
            if hasattr(workflow.project_repo, 'files'):
                for file_path, content in workflow.project_repo.files.items():
                    files.append({
                        "name": os.path.basename(file_path),
                        "path": file_path,
                        "content": content,
                        "type": self._get_file_type(file_path),
                        "icon": self._get_file_icon(file_path)
                    })
            return files
        return []

# Global instance
real_metagpt_integration = RealMetaGPTIntegration() 