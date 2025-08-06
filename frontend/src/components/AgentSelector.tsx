import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Agent {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  is_available: boolean;
}

interface AgentSelectorProps {
  onAgentSelect?: (agent: Agent) => void;
  selectedAgent?: Agent | null;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ onAgentSelect, selectedAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [retryCount, setRetryCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced agent loading with retry mechanism
  const loadAgents = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading agents for AgentSelector...');
      const response = await fetch('/api/metagpt/agents');
      const data = await response.json();
      console.log('MetaGPT agents data received:', data);
      
      if (data.success && data.agents) {
        // Use MetaGPT agents directly
        const agents = data.agents.map((agent: any) => ({
          name: agent.name,
          role: agent.role,
          description: agent.description,
          capabilities: agent.capabilities || [agent.role],
          is_available: agent.is_available !== false
        }));
        
        console.log('Converted MetaGPT agents:', agents);
        setAgents(agents);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || 'Failed to load agents');
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
      const errorMessage = isRetry 
        ? `Failed to load agents after ${retryCount + 1} attempts. Please check your connection and try again.`
        : 'Failed to load agents. Please try again.';
      setError(errorMessage);
      
      // Auto-retry mechanism (up to 3 attempts)
      if (retryCount < 2 && !isRetry) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadAgents(true);
        }, 2000); // Wait 2 seconds before retry
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAgentSelect = useCallback((agent: Agent) => {
    console.log('Agent selected in AgentSelector:', agent);
    if (onAgentSelect) {
      onAgentSelect(agent);
    }
    setShowDropdown(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  }, [onAgentSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredAgents.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredAgents.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredAgents.length) {
          const agent = filteredAgents[focusedIndex];
          if (agent.is_available) {
            handleAgentSelect(agent);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  }, [showDropdown, filteredAgents, focusedIndex, handleAgentSelect]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showDropdown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-slate-300">
            {retryCount > 0 ? `Loading agents... (Attempt ${retryCount + 1}/3)` : 'Loading agents...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ {error}</div>
          <button
            onClick={() => loadAgents()}
            className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
            aria-label="Retry loading agents"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Agent Selector</h2>
        <p className="text-slate-400">
          Select an agent to chat with. Available agents are highlighted in green.
        </p>
      </div>

      {/* Enhanced Agent Selection Interface */}
      <div className="mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between p-3 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Select agent"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div className="text-left">
                <div className="text-slate-200 font-medium">
                  {selectedAgent ? selectedAgent.name : 'Select an agent'}
                </div>
                <div className="text-slate-400 text-sm">
                  {selectedAgent ? selectedAgent.role : 'Choose from available agents'}
                </div>
              </div>
            </div>
            <div className="text-slate-400">
              {showDropdown ? '▲' : '▼'}
            </div>
          </button>

          {/* Enhanced Dropdown with Search */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-slate-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 bg-slate-700 text-slate-200 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  aria-label="Search agents"
                />
              </div>

              {/* Agent List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredAgents.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    {searchTerm ? 'No agents found matching your search.' : 'No agents available.'}
                  </div>
                ) : (
                  filteredAgents.map((agent, index) => (
                    <div
                      key={agent.name}
                      className={`p-3 cursor-pointer transition-colors ${
                        focusedIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-700 text-slate-200'
                      } ${
                        !agent.is_available ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => agent.is_available && handleAgentSelect(agent)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      role="option"
                      aria-selected={selectedAgent?.name === agent.name}
                      aria-disabled={!agent.is_available}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="text-xl">🤖</div>
                            <div>
                              <div className="font-medium">{agent.name}</div>
                              <div className="text-sm opacity-75">{agent.role}</div>
                            </div>
                          </div>
                          <div className="text-sm opacity-75 mb-2 line-clamp-2">
                            {agent.description}
                          </div>
                          
                          {/* Enhanced Capabilities Display */}
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability, capIndex) => (
                              <span
                                key={capIndex}
                                className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded"
                                title={capability}
                              >
                                {capability}
                              </span>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                                +{agent.capabilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agent.is_available
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}>
                            {agent.is_available ? 'Available' : 'Unavailable'}
                          </span>
                          
                          {selectedAgent?.name === agent.name && (
                            <span className="text-blue-400 text-sm">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Grid View */}
      <div className="grid gap-4">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No agents available</div>
            <button
              onClick={() => loadAgents()}
              className="px-3 py-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
              aria-label="Refresh agents"
            >
              Refresh
            </button>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.name}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedAgent?.name === agent.name
                  ? 'border-blue-500 bg-blue-900/20'
                  : agent.is_available
                    ? 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                    : 'border-slate-700 bg-slate-800/50 opacity-50'
              }`}
              onClick={() => agent.is_available && handleAgentSelect(agent)}
              title={agent.description}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">{agent.name}</h3>
                      <p className="text-sm text-slate-400">{agent.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                        title={capability}
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.is_available
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {agent.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  
                  {selectedAgent?.name === agent.name && (
                    <span className="text-blue-400 text-sm">✓ Selected</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAgent && (
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-blue-500">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Currently Selected</h3>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="text-slate-200 font-medium">{selectedAgent.name}</div>
              <div className="text-slate-400 text-sm">{selectedAgent.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 