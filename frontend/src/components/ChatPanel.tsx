import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { sendMessage, modelAPI, creditsAPI } from '../services/api';
import { ModelSelector } from './ModelSelector';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent';
  timestamp: string;
  agentName?: string;
  agentRole?: string;
}

interface Agent {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  is_available: boolean;
}

interface ModelInfo {
  provider: string;
  model: string;
  isAvailable: boolean;
  status: 'available' | 'low' | 'exhausted';
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showAtAgentSelector, setShowAtAgentSelector] = useState(false);
  const [atAgentFilter, setAtAgentFilter] = useState('');

  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [currentModel, setCurrentModel] = useState<{ provider: string; model: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isRefreshingModel, setIsRefreshingModel] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Memoized message count for performance
  const messageCount = useMemo(() => messages.length, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Clear validation error when input changes
  useEffect(() => {
    if (validationError && inputValue.trim().length > 0) {
      setValidationError(null);
    }
  }, [inputValue, validationError]);

  useEffect(() => {
    loadChatHistory();
    loadAgents();
    loadCurrentModel();
  }, []);

  // Refresh current model when model selector is opened
  useEffect(() => {
    if (showModelSelector) {
      loadCurrentModel();
    }
  }, [showModelSelector]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Handle @ agent selection
  useEffect(() => {
    const lastAtSymbol = inputValue.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const afterAt = inputValue.substring(lastAtSymbol + 1);
      const spaceIndex = afterAt.indexOf(' ');
      const filter = spaceIndex === -1 ? afterAt : afterAt.substring(0, spaceIndex);
      
      // Fixed: Remove redundant condition
      setAtAgentFilter(filter);
      setShowAtAgentSelector(true);
      setSelectedAgentIndex(0); // Reset selection when filter changes
    } else {
      setShowAtAgentSelector(false);
      setAtAgentFilter('');
    }
  }, [inputValue]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAgentSelector || showAtAgentSelector) {
        const target = event.target as Element;
        if (!target.closest('.agent-selector') && !target.closest('.at-agent-selector')) {
          setShowAgentSelector(false);
          setShowAtAgentSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAgentSelector, showAtAgentSelector]);

  // Enhanced chat history loading with better cache management
  const loadChatHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      
      // Check if we have cached history first
      const cachedHistory = localStorage.getItem('chat_history');
      if (cachedHistory) {
        try {
          const parsedHistory = JSON.parse(cachedHistory);
          if (parsedHistory && Array.isArray(parsedHistory)) {
            setMessages(parsedHistory);
            console.log('Loaded chat history from cache');
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached history:', cacheError);
          localStorage.removeItem('chat_history'); // Clear corrupted cache
        }
      }
      
      // Try to fetch fresh history from server
      const response = await fetch('/api/chat/history');
      const data = await response.json();
      
      if (data.success && data.messages) {
        const freshHistory = data.messages;
        setMessages(freshHistory);
        
        // Update cache with fresh data
        try {
          localStorage.setItem('chat_history', JSON.stringify(freshHistory));
          console.log('Updated chat history cache');
        } catch (cacheError) {
          console.warn('Failed to update cache:', cacheError);
        }
      } else {
        throw new Error(data.error || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      
      // If we have cached data, show a warning but keep using it
      const cachedHistory = localStorage.getItem('chat_history');
      if (cachedHistory) {
        try {
          const parsedHistory = JSON.parse(cachedHistory);
          if (parsedHistory && Array.isArray(parsedHistory)) {
            setMessages(parsedHistory);
            setError('Using cached chat history. Some recent messages may not be shown.');
            console.log('Using cached chat history due to server error');
          } else {
            throw new Error('Invalid cached data');
          }
        } catch (cacheError) {
          setError('Failed to load chat history. Please refresh the page.');
          console.error('Cache parsing error:', cacheError);
        }
      } else {
        setError('Failed to load chat history. Please refresh the page.');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Enhanced agent loading with retry mechanism
  const loadAgents = useCallback(async (isRetry = false) => {
    try {
      setIsLoadingAgents(true);
      setError(null);
      
      console.log('Loading agents for ChatPanel...');
      const response = await fetch('/api/metagpt/agents');
      const data = await response.json();
      console.log('MetaGPT agents data received:', data);
      
      if (data.success && data.agents) {
        const agents = data.agents.map((agent: any) => ({
          name: agent.name,
          role: agent.role,
          description: agent.description,
          capabilities: agent.capabilities || [agent.role],
          is_available: agent.is_available !== false
        }));
        
        console.log('Converted MetaGPT agents:', agents);
        setAgents(agents);
      } else {
        throw new Error(data.error || 'Failed to load agents');
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
      setError('Failed to load agents. Please try again.');
      
      // Auto-retry mechanism for agent loading
      if (!isRetry) {
        setTimeout(() => {
          loadAgents(true);
        }, 3000); // Wait 3 seconds before retry
      }
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  const loadCurrentModel = async () => {
    setIsRefreshingModel(true);
    try {
      const current = await modelAPI.getCurrentModel();
      setCurrentModel(current);
      
      // Also load available models for the dropdown
      const quotas = await creditsAPI.getQuotas();
      const modelList: ModelInfo[] = [];
      
      for (const [provider, providerModels] of Object.entries(quotas as Record<string, unknown>)) {
        for (const [model, data] of Object.entries(providerModels as Record<string, unknown>)) {
          const dailyPercentage = (data as { daily: { percentage: number } }).daily.percentage;
          const monthlyPercentage = (data as { monthly: { percentage: number } }).monthly.percentage;
          
          let status: ModelInfo['status'] = 'available';
          if (dailyPercentage >= 100 || monthlyPercentage >= 100) {
            status = 'exhausted';
          } else if (dailyPercentage >= 90 || monthlyPercentage >= 90) {
            status = 'low';
          }
          
          modelList.push({
            provider,
            model,
            isAvailable: status === 'available' || status === 'low',
            status
          });
        }
      }
      
      setAvailableModels(modelList);
    } catch (error) {
      console.error('Failed to load current model:', error);
    } finally {
      setIsRefreshingModel(false);
    }
  };

  // Enhanced input validation with better user feedback
  const validateInput = useCallback(() => {
    const trimmedInput = inputValue.trim();
    
    if (!trimmedInput) {
      setValidationError('Please enter a message before sending.');
      return false;
    }
    
    if (trimmedInput.length > 2000) {
      setValidationError('Message is too long. Please keep it under 2000 characters.');
      return false;
    }
    
    // Check for common spam patterns
    const repeatedChars = /(.)\1{10,}/;
    if (repeatedChars.test(trimmedInput)) {
      setValidationError('Message contains too many repeated characters. Please revise.');
      return false;
    }
    
    // Clear validation error if input is valid
    if (validationError) {
      setValidationError(null);
    }
    
    return true;
  }, [inputValue, validationError]);

  // Enhanced message sending with better error handling
  const handleSendMessage = useCallback(async () => {
    if (!validateInput()) {
      return;
    }

    const messageContent = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString(),
      agentName: selectedAgent?.name || undefined,
      agentRole: selectedAgent?.role || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await sendMessage(messageContent, uploadedFiles, selectedAgent?.name || undefined, selectedAgent?.role || undefined);
      
      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.message || 'Message sent successfully',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          agentName: selectedAgent?.name || undefined,
          agentRole: selectedAgent?.role || undefined
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update cache with new messages
        try {
          const updatedMessages = [...messages, newMessage, assistantMessage];
          localStorage.setItem('chat_history', JSON.stringify(updatedMessages));
        } catch (cacheError) {
          console.warn('Failed to update message cache:', cacheError);
        }
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'API quota limit reached. Please try again later or switch to a different model.';
        } else if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = 'Network timeout. Please check your connection and try again.';
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          errorMessage = 'Invalid message format. Please check your input and try again.';
        }
      }
      
      setError(errorMessage);
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, uploadedFiles, selectedAgent, validateInput, messages]);

  const handleTestMessage = useCallback(() => {
    const testMessage = "Hello! I'm ready for your testing. What would you like me to do?";
    setInputValue(testMessage);
  }, []);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAgentSelect = useCallback((agent: Agent) => {
    console.log('Agent selected:', agent);
    setSelectedAgent(agent);
    setShowAgentSelector(false);
  }, []);

  const handleAtAgentSelect = useCallback((agent: Agent) => {
    // Fixed: Get current input value and cursor position to avoid stale state
    const currentInputValue = inputValue;
    const currentAtPosition = currentInputValue.lastIndexOf('@');
    const currentFilter = atAgentFilter;
    
    if (currentAtPosition !== -1) {
      // Replace the @filter with the selected agent name
      const beforeAt = currentInputValue.substring(0, currentAtPosition);
      const afterAt = currentInputValue.substring(currentAtPosition + 1 + currentFilter.length);
      const newInputValue = beforeAt + '@' + agent.name + ' ' + afterAt;
      
      setInputValue(newInputValue);
      setShowAtAgentSelector(false);
      setAtAgentFilter('');
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [inputValue, atAgentFilter]);

  const canSendMessage = inputValue.trim().length > 0 || uploadedFiles.length > 0;

  // Filter agents for @ selector
  const filteredAgents = useMemo(() => {
    if (!atAgentFilter) return agents;
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(atAgentFilter.toLowerCase()) ||
      agent.role.toLowerCase().includes(atAgentFilter.toLowerCase())
    );
  }, [agents, atAgentFilter]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (showAtAgentSelector && filteredAgents.length > 0) {
      // Handle keyboard navigation in dropdown
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAgentIndex(prev => Math.min(prev + 1, filteredAgents.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAgentIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredAgents[selectedAgentIndex]) {
          handleAtAgentSelect(filteredAgents[selectedAgentIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowAtAgentSelector(false);
        setAtAgentFilter('');
      }
    }
  }, [handleSendMessage, showAtAgentSelector, filteredAgents, selectedAgentIndex, handleAtAgentSelect]);

  const getProviderIcon = (provider: string, isAvailable: boolean = true) => {
    const baseIcon = (() => {
      switch (provider) {
        case 'gemini': return '🔍';
        case 'openrouter': return '🌐';
        case 'groq': return '⚡';
        default: return '🤖';
      }
    })();
    
    // Add availability indicator with better visual distinction
    if (isAvailable) {
      return baseIcon;
    } else {
      // Use a different style for unavailable models
      switch (provider) {
        case 'gemini': return '🔍❌';
        case 'openrouter': return '🌐❌';
        case 'groq': return '⚡❌';
        default: return '🤖❌';
      }
    }
  };

  // Enhanced error display with suggestions
  const renderError = useCallback(() => {
    if (!error && !validationError) return null;
    
    const errorText = validationError || error;
    const isValidationError = !!validationError;
    
    return (
      <div className={`mb-4 p-3 rounded-lg border ${
        isValidationError 
          ? 'border-red-500 bg-red-900/20' 
          : 'border-orange-500 bg-orange-900/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {isValidationError ? '⚠️' : '❌'}
              </span>
              <span className={`font-medium ${
                isValidationError ? 'text-red-400' : 'text-orange-400'
              }`}>
                {isValidationError ? 'Input Error' : 'System Error'}
              </span>
            </div>
            <p className={`text-sm ${
              isValidationError ? 'text-red-300' : 'text-orange-300'
            }`}>
              {errorText}
            </p>
            {!isValidationError && (
              <div className="mt-2 text-xs text-orange-400">
                <p className="mb-1">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setError(null);
              setValidationError(null);
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }, [error, validationError]);

  return (
    <div className="flex flex-col h-full bg-slate-900" role="main" aria-label="Chat interface">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-slate-200">Chat</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">({messageCount} messages)</span>
          </div>
        </div>
        
        {/* Current Agent Display */}
        {selectedAgent && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span>🤖 Talking with:</span>
            <span className="font-medium text-blue-400">{selectedAgent.name}</span>
            <span className="text-slate-400">({selectedAgent.role})</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              selectedAgent.is_available 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {selectedAgent.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShowAgentSelector(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 transition-colors"
            aria-label="Select an AI agent"
            disabled={isLoadingAgents}
          >
            {isLoadingAgents ? (
              <span className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                Loading...
              </span>
            ) : (
              '🤖 Select Agent'
            )}
          </button>
          <button
            onClick={handleTestMessage}
            className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-base hover:bg-slate-600 transition-colors"
            aria-label="Insert a test message"
          >
            Test Chat
          </button>
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-base hover:bg-slate-600 transition-colors"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            Clear Chat
          </button>
          <span className="text-sm text-slate-400 self-center">
            {messageCount} messages
          </span>
        </div>
      </div>

      {/* Compact Model Selector */}
      <div className="border-b border-slate-700 bg-slate-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-slate-300">Model:</span>
            {currentModel ? (
              <div className="flex items-center gap-1">
                <span className="text-base">{getProviderIcon(currentModel.provider, true)}</span>
                <span className="text-sm text-slate-200">{currentModel.model}</span>
                <span className="text-xs text-slate-400">({currentModel.provider})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {isRefreshingModel ? (
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-400"></div>
                    Loading model...
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Loading...</span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowModelSelector(true)}
            className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-sm hover:bg-slate-600 transition-colors"
            aria-label="Change AI model"
            disabled={isRefreshingModel}
          >
            Change
          </button>
        </div>
      </div>

      {/* Error Display */}
      {renderError()}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
              <span>Loading chat history...</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm text-slate-300 flex-shrink-0">
                🤖
              </div>
            )}
            <div className="flex-1">
              <div className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2">
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.agentName && (
                  <div className="text-xs text-slate-400 mt-1">
                    via {message.agentName} ({message.agentRole})
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm text-white order-1 flex-shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm text-slate-300 flex-shrink-0">
              🤖
            </div>
            <div className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-300"></div>
                <span>
                  {selectedAgent ? `${selectedAgent.name} is thinking...` : 'Thinking...'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                This may take a few moments...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Display */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1">
                <span className="text-xs text-slate-300 max-w-[200px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800 p-4">
        <div className="flex gap-2">
          <button
            onClick={handleAttachmentClick}
            className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
            title="Attach file"
            aria-label="Attach file"
            disabled={isSubmitting}
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            accept="*/*"
            aria-label="File upload"
          />
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : "Type your message..."}
              className={`w-full px-3 py-2 bg-slate-700 text-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? 'border border-red-500' : ''
              }`}
              rows={1}
              maxLength={2000}
              aria-label="Message input"
              aria-describedby={validationError ? "validation-error" : undefined}
              disabled={isSubmitting}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              {inputValue.length}/2000
            </div>
            
            {/* @ Agent Selector Dropdown */}
            {showAtAgentSelector && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto at-agent-selector">
                <div className="p-2">
                  <div className="text-xs text-slate-400 mb-2 px-2">
                    {atAgentFilter ? `Filtering: "${atAgentFilter}"` : 'Select an agent:'}
                  </div>
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map((agent, index) => (
                      <button
                        key={agent.name}
                        onClick={() => handleAtAgentSelect(agent)}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                          index === selectedAgentIndex
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-200 hover:bg-slate-700'
                        }`}
                        aria-label={`Select ${agent.name} (${agent.role})`}
                      >
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs opacity-75">{agent.role}</div>
                        <div className="text-xs opacity-60 truncate">{agent.description}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-slate-400">
                      No agents found matching "{atAgentFilter}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isSubmitting || !canSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
        
        {/* Validation Error Display */}
        {validationError && (
          <div id="validation-error" className="mt-2 text-sm text-red-400" role="alert">
            {validationError}
          </div>
        )}
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-200">Select AI Model</h2>
              <button
                onClick={() => setShowModelSelector(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close model selector"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <ModelSelector />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 