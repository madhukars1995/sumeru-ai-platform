import React, { useState, useEffect, useRef } from 'react';

interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
}

export const Terminal: React.FC = () => {
  const [commands, setCommands] = useState<TerminalCommand[]>([
    {
      id: '1',
      command: 'npm install',
      output: 'added 1234 packages in 2.3s',
      status: 'completed',
      timestamp: new Date()
    },
    {
      id: '2',
      command: 'npm run build',
      output: '✓ Built in 699ms',
      status: 'completed',
      timestamp: new Date()
    },
    {
      id: '3',
      command: 'npm run dev',
      output: 'VITE v5.4.19 ready in 114 ms\n➜ Local: http://localhost:5174/',
      status: 'running',
      timestamp: new Date()
    }
  ]);
  const [isFollowing, setIsFollowing] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFollowing && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands, isFollowing]);

  const getStatusIcon = (status: TerminalCommand['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: TerminalCommand['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'running':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-lg">💻</span>
          <h3 className="text-white font-medium">Terminal</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isFollowing 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition-colors">
            Exit
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm"
        style={{ backgroundColor: '#0d1117' }}
      >
        <div className="space-y-4">
          {commands.map((cmd) => (
            <div key={cmd.id} className="space-y-2">
              {/* Command */}
              <div className="flex items-center gap-2">
                <span className={getStatusColor(cmd.status)}>
                  {getStatusIcon(cmd.status)}
                </span>
                <span className="text-green-400">$</span>
                <span className="text-white">{cmd.command}</span>
                <span className="text-slate-500 text-xs">
                  {cmd.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              {/* Output */}
              {cmd.output && (
                <div className="ml-6 text-slate-300 whitespace-pre-wrap">
                  {cmd.output}
                </div>
              )}
            </div>
          ))}
          
          {/* Current Command (if running) */}
          {commands.some(cmd => cmd.status === 'running') && (
            <div className="flex items-center gap-2 text-green-400">
              <span className="animate-pulse">●</span>
              <span>Running...</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white outline-none"
            disabled
          />
        </div>
      </div>
    </div>
  );
}; 