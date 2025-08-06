import React, { useState } from 'react';
import { TeamRibbon } from './TeamRibbon';
import { ChatPanel } from './ChatPanel';
import { UtilityRail } from './ui/UtilityRail';
import { MetaGPTPanel } from './MetaGPTPanel';
import { FileManager } from './FileManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import { AgentOutputPanel } from './AgentOutputPanel';
import { CollaborationHub } from './CollaborationHub';
import { AICodeReview } from './AICodeReview';
import { PerformanceDashboard } from './PerformanceDashboard';
import { CurrentProjects } from './CurrentProjects';
import { DashboardMetrics } from './DashboardMetrics';
import { OnboardingGuide } from './OnboardingGuide';
import { QuotaMonitor } from './QuotaMonitor';

export const HomePage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleOpenMetaGPT = () => {
    setActiveTool('metagpt');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'conversations':
        setActiveTool('metagpt');
        break;
      case 'file-manager':
        setActiveTool('folder');
        break;
      case 'analytics':
        setActiveTool('analytics');
        break;
      case 'outputs':
        setActiveTool('outputs');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const handleToolChange = (tool: string | null) => {
    setActiveTool(tool);
  };

  const handleOnboardingAction = (action: string) => {
    setActiveTool(action);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Render content based on active tool
  const renderToolContent = () => {
    switch (activeTool) {
      case 'metagpt':
        return <MetaGPTPanel />;
      case 'folder':
      case 'files':
        return <FileManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'outputs':
        return <AgentOutputPanel />;
      case 'projects':
        return <CurrentProjects />;
      case 'collaboration':
        return <CollaborationHub />;
      case 'review':
        return <AICodeReview />;
      case 'performance':
        return <PerformanceDashboard />;
      default:
        return showOnboarding ? (
          <OnboardingGuide 
            onComplete={handleOnboardingComplete}
            onAction={handleOnboardingAction}
          />
        ) : (
          <div className="dashboard-welcome p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="dashboard-title">
                  Welcome to Your AI Workspace
                </h1>
                <p className="dashboard-subtitle">
                  Your AI-powered development workspace
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
              >
                🎓 Show Tutorial
              </button>
            </div>
            
            <div className="dashboard-grid">
              {/* MetaGPT Card */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    🤖 MetaGPT
                  </div>
                  <button
                    onClick={handleOpenMetaGPT}
                    className="btn btn-primary"
                  >
                    Open
                  </button>
                </div>
                
                <div className="dashboard-card-actions">
                  <button
                    onClick={() => handleQuickAction('conversations')}
                    className="dashboard-action-btn"
                  >
                    🚀 Create Project
                  </button>
                  <button
                    onClick={() => handleQuickAction('conversations')}
                    className="dashboard-action-btn"
                  >
                    ⚡ Run Task
                  </button>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    ⚡ Quick Actions
                  </div>
                </div>
                
                <div className="dashboard-card-actions">
                  <button
                    onClick={() => handleQuickAction('file-manager')}
                    className="dashboard-action-btn"
                  >
                    📁 Open File Manager
                  </button>
                  <button
                    onClick={() => handleQuickAction('conversations')}
                    className="dashboard-action-btn"
                  >
                    💬 View Conversations
                  </button>
                  <button
                    onClick={() => handleQuickAction('analytics')}
                    className="dashboard-action-btn"
                  >
                    📊 Check Analytics
                  </button>
                  <button
                    onClick={() => handleQuickAction('outputs')}
                    className="dashboard-action-btn"
                  >
                    📄 Agent Outputs
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Metrics */}
            <DashboardMetrics />
            
            {/* Quota Monitor */}
            <div className="mt-6">
              <QuotaMonitor />
            </div>
          </div>
        );
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