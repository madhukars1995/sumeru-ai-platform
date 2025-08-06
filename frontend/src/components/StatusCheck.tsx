import React, { useEffect, useState } from 'react';

interface ComponentStatus {
  name: string;
  loaded: boolean;
  error?: string;
}

export const StatusCheck: React.FC = () => {
  const [statuses, setStatuses] = useState<ComponentStatus[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkComponents = async () => {
      const components = [
        { name: 'CollaborationHub', import: () => import('./CollaborationHub') },
        { name: 'AdvancedFileManager', import: () => import('./AdvancedFileManager') },
        { name: 'AICodeReview', import: () => import('./AICodeReview') },
        { name: 'PerformanceDashboard', import: () => import('./PerformanceDashboard') },
        { name: 'ComponentIntegrationGuide', import: () => import('./ComponentIntegrationGuide') },
        { name: 'SmartPollingManager', import: () => import('../utils/smartPollingManager') },
      ];

      const results: ComponentStatus[] = [];

      for (const component of components) {
        try {
          await component.import();
          results.push({ name: component.name, loaded: true });
          console.log(`✅ ${component.name} loaded successfully`);
        } catch (error) {
          results.push({ 
            name: component.name, 
            loaded: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
          console.error(`❌ ${component.name} failed to load:`, error);
        }
      }

      setStatuses(results);
    };

    checkComponents();
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  const allLoaded = statuses.every(s => s.loaded);
  const errorCount = statuses.filter(s => !s.loaded).length;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-3 py-2 rounded text-sm ${
          allLoaded 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}
      >
        {allLoaded ? '✅ All Good' : `❌ ${errorCount} Errors`}
      </button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            Component Status
          </h3>
          <div className="space-y-2">
            {statuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {status.name}
                </span>
                <div className="flex items-center space-x-2">
                  {status.loaded ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-red-600">❌</span>
                  )}
                  {status.error && (
                    <span className="text-xs text-red-500" title={status.error}>
                      {status.error.substring(0, 20)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 