import React, { useState } from 'react';
import { QuotaMonitor } from './QuotaMonitor';
import { ModelSelector } from './ModelSelector';
import { modelAPI } from '../services/api';

export const QuotaPanel: React.FC = () => {
  const [isAutoSwitching, setIsAutoSwitching] = useState(false);

  const handleAutoSwitch = async () => {
    setIsAutoSwitching(true);
    try {
      const result = await modelAPI.autoSwitchModel();
      console.log('Auto-switch result:', result);
      // You could show a notification here
    } catch (error) {
      console.error('Auto-switch failed:', error);
    } finally {
      setIsAutoSwitching(false);
    }
  };

  return (
    <div className="quota-panel h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quota Management</h1>
          <p className="text-gray-600">
            Monitor and manage AI model quotas. Models are automatically disabled when quota is exhausted.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quota Monitor */}
          <div className="lg:col-span-2">
            <QuotaMonitor />
          </div>
          
          {/* Model Selector */}
          <div className="lg:col-span-2">
            <ModelSelector />
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">🔄</span>
                  <div>
                    <div className="font-medium text-gray-800">Refresh Quotas</div>
                    <div className="text-sm text-gray-600">Update quota data</div>
                  </div>
                </div>
                <span className="text-blue-600">→</span>
              </button>
              
              <button 
                onClick={handleAutoSwitch}
                disabled={isAutoSwitching}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isAutoSwitching 
                    ? 'bg-gray-50 cursor-not-allowed' 
                    : 'bg-yellow-50 hover:bg-yellow-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">⚡</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {isAutoSwitching ? 'Auto-Switching...' : 'Auto-Switch Model'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isAutoSwitching ? 'Finding available model...' : 'Switch to available model'}
                    </div>
                  </div>
                </div>
                {isAutoSwitching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                ) : (
                  <span className="text-yellow-600">→</span>
                )}
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">⚡</span>
                  <div>
                    <div className="font-medium text-gray-800">Switch to Fast Model</div>
                    <div className="text-sm text-gray-600">Use Llama 4 Scout</div>
                  </div>
                </div>
                <span className="text-green-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">🔍</span>
                  <div>
                    <div className="font-medium text-gray-800">Switch to Gemini</div>
                    <div className="text-sm text-gray-600">Use Gemini 1.5 Flash</div>
                  </div>
                </div>
                <span className="text-purple-600">→</span>
              </button>
            </div>
          </div>
          
          {/* Quota Alerts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quota Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="mr-3">⚠️</span>
                <div>
                  <div className="font-medium text-yellow-800">Low Quota Warning</div>
                  <div className="text-sm text-yellow-700">Some models are approaching limits</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <span className="mr-3">❌</span>
                <div>
                  <div className="font-medium text-red-800">Exhausted Models</div>
                  <div className="text-sm text-red-700">3 models have no remaining quota</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="mr-3">✅</span>
                <div>
                  <div className="font-medium text-green-800">Available Models</div>
                  <div className="text-sm text-green-700">5 models are ready to use</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Usage Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Usage Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Daily Limits</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• Reset at midnight UTC</li>
                <li>• Monitor usage throughout the day</li>
                <li>• Switch models if approaching limits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Monthly Limits</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• Reset on the 1st of each month</li>
                <li>• Plan usage across the month</li>
                <li>• Consider upgrading if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 