import React, { useState, useEffect } from 'react';
import { creditsAPI } from '../services/api';

interface QuotaInfo {
  provider: string;
  model: string;
  daily: {
    used: number;
    limit: number;
    percentage: number;
  };
  monthly: {
    used: number;
    limit: number;
    percentage: number;
  };
}

interface QuotaMonitorProps {
  className?: string;
}

export const QuotaMonitor: React.FC<QuotaMonitorProps> = ({ className = '' }) => {
  const [quotas, setQuotas] = useState<Record<string, Record<string, QuotaInfo>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotas();
  }, []);

  const loadQuotas = async () => {
    try {
      setLoading(true);
      const quotasData = await creditsAPI.getQuotas();
      setQuotas(quotasData);
    } catch (error) {
      console.error('Failed to load quotas:', error);
      setError('Failed to load quota information');
    } finally {
      setLoading(false);
    }
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getQuotaBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-slate-400">Loading quotas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
        <div className="text-red-400 text-sm">{error}</div>
        <button
          onClick={loadQuotas}
          className="mt-2 px-3 py-1 bg-slate-700 text-slate-200 rounded text-xs hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">💳 Model Quotas</h3>
        <button
          onClick={loadQuotas}
          className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-xs hover:bg-slate-600"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(quotas).map(([provider, models]) => (
          <div key={provider} className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300 capitalize">{provider}</h4>
            {Object.entries(models).map(([model, quota]) => (
              <div key={`${provider}-${model}`} className="bg-slate-700 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">{model}</span>
                  <span className={`text-xs ${getQuotaColor(quota.daily.percentage)}`}>
                    {quota.daily.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Daily: {quota.daily.used}/{quota.daily.limit}</span>
                    <span>{quota.daily.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${getQuotaBarColor(quota.daily.percentage)}`}
                      style={{ width: `${Math.min(quota.daily.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Monthly: {quota.monthly.used}/{quota.monthly.limit}</span>
                    <span>{quota.monthly.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${getQuotaBarColor(quota.monthly.percentage)}`}
                      style={{ width: `${Math.min(quota.monthly.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {Object.keys(quotas).length === 0 && (
        <div className="text-center text-slate-400 text-sm">
          No quota information available
        </div>
      )}
    </div>
  );
}; 