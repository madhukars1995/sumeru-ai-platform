import React, { useState, useEffect } from 'react';
import { modelAPI } from '../services/api';

interface ModelInfo {
  provider: string;
  model: string;
  isAvailable: boolean;
  dailyUsed: number;
  dailyLimit: number;
  dailyPercentage: number;
  monthlyUsed: number;
  monthlyLimit: number;
  monthlyPercentage: number;
  status: 'available' | 'low' | 'exhausted' | 'payment_required';
}

interface AvailableModelsResponse {
  auto_mode: {
    enabled: boolean;
    categories: Record<string, {
      models: string[];
      priority: string[];
      providers: string[];
      description: string;
    }>;
  };
  providers: Record<string, {
    name: string;
    description: string;
    models: string[];
  }>;
}

export const ModelSelector: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModel, setCurrentModel] = useState<{ provider: string; model: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setError(null);
      console.log('Fetching models...');
      
      // Get current model
      const current = await modelAPI.getCurrentModel();
      console.log('Current model received:', current);
      setCurrentModel(current);
      
      // Get available models
      const availableModelsResponse = await modelAPI.getAvailableModels() as unknown as AvailableModelsResponse;
      console.log('Available models response:', availableModelsResponse);
      
      // Get quotas
      const quotasResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/quotas`);
      const quotas = await quotasResponse.json();
      console.log('Quotas received:', quotas);
      
      const modelList: ModelInfo[] = [];
      
      // Process each provider and their models
      for (const [provider, providerData] of Object.entries(quotas)) {
        console.log(`Processing provider: ${provider}`, providerData);
        
        for (const [model, quotaData] of Object.entries(providerData as Record<string, any>)) {
          console.log(`Processing model: ${model}`, quotaData);
          
          const dailyPercentage = quotaData.daily.percentage;
          const monthlyPercentage = quotaData.monthly.percentage;
          
          let status: ModelInfo['status'] = 'available';
          if (dailyPercentage >= 100 || monthlyPercentage >= 100) {
            status = 'exhausted';
          } else if (dailyPercentage >= 90 || monthlyPercentage >= 90) {
            status = 'low';
          }
          
          // Get display name from available models
          let displayName = model;
          if (availableModelsResponse.providers[provider]) {
            const providerModels = availableModelsResponse.providers[provider].models;
            const modelIndex = providerModels.findIndex(m => m.toLowerCase().includes(model.toLowerCase()));
            if (modelIndex !== -1) {
              displayName = providerModels[modelIndex];
            }
          }
          
          modelList.push({
            provider,
            model: displayName,
            isAvailable: status === 'available' || status === 'low',
            dailyUsed: quotaData.daily.used,
            dailyLimit: quotaData.daily.limit,
            dailyPercentage,
            monthlyUsed: quotaData.monthly.used,
            monthlyLimit: quotaData.monthly.limit,
            monthlyPercentage,
            status
          });
        }
      }
      
      console.log('Processed model list:', modelList);
      setModels(modelList);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setError(`Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const switchModel = async (provider: string, model: string) => {
    console.log(`Attempting to switch to model: ${provider}/${model}`);
    setIsSwitching(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Convert display name back to internal name
      const internalModelName = getInternalModelName(provider, model);
      console.log(`Using internal model name: ${internalModelName}`);
      
      await modelAPI.changeModel(provider, internalModelName);
      console.log(`Successfully switched to ${provider}/${internalModelName}`);
      setCurrentModel({ provider, model: internalModelName });
      setSuccessMessage(`Successfully switched to ${model}`);
      
      // Refresh the models list
      await fetchModels();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to switch model:', error);
      setError(`Failed to switch model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSwitching(false);
    }
  };

  const getInternalModelName = (provider: string, displayName: string): string => {
    // Map display names back to internal names
    const modelMapping: Record<string, Record<string, string>> = {
      'gpt_oss': {
        'GPT-OSS-20B': 'gpt-oss-20b'
      },
      'gemini': {
        'Gemini 1.5 Flash': 'gemini-1.5-flash',
        'Gemini 1.5 Pro': 'gemini-1.5-pro',
        'Gemini 2.0 Flash': 'gemini-2.0-flash'
      },
      'openrouter': {
        'Claude 3.5 Sonnet': 'claude-3.5-sonnet',
        'GPT-4 Turbo': 'gpt-4-turbo',
        'GPT-4o': 'gpt-4o',
        'Claude 3 Haiku': 'claude-3-haiku',
        'Mistral 7B': 'mistral-7b'
      },
      'groq': {
        'Llama 4 Scout 17B': 'meta-llama/llama-4-scout-17b-16e-instruct',
        'Llama 3 8B': 'llama3-8b-8192',
        'Llama 3 70B': 'llama3-70b-8192',
        'Mixtral 8x7B': 'mixtral-8x7b-32768'
      }
    };
    
    return modelMapping[provider]?.[displayName] || displayName;
  };

  const getStatusIcon = (status: ModelInfo['status']) => {
    switch (status) {
      case 'available': return '✅';
      case 'low': return '⚠️';
      case 'exhausted': return '❌';
      case 'payment_required': return '💳';
      default: return '❓';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'auto': return '🤖';
      case 'gpt_oss': return '🚀';
      case 'gemini': return '🔍';
      case 'openrouter': return '🌐';
      case 'groq': return '⚡';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: ModelInfo['status']) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'exhausted': return 'text-red-600';
      case 'payment_required': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="model-selector p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading models...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-selector p-4">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button 
          onClick={fetchModels}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="model-selector p-4">
        <div className="text-green-600 mb-2">✅ {successMessage}</div>
        <button 
          onClick={() => setSuccessMessage(null)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    );
  }

  const availableModels = models.filter(m => m.isAvailable);
  const exhaustedModels = models.filter(m => !m.isAvailable);

  console.log('Rendering ModelSelector with:', { availableModels, exhaustedModels, currentModel });

  return (
    <div className="model-selector p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Model Selection</h3>
        {currentModel && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Current:</span>
                <div className="flex items-center mt-1">
                  <span className="text-lg mr-2">{getProviderIcon(currentModel.provider)}</span>
                  <span className="font-medium">{currentModel.model}</span>
                </div>
              </div>
              {isSwitching && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-blue-600">Switching...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auto Mode Option */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🤖 Auto Mode</h4>
        <button
          onClick={() => {
            console.log('Auto Mode button clicked');
            switchModel('auto', 'auto');
          }}
          disabled={isSwitching || (currentModel?.provider === 'auto' && currentModel?.model === 'auto')}
          className={`
            w-full flex items-center justify-between p-3 rounded-lg transition-all
            ${currentModel?.provider === 'auto' && currentModel?.model === 'auto'
              ? 'bg-blue-100 border border-blue-300'
              : 'bg-purple-50 hover:bg-purple-100 border border-transparent'
            }
            ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center">
            <span className="mr-2">🤖</span>
            <span className="mr-2">⚡</span>
            <div>
              <span className="text-sm font-medium">Auto Mode (Intelligent Selection)</span>
              <div className="text-xs text-gray-600">Automatically selects the best model for each task</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-600 font-medium">Active</div>
          </div>
        </button>
      </div>

      {/* Available Models */}
      {availableModels.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">✅ Available Models ({availableModels.length})</h4>
          <div className="space-y-2">
            {availableModels.map((model) => (
              <button
                key={`${model.provider}-${model.model}`}
                onClick={() => {
                  console.log(`Model button clicked: ${model.provider}/${model.model}`);
                  switchModel(model.provider, model.model);
                }}
                disabled={isSwitching || (currentModel?.provider === model.provider && currentModel?.model === model.model)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg transition-all
                  ${currentModel?.provider === model.provider && currentModel?.model === model.model
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-green-50 hover:bg-green-100 border border-transparent'
                  }
                  ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(model.status)}</span>
                  <span className="mr-2">{getProviderIcon(model.provider)}</span>
                  <span className="text-sm font-medium">{model.model}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">
                    Daily: {model.dailyUsed}/{model.dailyLimit}
                  </div>
                  <div className="text-xs text-gray-600">
                    Monthly: {model.monthlyUsed}/{model.monthlyLimit}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exhausted Models */}
      {exhaustedModels.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">❌ Exhausted Models ({exhaustedModels.length})</h4>
          <div className="space-y-2">
            {exhaustedModels.map((model) => (
              <div
                key={`${model.provider}-${model.model}`}
                className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg opacity-60"
              >
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(model.status)}</span>
                  <span className="mr-2">{getProviderIcon(model.provider)}</span>
                  <span className="text-sm font-medium text-gray-500">{model.model}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-red-600">
                    Daily: {model.dailyUsed}/{model.dailyLimit}
                  </div>
                  <div className="text-xs text-red-600">
                    Monthly: {model.monthlyUsed}/{model.monthlyLimit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-switch Button */}
      <div className="mt-4 mb-4">
        <button
          onClick={async () => {
            console.log('Attempting auto-switch...');
            setIsSwitching(true);
            setError(null);
            try {
              const result = await modelAPI.autoSwitchModel();
              console.log('Auto-switch result:', result);
              await fetchModels(); // Refresh the models list
            } catch (error) {
              console.error('Auto-switch failed:', error);
              setError(`Auto-switch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setIsSwitching(false);
            }
          }}
          disabled={isSwitching}
          className={`
            w-full flex items-center justify-center p-3 rounded-lg transition-colors
            ${isSwitching 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
            }
          `}
        >
          <div className="flex items-center">
            <span className="mr-2">⚡</span>
            <span className="text-sm font-medium">
              {isSwitching ? 'Auto-Switching...' : 'Auto-Switch to Available Model'}
            </span>
            {isSwitching && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            )}
          </div>
        </button>
      </div>

      {/* Auto-disable Notice */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex items-center">
          <span className="mr-2">⚠️</span>
          <span className="text-xs text-yellow-800">
            Exhausted models are automatically disabled and will be re-enabled when quota is restored.
          </span>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <div>Debug: {models.length} total models, {availableModels.length} available, {exhaustedModels.length} exhausted</div>
        <div>Current: {currentModel ? `${currentModel.provider}/${currentModel.model}` : 'None'}</div>
        <button 
          onClick={() => {
            console.log('Test button clicked');
            switchModel('gemini', 'gemini-1.5-flash');
          }}
          className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
        >
          Test Switch to Gemini
        </button>
      </div>
    </div>
  );
}; 