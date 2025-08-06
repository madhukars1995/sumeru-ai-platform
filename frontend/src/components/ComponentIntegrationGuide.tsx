import React, { useState } from 'react';

interface IntegrationStep {
  id: string;
  title: string;
  description: string;
  code: string;
  status: 'pending' | 'completed' | 'in_progress';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  features: string[];
  dependencies: string[];
  integrationPoints: string[];
}

export const ComponentIntegrationGuide: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>('collaboration');
  const [showCode, setShowCode] = useState<Record<string, boolean>>({});

  const components: Record<string, ComponentInfo> = {
    collaboration: {
      name: 'CollaborationHub',
      description: 'Real-time team collaboration with session management and team member tracking',
      features: [
        'Real-time session management',
        'Team member status tracking',
        'Progress monitoring',
        'Activity feeds',
        'Session creation and management'
      ],
      dependencies: [
        'useSmartPolling hook',
        'React Router',
        'Tailwind CSS'
      ],
      integrationPoints: [
        'DashboardLayout sidebar',
        'Main navigation menu',
        'Team context provider'
      ]
    },
    fileManager: {
      name: 'AdvancedFileManager',
      description: 'Advanced file management with version control and AI-generated file tracking',
      features: [
        'Tree/list/grid view modes',
        'File version history',
        'AI-generated file detection',
        'Search and filtering',
        'File content editing',
        'Version comparison'
      ],
      dependencies: [
        'React state management',
        'File system API',
        'Monaco Editor (optional)'
      ],
      integrationPoints: [
        'File pane in main layout',
        'Editor integration',
        'File tree sidebar'
      ]
    },
    codeReview: {
      name: 'AICodeReview',
      description: 'AI-powered code analysis with performance metrics and improvement suggestions',
      features: [
        'Automated code analysis',
        'Performance metrics',
        'Security scanning',
        'Best practice suggestions',
        'Code quality scoring',
        'Issue categorization'
      ],
      dependencies: [
        'AI analysis API',
        'Code parsing libraries',
        'Metrics calculation'
      ],
      integrationPoints: [
        'Editor context menu',
        'File manager integration',
        'Pull request workflow'
      ]
    },
    performance: {
      name: 'PerformanceDashboard',
      description: 'Real-time system monitoring with alerts and detailed metrics',
      features: [
        'Real-time metrics',
        'System alerts',
        'Performance trends',
        'Resource monitoring',
        'Custom timeframes',
        'Alert management'
      ],
      dependencies: [
        'System metrics API',
        'Chart.js or similar',
        'WebSocket for real-time'
      ],
      integrationPoints: [
        'Admin dashboard',
        'System monitoring page',
        'Alert notifications'
      ]
    }
  };

  const integrationSteps: IntegrationStep[] = [
    {
      id: '1',
      title: 'Add Component to Routes',
      description: 'Add the new component to the main routing configuration',
      code: `// In App.tsx or router configuration
import { CollaborationHub } from './components/CollaborationHub';

// Add to routes
<Route path="/collaboration" element={<CollaborationHub />} />`,
      status: 'pending',
      difficulty: 'easy',
      estimatedTime: '5 minutes'
    },
    {
      id: '2',
      title: 'Update Navigation Menu',
      description: 'Add navigation links to the new components',
      code: `// In navigation component
const menuItems = [
  // ... existing items
  {
    label: 'Collaboration',
    icon: '👥',
    path: '/collaboration'
  },
  {
    label: 'File Manager',
    icon: '📁',
    path: '/files'
  },
  {
    label: 'Code Review',
    icon: '🔍',
    path: '/review'
  },
  {
    label: 'Performance',
    icon: '📊',
    path: '/performance'
  }
];`,
      status: 'pending',
      difficulty: 'easy',
      estimatedTime: '10 minutes'
    },
    {
      id: '3',
      title: 'Integrate with Smart Polling',
      description: 'Connect components to the smart polling system for real-time updates',
      code: `// In each component
import { useSmartPolling } from '../utils/smartPollingManager';

const { registerJob } = useSmartPolling();

useEffect(() => {
  const cleanup = registerJob('component-updates', async () => {
    // Update component data
  }, 30000, 'medium');
  
  return cleanup;
}, [registerJob]);`,
      status: 'pending',
      difficulty: 'medium',
      estimatedTime: '15 minutes'
    },
    {
      id: '4',
      title: 'Add to Dashboard Layout',
      description: 'Integrate components into the main dashboard layout',
      code: `// In DashboardLayout.tsx
import { CollaborationHub } from './components/CollaborationHub';
import { AdvancedFileManager } from './components/AdvancedFileManager';

// Add to layout configuration
const layoutComponents = {
  collaboration: CollaborationHub,
  fileManager: AdvancedFileManager,
  // ... other components
};`,
      status: 'pending',
      difficulty: 'medium',
      estimatedTime: '20 minutes'
    },
    {
      id: '5',
      title: 'Configure API Endpoints',
      description: 'Set up backend API endpoints for the new components',
      code: `# Backend API endpoints needed
GET /api/collaboration/sessions
POST /api/collaboration/sessions
GET /api/files/tree
GET /api/files/content/:path
POST /api/review/analyze
GET /api/performance/metrics`,
      status: 'pending',
      difficulty: 'hard',
      estimatedTime: '1 hour'
    },
    {
      id: '6',
      title: 'Add Error Handling',
      description: 'Implement comprehensive error handling for all new components',
      code: `// Error boundary wrapper
<ErrorBoundary fallback={<ErrorFallback />}>
  <CollaborationHub />
</ErrorBoundary>

// Component-level error handling
try {
  const data = await apiCall();
  setData(data);
} catch (error) {
  setError(error.message);
  console.error('Component error:', error);
}`,
      status: 'pending',
      difficulty: 'medium',
      estimatedTime: '30 minutes'
    }
  ];

  const toggleCode = (stepId: string) => {
    setShowCode(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedComponentInfo = components[selectedComponent];

  return (
    <div className="h-full flex bg-slate-900 rounded-lg shadow-lg">
      {/* Component Selection */}
      <div className="w-1/3 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-medium text-slate-200 mb-4">
            New Components
          </h3>
          <div className="space-y-2">
            {Object.entries(components).map(([key, component]) => (
              <button
                key={key}
                onClick={() => setSelectedComponent(key)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedComponent === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <h4 className="font-medium text-slate-200">
                  {component.name}
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  {component.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Component Details */}
        <div className="flex-1 p-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Component Details
          </h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Features
              </h5>
              <ul className="space-y-1">
                {selectedComponentInfo.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Dependencies
              </h5>
              <ul className="space-y-1">
                {selectedComponentInfo.dependencies.map((dep, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span className="text-blue-500 mr-2">📦</span>
                    {dep}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Integration Points
              </h5>
              <ul className="space-y-1">
                {selectedComponentInfo.integrationPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span className="text-purple-500 mr-2">🔗</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Steps */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Integration Steps
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Follow these steps to integrate {selectedComponentInfo.name} into your Sumeru AI system
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {integrationSteps.map(step => (
              <div key={step.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {step.id}.
                      </span>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        {step.title}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(step.difficulty)}`}>
                        {step.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⏱️ {step.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCode(step.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    {showCode[step.id] ? 'Hide Code' : 'Show Code'}
                  </button>
                </div>
                
                {showCode[step.id] && (
                  <div className="mt-3">
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      <code className="text-gray-800 dark:text-gray-200">{step.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 