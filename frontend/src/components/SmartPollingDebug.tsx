import React, { useState, useEffect } from 'react';
import { useSmartPolling } from '../utils/smartPollingManager';

interface SmartPollingDebugProps {
  isVisible?: boolean;
}

export const SmartPollingDebug: React.FC<SmartPollingDebugProps> = ({ isVisible = false }) => {
  const [stats, setStats] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { getStats, setAdaptiveMode, clearStats } = useSmartPolling();

  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [getStats]);

  if (!isVisible || !import.meta.env.DEV) {
    return null;
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Smart Polling Debug
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
          <button
            onClick={clearStats}
            className="text-xs px-2 py-1 bg-red-200 dark:bg-red-700 rounded hover:bg-red-300 dark:hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-2 text-xs">
          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <div className="font-medium">Total Jobs</div>
              <div className="text-lg">{stats.globalStats.totalJobs}</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <div className="font-medium">Active Jobs</div>
              <div className={`text-lg ${getStatusColor(stats.globalStats.activeJobs > 0)}`}>
                {stats.globalStats.activeJobs}
              </div>
            </div>
          </div>

          {/* Adaptive Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Adaptive Mode</span>
            <button
              onClick={() => setAdaptiveMode(!stats.globalStats.adaptiveMode)}
              className={`px-2 py-1 rounded text-xs ${
                stats.globalStats.adaptiveMode
                  ? 'bg-green-200 dark:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {stats.globalStats.adaptiveMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Job Details */}
          {showDetails && (
            <div className="space-y-2">
              <div className="font-medium border-t pt-2">Job Details</div>
              {stats.jobStats.map((job: any) => (
                <div key={job.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{job.id}</span>
                    <span className={`${getPriorityColor(job.priority)} font-medium`}>
                      {job.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className={getStatusColor(job.isActive)}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Interval: </span>
                      <span>{Math.round(job.adaptiveInterval / 1000)}s</span>
                    </div>
                  </div>
                  {job.stats && (
                    <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
                      <div>
                        <span className="text-gray-500">Calls: </span>
                        <span>{job.stats.totalCalls}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success: </span>
                        <span className="text-green-600">{job.stats.successfulCalls}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Failed: </span>
                        <span className="text-red-600">{job.stats.failedCalls}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 