import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './components/HomePage';
import { ChatPanel } from './components/ChatPanel';
import { AdvancedFileManager } from './components/AdvancedFileManager';
import { CollaborationHub } from './components/CollaborationHub';
import { AICodeReview } from './components/AICodeReview';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { ComponentIntegrationGuide } from './components/ComponentIntegrationGuide';
import { CollaborativeWorkflow } from './components/CollaborativeWorkflow';

function App() {
  return (
    <Router>
      <div className="sumeru-ai-app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chat" element={<DashboardLayout><ChatPanel /></DashboardLayout>} />
          <Route path="/files" element={<DashboardLayout><AdvancedFileManager /></DashboardLayout>} />
          <Route path="/collaboration" element={<DashboardLayout><CollaborationHub /></DashboardLayout>} />
          <Route path="/code-review" element={<DashboardLayout><AICodeReview /></DashboardLayout>} />
          <Route path="/performance" element={<DashboardLayout><PerformanceDashboard /></DashboardLayout>} />
          <Route path="/integration" element={<DashboardLayout><ComponentIntegrationGuide /></DashboardLayout>} />
          <Route path="/workflows" element={<DashboardLayout><CollaborativeWorkflow /></DashboardLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
