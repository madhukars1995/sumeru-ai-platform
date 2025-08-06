import React from 'react';
import { useLocation } from 'react-router-dom';
import { TeamRibbon } from '../components/TeamRibbon';
import { ChatPanel } from '../components/ChatPanel';
import { CurrentProjects } from '../components/CurrentProjects';
import { UtilityRail } from '../components/ui/UtilityRail';
import { MetaGPTPanel } from '../components/MetaGPTPanel';
import { FileManager } from '../components/FileManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { AgentOutputPanel } from '../components/AgentOutputPanel';
import { CollaborationHub } from '../components/CollaborationHub';
import { AICodeReview } from '../components/AICodeReview';
import { PerformanceDashboard } from '../components/PerformanceDashboard';
import { QuotaPanel } from '../components/QuotaPanel';
import { AgentSelector } from '../components/AgentSelector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  const handleToolChange = (tool: string | null) => {
    setActiveTool(tool);
  };

  // Render content based on active tool
  const renderToolContent = () => {
    switch (activeTool) {
      case 'metagpt':
        return <MetaGPTPanel />;
      case 'folder':
        return <FileManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'quota':
        return <QuotaPanel />;
      case 'agents':
        return <AgentSelector />;
      case 'outputs':
        return <AgentOutputPanel />;
      case 'projects':
        return <CurrentProjects />;
      case 'collaboration':
        return <CollaborationHub />;
      case 'files':
        return <FileManager />;
      case 'review':
        return <AICodeReview />;
      case 'performance':
        return <PerformanceDashboard />;
      default:
        // Show CurrentProjects in main content when on chat page, otherwise show children
        const isChatPage = location.pathname === '/chat';
        return isChatPage ? <CurrentProjects /> : children;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Top Navigation */}
      <TeamRibbon />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 flex-shrink-0">
          <ChatPanel />
        </div>
        
        {/* Center Panel - Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderToolContent()}
        </div>
        
        {/* Right Panel - Utility Rail */}
        <div className="bg-slate-800 border-l border-slate-700 flex-shrink-0" style={{ width: 'var(--rail-width)' }}>
          <UtilityRail 
            activeTool={activeTool}
            onToolChange={handleToolChange}
          />
        </div>
      </div>
    </div>
  );
}; 