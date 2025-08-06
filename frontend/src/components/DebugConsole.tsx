import React, { useEffect, useState } from 'react';

export const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `ERROR: ${message}`]);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `WARN: ${message}`]);
      originalWarn.apply(console, args);
    };

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `LOG: ${message}`]);
      originalLog.apply(console, args);
    };

    // Test component loading
    console.log('DebugConsole: Component loaded successfully');
    console.log('DebugConsole: Checking component imports...');

    // Test component imports
    try {
      const { CollaborationHub } = require('./CollaborationHub');
      console.log('DebugConsole: CollaborationHub imported successfully');
    } catch (error) {
      console.error('DebugConsole: Failed to import CollaborationHub:', error);
    }

    try {
      const { AdvancedFileManager } = require('./AdvancedFileManager');
      console.log('DebugConsole: AdvancedFileManager imported successfully');
    } catch (error) {
      console.error('DebugConsole: Failed to import AdvancedFileManager:', error);
    }

    try {
      const { AICodeReview } = require('./AICodeReview');
      console.log('DebugConsole: AICodeReview imported successfully');
    } catch (error) {
      console.error('DebugConsole: Failed to import AICodeReview:', error);
    }

    try {
      const { PerformanceDashboard } = require('./PerformanceDashboard');
      console.log('DebugConsole: PerformanceDashboard imported successfully');
    } catch (error) {
      console.error('DebugConsole: Failed to import PerformanceDashboard:', error);
    }

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
      >
        🐛 Debug ({logs.length})
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 left-0 w-96 h-64 bg-gray-900 text-green-400 p-4 rounded border border-gray-700 overflow-auto text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Debug Console</h3>
            <button
              onClick={() => setLogs([])}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 