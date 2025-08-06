import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { ModelSelector } from './ModelSelector';
import AlertSystem from './AlertSystem';

interface Message {
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

interface ThinkingStep {
  step: string;
  status: 'pending' | 'working' | 'completed' | 'error';
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: number;
}

export const TaskSidebar = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
  }, []);

  // Initialize with some example alerts
  useEffect(() => {
    setAlerts([
      {
        id: 'credits',
        type: 'info',
        message: '433.06K / 2.50M credits remaining',
        action: {
          label: 'Upgrade',
          onClick: () => console.log('Upgrade clicked')
        },
        dismissible: true,
        autoDismiss: 10000 // 10 seconds
      }
    ]);
  }, []);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages();
      const transformedMessages: Message[] = response.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender || (msg.message_type === 'user' ? 'You' : 'Assistant'),
        message: msg.message,
        timestamp: msg.timestamp,
        avatar: msg.avatar || (msg.message_type === 'user' ? '👤' : '🤖'),
        message_type: msg.message_type,
        model: msg.model
      }));
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setAlerts(prev => [...prev, {
        id: 'load-error',
        type: 'error',
        message: 'Failed to load messages',
        dismissible: true,
        autoDismiss: 5000
      }]);
    }
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && uploadedFiles.length === 0) return;

    const userMessage: Message = {
      sender: 'You',
      message: trimmedMessage,
      avatar: '👤',
      message_type: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to API:', trimmedMessage);
      const response = await chatAPI.sendMessage({
        sender: 'You',
        message: trimmedMessage,
        avatar: '👤',
        message_type: 'user'
      });

      console.log('API response:', response);
      const aiMessage: Message = {
        sender: 'Assistant',
        message: response.message || 'I received your message.',
        avatar: '🤖',
        message_type: 'assistant',
        timestamp: Date.now(),
        model: response.model
      };

      console.log('Adding AI message:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setAlerts(prev => [...prev, {
        id: 'send-error',
        type: 'error',
        message: 'Failed to send message',
        dismissible: true,
        autoDismiss: 5000
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    
    // Simple markdown rendering for code blocks and inline code
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let result = text
      .replace(codeBlockRegex, (match, lang, code) => {
        return `<pre style="background: var(--bg-canvas); padding: var(--space-3); border-radius: var(--radius-md); overflow-x: auto; margin: var(--space-2) 0;"><code style="font-size: var(--font-size-sm); font-family: 'Monaco', 'Menlo', monospace;">${code}</code></pre>`;
      })
      .replace(inlineCodeRegex, '<code style="background: var(--bg-canvas); padding: 2px 4px; border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-family: monospace;">$1</code>');
    
    return <div dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleThinkingBlock = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isThinkingExpanded: !msg.isThinkingExpanded } : msg
    ));
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-rail)' }}>
      {/* Header */}
      <div className="task-header" style={{ 
        padding: 'var(--space-4)', 
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-primary)',
        flexShrink: 0
      }}>
        <h2 style={{ 
          fontSize: 'var(--font-size-lg)', 
          fontWeight: 'var(--font-weight-semibold)', 
          color: 'var(--text-primary)',
          margin: '0 0 var(--space-1) 0'
        }}>
          Chat
        </h2>
        <p style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--text-secondary)',
          margin: 0,
          paddingLeft: '16px'
        }}>
          AI-powered development workspace
        </p>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="message-feed flex-1 overflow-y-auto smooth-scroll" 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%'
        }}
      >
        {/* Model Selector */}
        <ModelSelector />

        {/* Messages */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'You' || msg.message_type === 'user';
          const isAssistant = msg.sender === 'Assistant' || msg.message_type === 'assistant' || msg.avatar === '🤖';
          
          return (
            <React.Fragment key={msg.id || index}>
              <div 
                className={`message-bubble ${isUser ? 'user' : isAssistant ? 'assistant' : ''}`}
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                <time>
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                </time>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 'var(--space-3)',
                width: '100%'
              }}>
                {!isUser && (
                  <div 
                    className="avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-base)',
                      backgroundColor: 'var(--accent-success)',
                      color: 'white',
                      flexShrink: 0
                    }}
                  >
                    {msg.avatar}
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <p style={{ 
                      fontWeight: 'var(--font-weight-semibold)', 
                      color: isUser ? 'white' : 'var(--text-primary)',
                      margin: 0,
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      {msg.sender}
                    </p>
                  </div>
                  
                  <div style={{ 
                    color: isUser ? 'white' : 'var(--text-primary)',
                    lineHeight: 'var(--line-height-relaxed)',
                    fontSize: 'var(--font-size-sm)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {renderMarkdownText(msg.message)}
                  </div>
                  
                  {msg.model && msg.model !== 'auto' && (
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', 
                      marginTop: 'var(--space-2)',
                      textAlign: isUser ? 'right' : 'left'
                    }}>
                      Using: {msg.model}
                    </div>
                  )}
                  
                  {msg.is_working && (
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-2)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)'
                      }}>
                        <div className="loading-dots">
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                        </div>
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {isUser && (
                  <div 
                    className="avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-base)',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      flexShrink: 0
                    }}
                  >
                    {msg.avatar}
                  </div>
                )}
              </div>
            </div>
            
            {/* AI Thinking Block */}
            {isAssistant && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
              <div 
                className={`ai-thinking ${msg.isThinkingExpanded ? '' : 'collapsed'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleThinkingBlock(index);
                  }
                }}
              >
                <button 
                  className="toggle"
                  onClick={() => toggleThinkingBlock(index)}
                  aria-expanded={!msg.isThinkingExpanded}
                >
                  <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                  <span className="label">
                    <span className="role">Thinking</span>
                    <span className="steps">{msg.thinkingSteps.length} Steps</span>
                  </span>
                </button>
                <div className="content">
                  {msg.thinkingSteps.map((step, stepIndex) => (
                    <div key={stepIndex} style={{ marginBottom: 'var(--space-2)' }}>
                      • {step.step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </React.Fragment>
        );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer with Chat Input */}
      <div className="composer-bar" style={{ flexShrink: 0 }}>
        {/* File Upload Area */}
        {uploadedFiles.length > 0 && (
          <div style={{ 
            marginBottom: 'var(--space-3)', 
            padding: 'var(--space-3)', 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {uploadedFiles.map((file, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-2)', 
                  padding: 'var(--space-2)', 
                  background: 'var(--bg-canvas)', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>📎 {file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    style={{ 
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-base)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-3)',
          width: '100%'
        }}>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button 
              className="rail-button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload files"
              style={{ width: '32px', height: '32px' }}
            >
              <span style={{ fontSize: 'var(--font-size-base)' }}>+</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
          
          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            <button
              onClick={handleSend}
              disabled={isLoading || (!message.trim() && uploadedFiles.length === 0)}
              className="send-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: isLoading || (!message.trim() && uploadedFiles.length === 0) 
                  ? 'var(--bg-muted)' 
                  : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                color: isLoading || (!message.trim() && uploadedFiles.length === 0) 
                  ? 'var(--text-muted)' 
                  : 'white',
                cursor: isLoading || (!message.trim() && uploadedFiles.length === 0) 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all var(--duration-fast) var(--ease-out)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-medium)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && (message.trim() || uploadedFiles.length > 0)) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 'var(--font-size-lg)' }}>→</span>
              )}
            </button>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (or drag files here)"
          disabled={isLoading}
          className="composer-input"
          rows={3}
          style={{ 
            resize: 'vertical'
          }}
        />
        
        {/* Credits and Upgrade */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)'
        }}>
          <span>433.06K / 2.50M credits remaining</span>
          <button style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}>
            <span>Upgrade</span>
            <span>×</span>
          </button>
        </div>
      </div>

      {/* Alert System */}
      <AlertSystem />
    </div>
  );
}; 