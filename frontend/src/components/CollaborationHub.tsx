import React, { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
  lastActive: string;
}

interface CollaborationProject {
  id: string;
  name: string;
  description: string;
  members: string[];
  status: 'active' | 'paused' | 'completed';
  progress: number;
  lastUpdated: string;
}

export const CollaborationHub: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [collaborationProjects, setCollaborationProjects] = useState<CollaborationProject[]>([]);
  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'chat'>('team');
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    avatar: string;
  }>>([
    {
      id: '1',
      sender: 'Alice Johnson',
      message: 'Hey team! I\'ve updated the project requirements for the AI Chat Application. Can everyone review the latest changes?',
      timestamp: '2 minutes ago',
      avatar: '👩‍💼'
    },
    {
      id: '2',
      sender: 'Bob Smith',
      message: 'I\'ve reviewed the changes. The new requirements look good! I\'ll start implementing the enhanced chat interface.',
      timestamp: '1 minute ago',
      avatar: '👨‍💻'
    },
    {
      id: '3',
      sender: 'Carol Davis',
      message: 'Perfect! I\'ll update the UI mockups to match the new requirements. Should have them ready by tomorrow.',
      timestamp: '30 seconds ago',
      avatar: '👩‍🎨'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      const mockTeamMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Product Manager',
          status: 'online',
          avatar: '👩‍💼',
          lastActive: '2 minutes ago'
        },
        {
          id: '2',
          name: 'Bob Smith',
          role: 'Software Engineer',
          status: 'online',
          avatar: '👨‍💻',
          lastActive: '5 minutes ago'
        },
        {
          id: '3',
          name: 'Carol Davis',
          role: 'UI/UX Designer',
          status: 'away',
          avatar: '👩‍🎨',
          lastActive: '15 minutes ago'
        }
      ];

      const mockProjects: CollaborationProject[] = [
        {
          id: '1',
          name: 'AI Chat Application',
          description: 'Building an intelligent chat interface with AI agents',
          members: ['Alice Johnson', 'Bob Smith'],
          status: 'active',
          progress: 75,
          lastUpdated: '2 hours ago'
        },
        {
          id: '2',
          name: 'Analytics Dashboard',
          description: 'Real-time performance monitoring and insights',
          members: ['Bob Smith', 'Carol Davis'],
          status: 'active',
          progress: 45,
          lastUpdated: '1 hour ago'
        }
      ];

      setTeamMembers(mockTeamMembers);
      setCollaborationProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: 'Just now',
      avatar: '👤'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'paused': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collaboration Hub</h2>
          <p className="text-sm text-gray-600">Team collaboration and project management</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const projectName = prompt('Enter project name:');
              if (projectName && projectName.trim()) {
                const newProject: CollaborationProject = {
                  id: Date.now().toString(),
                  name: projectName.trim(),
                  description: 'New collaborative project',
                  members: ['Alice Johnson'],
                  status: 'active',
                  progress: 0,
                  lastUpdated: 'Just now'
                };
                setCollaborationProjects(prev => [newProject, ...prev]);
                alert(`Project "${projectName}" created successfully!`);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            ➕ New Project
          </button>
          <button
            onClick={() => {
              const memberName = prompt('Enter member name:');
              const memberRole = prompt('Enter member role:');
              if (memberName && memberRole && memberName.trim() && memberRole.trim()) {
                const newMember: TeamMember = {
                  id: Date.now().toString(),
                  name: memberName.trim(),
                  role: memberRole.trim(),
                  status: 'online',
                  avatar: '👤',
                  lastActive: 'Just now'
                };
                setTeamMembers(prev => [newMember, ...prev]);
                alert(`Member "${memberName}" invited successfully!`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
          >
            👥 Invite Member
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Team Members ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🚀 Projects ({collaborationProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💬 Team Chat
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      <p className="text-xs text-gray-400">{member.lastActive}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'online' ? 'bg-green-100 text-green-800' :
                        member.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(member.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            {collaborationProjects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getProjectStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Team Members</span>
                    <span className="text-gray-900">{project.members.length}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last updated: {project.lastUpdated}
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
                    Edit Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Team Chat</h3>
              <p className="text-sm text-gray-500">Real-time collaboration with your team</p>
            </div>
            
            {/* Chat Messages Area */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-900">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{msg.sender} • {msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>3 team members online</span>
                <span>💬 Team Chat Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 