import React from 'react';
import { CanvasPattern } from './CanvasPattern';
import { MetaGPTPanel } from './MetaGPTPanel';
import { AgentStatusPanel } from './AgentStatusPanel';
import { AgentOutputPanel } from './AgentOutputPanel';

interface AppCanvasProps {
  children?: React.ReactNode;
  hasOpenFile?: boolean;
  className?: string;
  activeTool?: string | null;
  selectedAgent?: string | null;
}

export const AppCanvas: React.FC<AppCanvasProps> = ({ activeTool, selectedAgent }) => {
  console.log('AppCanvas received activeTool:', activeTool, 'selectedAgent:', selectedAgent);
  
  const renderToolContent = () => {
    const fullScreenStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      padding: 'var(--space-8)',
      margin: 0
    };

    switch (activeTool) {
      case 'terminal':
        return (
          <div style={fullScreenStyle}>
            <h2>Terminal</h2>
            <p>Command line interface coming soon...</p>
          </div>
        );
      case 'preview':
        return (
          <div style={fullScreenStyle}>
            <h2>Preview</h2>
            <p>Live preview of your work coming soon...</p>
          </div>
        );
      case 'code':
        return (
          <div style={fullScreenStyle}>
            <h2>Code Editor</h2>
            <p>Advanced code editor coming soon...</p>
          </div>
        );
      case 'metagpt':
        return <MetaGPTPanel selectedAgent={selectedAgent} />;
      case 'agents':
        return <AgentStatusPanel />;
      case 'outputs':
        return <AgentOutputPanel />;
      default:
        return (
          <div className="welcome">
            <h2>Welcome to Sumeru AI</h2>
            <p>Select a tool from the utility rail to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="canvas" style={{ 
      position: 'relative',
      width: activeTool ? '100%' : '100%',
      height: activeTool ? '100%' : '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {!activeTool && <CanvasPattern />}
      {renderToolContent()}
    </div>
  );
}; 