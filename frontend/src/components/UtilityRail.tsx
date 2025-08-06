import React from 'react';

interface UtilityRailProps {
  activeTool?: string;
  onToolChange?: (toolId: string) => void;
}

export const UtilityRail = ({ activeTool = 'terminal', onToolChange }: UtilityRailProps) => {
  const tools = [
    { id: 'terminal', icon: 'terminal', label: 'Terminal' },
    { id: 'preview', icon: 'preview', label: 'App Viewer' },
    { id: 'code', icon: 'code', label: 'Editor' },
    { id: 'folder', icon: 'folder', label: 'Files' }
  ];

  return (
    <aside className="utility-rail">
      {tools.map(tool => {
        const isActive = activeTool === tool.id;
        return (
          <div key={tool.id} className="rail-item">
            <button
              onClick={() => onToolChange?.(tool.id)}
              className={`rail-button ${isActive ? 'active' : ''}`}
              title={tool.label}
            >
              <span className="material-icons">{tool.icon}</span>
            </button>
            <div className="rail-label">{tool.label}</div>
          </div>
        );
      })}
    </aside>
  );
}; 