import React, { useState, useEffect } from 'react';

interface CodeReview {
  id: string;
  filePath: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
  timestamp: string;
  reviewer: string;
}

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  line: number;
  message: string;
  suggestion: string;
  category: 'performance' | 'security' | 'style' | 'logic' | 'accessibility';
}

interface CodeSuggestion {
  id: string;
  type: 'refactor' | 'optimization' | 'best_practice' | 'security';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  code: string;
}

interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  performance: number;
  security: number;
  accessibility: number;
}

export const AICodeReview: React.FC = () => {
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeToReview, setCodeToReview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Mock data
  useEffect(() => {
    setReviews([
      {
        id: '1',
        filePath: 'src/components/MetaGPTPanel.tsx',
        status: 'completed',
        timestamp: new Date().toISOString(),
        reviewer: 'AI Assistant',
        issues: [
          {
            id: '1',
            type: 'warning',
            severity: 'medium',
            line: 45,
            message: 'Consider using React.memo for performance optimization',
            suggestion: 'Wrap the component with React.memo to prevent unnecessary re-renders',
            category: 'performance'
          },
          {
            id: '2',
            type: 'info',
            severity: 'low',
            line: 23,
            message: 'Missing TypeScript type annotations',
            suggestion: 'Add explicit type annotations for better code clarity',
            category: 'style'
          }
        ],
        suggestions: [
          {
            id: '1',
            type: 'optimization',
            title: 'Implement React.memo',
            description: 'This component re-renders frequently. Consider using React.memo to optimize performance.',
            impact: 'medium',
            effort: 'easy',
            code: 'export const MetaGPTPanel = React.memo<MetaGPTPanelProps>(({ selectedAgent }) => {'
          },
          {
            id: '2',
            type: 'best_practice',
            title: 'Add error boundaries',
            description: 'Consider wrapping this component with an error boundary for better error handling.',
            impact: 'high',
            effort: 'medium',
            code: '<ErrorBoundary>\n  <MetaGPTPanel />\n</ErrorBoundary>'
          }
        ],
        metrics: {
          complexity: 7,
          maintainability: 85,
          testCoverage: 60,
          performance: 75,
          security: 90,
          accessibility: 80
        }
      },
      {
        id: '2',
        filePath: 'src/utils/smartPollingManager.ts',
        status: 'in_progress',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        reviewer: 'AI Assistant',
        issues: [],
        suggestions: [],
        metrics: {
          complexity: 5,
          maintainability: 90,
          testCoverage: 80,
          performance: 95,
          security: 85,
          accessibility: 70
        }
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'security': return '🔒';
      case 'style': return '🎨';
      case 'logic': return '🧠';
      case 'accessibility': return '♿';
      default: return '📝';
    }
  };

  const handleAnalyzeCode = async () => {
    if (!codeToReview.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newReview: CodeReview = {
        id: Date.now().toString(),
        filePath: selectedFile || 'untitled.tsx',
        status: 'completed',
        timestamp: new Date().toISOString(),
        reviewer: 'AI Assistant',
        issues: [
          {
            id: '1',
            type: 'warning',
            severity: 'medium',
            line: 1,
            message: 'Code analysis completed',
            suggestion: 'This is a simulated review result',
            category: 'style'
          }
        ],
        suggestions: [
          {
            id: '1',
            type: 'best_practice',
            title: 'Code Review Complete',
            description: 'AI analysis has been performed on the provided code.',
            impact: 'medium',
            effort: 'easy',
            code: '// Review completed'
          }
        ],
        metrics: {
          complexity: Math.floor(Math.random() * 10) + 1,
          maintainability: Math.floor(Math.random() * 30) + 70,
          testCoverage: Math.floor(Math.random() * 40) + 60,
          performance: Math.floor(Math.random() * 30) + 70,
          security: Math.floor(Math.random() * 20) + 80,
          accessibility: Math.floor(Math.random() * 30) + 70
        }
      };

      setReviews(prev => [newReview, ...prev]);
      setSelectedReview(newReview);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Review List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Code Reviews
          </h3>
          <button
            onClick={() => setSelectedReview(null)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Review
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {reviews.map(review => (
              <div
                key={review.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedReview?.id === review.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedReview(review)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {review.filePath.split('/').pop()}
                  </h4>
                  <span className={`text-xs ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(review.timestamp).toLocaleString()}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {review.issues.length} issues
                  </span>
                  <span className="text-xs text-gray-500">
                    {review.suggestions.length} suggestions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Details */}
      <div className="flex-1 flex flex-col">
        {selectedReview ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedReview.filePath}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Reviewed by {selectedReview.reviewer} • {new Date(selectedReview.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedReview.status)}`}>
                  {selectedReview.status}
                </span>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Issues and Suggestions */}
              <div className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Issues */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Issues ({selectedReview.issues.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedReview.issues.map(issue => (
                        <div key={issue.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Line {issue.line}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mb-2">
                                {issue.message}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Suggestions ({selectedReview.suggestions.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedReview.suggestions.map(suggestion => (
                        <div key={suggestion.id} className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">💡</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {suggestion.title}
                                </h5>
                                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(suggestion.impact)}`}>
                                  {suggestion.impact} impact
                                </span>
                                <span className="text-xs text-gray-500">
                                  {suggestion.effort} effort
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {suggestion.description}
                              </p>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                <code>{suggestion.code}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Code Metrics
                </h4>
                <div className="space-y-4">
                  {Object.entries(selectedReview.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {value}%
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            value >= 80 ? 'bg-green-500' :
                            value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* New Review Form */
          <div className="flex-1 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              New Code Review
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Path
                </label>
                <input
                  type="text"
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., src/components/App.tsx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code to Review
                </label>
                <textarea
                  value={codeToReview}
                  onChange={(e) => setCodeToReview(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your code here..."
                />
              </div>
              <button
                onClick={handleAnalyzeCode}
                disabled={isAnalyzing || !codeToReview.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 