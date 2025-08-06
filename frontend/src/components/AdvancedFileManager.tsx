import React, { useState, useEffect } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'agent-output';
  size?: string;
  modified: string;
  path: string;
  content?: string;
  agentName?: string;
  agentRole?: string;
  workflowId?: string;
}

interface AgentOutput {
  id: string;
  name: string;
  agentName: string;
  agentRole: string;
  workflowId: string;
  content: string;
  timestamp: string;
  status: 'completed' | 'running' | 'failed';
}

export const AdvancedFileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [agentOutputs, setAgentOutputs] = useState<AgentOutput[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('tree');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAgentOutputs, setShowAgentOutputs] = useState<boolean>(true);

  useEffect(() => {
    loadFiles();
    loadAgentOutputs();
  }, []);

  const loadFiles = async () => {
    // Mock data - would be replaced with actual API call
    const mockFiles: FileItem[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        modified: '2024-01-15T10:30:00Z',
        path: '/src'
      },
      {
        id: '2',
        name: 'package.json',
        type: 'file',
        size: '2.1 KB',
        modified: '2024-01-15T09:15:00Z',
        path: '/package.json'
      },
      {
        id: '3',
        name: 'README.md',
        type: 'file',
        size: '1.5 KB',
        modified: '2024-01-15T08:45:00Z',
        path: '/README.md'
      },
      {
        id: '4',
        name: 'public',
        type: 'folder',
        modified: '2024-01-15T08:30:00Z',
        path: '/public'
      }
    ];
    setFiles(mockFiles);
  };

  const loadAgentOutputs = async () => {
    // Mock agent outputs - would be replaced with actual API call
    const mockOutputs: AgentOutput[] = [
      {
        id: '1',
        name: 'Product Requirements Document',
        agentName: 'Alex Thompson',
        agentRole: 'Product Manager',
        workflowId: 'workflow_ecommerce_123',
        content: 'Complete PRD for e-commerce platform with user stories and requirements...',
        timestamp: '2024-01-15T14:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        name: 'System Architecture Design',
        agentName: 'Marcus Rodriguez',
        agentRole: 'Software Architect',
        workflowId: 'workflow_ecommerce_123',
        content: 'Microservices architecture with API gateway, user service, product service...',
        timestamp: '2024-01-15T15:45:00Z',
        status: 'completed'
      },
      {
        id: '3',
        name: 'Frontend Components',
        agentName: 'Alex Thompson',
        agentRole: 'Software Engineer',
        workflowId: 'workflow_ecommerce_123',
        content: 'React components for product listing, cart, checkout, and user authentication...',
        timestamp: '2024-01-15T16:20:00Z',
        status: 'running'
      },
      {
        id: '4',
        name: 'Test Suite',
        agentName: 'Chris Lee',
        agentRole: 'QA Engineer',
        workflowId: 'workflow_analytics_456',
        content: 'Comprehensive test suite including unit tests, integration tests, and E2E tests...',
        timestamp: '2024-01-15T17:10:00Z',
        status: 'completed'
      }
    ];
    setAgentOutputs(mockOutputs);
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    if (file.type === 'file') {
      // Mock file content - would be replaced with actual API call
      setFileContent(`Content of ${file.name}...\n\nThis is a sample file content that would be loaded from the backend.`);
    }
  };

  const handleNewFile = () => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: 'new-file.txt',
      type: 'file',
      size: '0 KB',
      modified: new Date().toISOString(),
      path: `${currentPath}/new-file.txt`
    };
    setFiles(prev => [...prev, newFile]);
  };

  const handleNewFolder = () => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: 'new-folder',
      type: 'folder',
      modified: new Date().toISOString(),
      path: `${currentPath}/new-folder`
    };
    setFiles(prev => [...prev, newFolder]);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setFileContent('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOutputs = agentOutputs.filter(output => 
    output.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    output.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200">
          📁 File Manager
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAgentOutputs(!showAgentOutputs)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              showAgentOutputs 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {showAgentOutputs ? 'Hide' : 'Show'} Agent Outputs
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewFile}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            New File
          </button>
          <button
            onClick={handleNewFolder}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            New Folder
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 bg-slate-700 text-slate-200 rounded text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex bg-slate-700 rounded">
            {(['tree', 'list', 'grid'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs transition-colors ${
                  viewMode === mode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* File List */}
        <div className="w-1/2 border-r border-slate-700 p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Files & Folders</h3>
          
          {filteredFiles.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No files found</p>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedFile?.id === file.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{file.type === 'folder' ? '📁' : '📄'}</span>
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.size && <span className="text-xs text-slate-400">{file.size}</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Outputs */}
        {showAgentOutputs && (
          <div className="w-1/2 border-r border-slate-700 p-4">
            <h3 className="text-lg font-medium text-slate-200 mb-4">🤖 Agent Outputs</h3>
            
            {filteredOutputs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No agent outputs found</p>
            ) : (
              <div className="space-y-2">
                {filteredOutputs.map(output => (
                  <div
                    key={output.id}
                    onClick={() => {
                      setSelectedFile({
                        id: output.id,
                        name: output.name,
                        type: 'agent-output',
                        modified: output.timestamp,
                        path: `/agent-outputs/${output.name}`,
                        content: output.content,
                        agentName: output.agentName,
                        agentRole: output.agentRole,
                        workflowId: output.workflowId
                      });
                      setFileContent(output.content);
                    }}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedFile?.id === output.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{output.name}</span>
                      <span className={`text-xs flex items-center gap-1 ${getStatusColor(output.status)}`}>
                        {getStatusIcon(output.status)} {output.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">
                      {output.agentName} ({output.agentRole})
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-2">
                      {output.content.substring(0, 100)}...
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(output.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* File Content */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-medium text-slate-200 mb-4">File Content</h3>
          
          {selectedFile ? (
            <div className="bg-slate-800 rounded-lg p-4 h-full overflow-auto">
              <div className="mb-4">
                <h4 className="text-slate-200 font-medium">{selectedFile.name}</h4>
                {selectedFile.agentName && (
                  <p className="text-sm text-slate-400">
                    Generated by {selectedFile.agentName} ({selectedFile.agentRole})
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Modified: {new Date(selectedFile.modified).toLocaleString()}
                </p>
              </div>
              <pre className="text-slate-200 text-sm whitespace-pre-wrap">
                {fileContent}
              </pre>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 