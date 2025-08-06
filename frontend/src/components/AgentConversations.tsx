import React, { useState, useEffect } from 'react';
import { getAgentConversations, addAgentConversation } from '../services/api';
import { usePollingManager } from '../utils/pollingManager';
import { config } from '../config/environment';

interface Conversation {
  id: string;
  from_agent: string;
  to_agent: string;
  message: string;
  conversation_type: string;
  timestamp: string;
}

const AgentConversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newConversation, setNewConversation] = useState({
    fromAgent: '',
    toAgent: '',
    message: '',
    conversationType: 'collaboration'
  });
  const { registerJob } = usePollingManager();

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await getAgentConversations();
      if (response.success) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use centralized polling manager for conversations
  useEffect(() => {
    // Temporarily disabled polling to reduce API calls
    // const cleanup = registerJob('agent-conversations', loadConversations, config.ui.pollingIntervals.conversations);
    // return cleanup;
    console.log('AgentConversations polling disabled for testing');
  }, [registerJob]);

  const handleAddConversation = async () => {
    if (!newConversation.fromAgent || !newConversation.toAgent || !newConversation.message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await addAgentConversation(
        newConversation.fromAgent,
        newConversation.toAgent,
        newConversation.message,
        newConversation.conversationType
      );
      
      if (response.success) {
        setNewConversation({ fromAgent: '', toAgent: '', message: '', conversationType: 'collaboration' });
        loadConversations();
      }
    } catch (error) {
      console.error('Error adding conversation:', error);
    }
  };

  const getAgentDisplayName = (agentRole: string) => {
    const agentNames: Record<string, string> = {
      'product_manager': 'Sarah Chen',
      'architect': 'Marcus Rodriguez',
      'engineer': 'Alex Thompson',
      'qa_engineer': 'Chris Lee',
      'technical_writer': 'Maria Garcia'
    };
    return agentNames[agentRole] || agentRole;
  };

  const getConversationTypeColor = (type: string) => {
    switch (type) {
      case 'handoff': return 'bg-blue-100 text-blue-800';
      case 'acknowledgment': return 'bg-green-100 text-green-800';
      case 'collaboration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🤝 Agent Conversations</h2>
      
      {/* Add new conversation */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Add Agent Conversation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="From Agent (role)"
            value={newConversation.fromAgent}
            onChange={(e) => setNewConversation({...newConversation, fromAgent: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="To Agent (role)"
            value={newConversation.toAgent}
            onChange={(e) => setNewConversation({...newConversation, toAgent: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-3">
          <select
            value={newConversation.conversationType}
            onChange={(e) => setNewConversation({...newConversation, conversationType: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="collaboration">Collaboration</option>
            <option value="handoff">Handoff</option>
            <option value="acknowledgment">Acknowledgment</option>
            <option value="question">Question</option>
          </select>
        </div>
        <textarea
          placeholder="Message"
          value={newConversation.message}
          onChange={(e) => setNewConversation({...newConversation, message: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={handleAddConversation}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send Message
        </button>
      </div>

      {/* Conversations list */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Conversations</h3>
        {loading ? (
          <div className="text-center py-4">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((conversation) => (
            <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    {getAgentDisplayName(conversation.from_agent)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-medium text-gray-600">
                    {getAgentDisplayName(conversation.to_agent)}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getConversationTypeColor(conversation.conversation_type)}`}>
                  {conversation.conversation_type}
                </span>
              </div>
              <p className="text-gray-800 mb-2">{conversation.message}</p>
              <div className="text-xs text-gray-500">
                {new Date(conversation.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentConversations; 