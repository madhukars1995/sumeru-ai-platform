import React, { useMemo, useCallback } from 'react';

interface Tool {
  id: string;
  label: string;
  icon: string;
  description: string;
  shortcut: string;
  hasIndicator: boolean;
  category: string;
}

interface UtilityRailProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
}

export const UtilityRail: React.FC<UtilityRailProps> = ({ activeTool, onToolChange }) => {
  const tools: Tool[] = useMemo(() => [
    {
      id: 'metagpt',
      label: 'MetaGPT',
      icon: '🤖',
      description: 'AI agent management',
      shortcut: '⌘1',
      hasIndicator: true,
      category: 'ai'
    },
    {
      id: 'folder',
      label: 'File Manager',
      icon: '📁',
      description: 'Project files',
      shortcut: '⌘2',
      hasIndicator: true,
      category: 'management'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      description: 'Performance metrics',
      shortcut: '⌘3',
      hasIndicator: true,
      category: 'monitoring'
    },
    {
      id: 'quota',
      label: 'Quota Monitor',
      icon: '💳',
      description: 'Model quota and usage',
      shortcut: '⌘Q',
      hasIndicator: true,
      category: 'monitoring'
    },
    {
      id: 'agents',
      label: 'Agent Selector',
      icon: '👥',
      description: 'Select and manage agents',
      shortcut: '⌘A',
      hasIndicator: true,
      category: 'management'
    },
    {
      id: 'outputs',
      label: 'Agent Outputs',
      icon: '📄',
      description: 'Generated content',
      shortcut: '⌘4',
      hasIndicator: true,
      category: 'management'
    },
    {
      id: 'projects',
      label: 'Current Projects',
      icon: '🚀',
      description: 'Active projects',
      shortcut: '⌘5',
      hasIndicator: true,
      category: 'management'
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: '👥',
      description: 'Team collaboration hub',
      shortcut: '⌘6',
      hasIndicator: true,
      category: 'collaboration'
    },
    {
      id: 'review',
      label: 'Code Review',
      icon: '🔍',
      description: 'AI-powered code analysis',
      shortcut: '⌘R',
      hasIndicator: true,
      category: 'ai'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: '📊',
      description: 'System monitoring dashboard',
      shortcut: '⌘P',
      hasIndicator: true,
      category: 'monitoring'
    }
  ], []);

  const getCategoryColor = useCallback((category: string): string => {
    switch (category) {
      case 'ai': return '#10b981';
      case 'management': return '#3b82f6';
      case 'communication': return '#8b5cf6';
      case 'monitoring': return '#f59e0b';
      case 'collaboration': return '#f59e0b';
      default: return '#6b7280';
    }
  }, []);

  const handleToolClick = useCallback((toolId: string) => {
    onToolChange(activeTool === toolId ? null : toolId);
  }, [activeTool, onToolChange]);

  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        const categoryColor = getCategoryColor(tool.category);
        
        return (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200
              min-h-[60px] relative group
              ${isActive
                ? 'bg-blue-600/10 border border-blue-600 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent'
              }
            `}
            aria-label={`${tool.description} (${tool.shortcut})`}
            title={`${tool.description} - ${tool.shortcut}`}
          >
            <div className="text-lg mb-1">
              {tool.icon}
            </div>
            <div className="text-xs font-medium text-center leading-tight">
              {tool.label}
            </div>
            {tool.hasIndicator && (
              <div 
                className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-80"
                style={{ backgroundColor: categoryColor }}
              />
            )}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
}; 