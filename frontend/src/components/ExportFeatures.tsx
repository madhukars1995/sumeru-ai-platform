import React, { useState } from 'react';
import { getAgentAnalytics, getPerformanceInsights, getTaskHistory } from '../services/api';

interface ExportFeaturesProps {
  onExport: (format: string, data: any) => void;
}

const ExportFeatures: React.FC<ExportFeaturesProps> = ({ onExport }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>(['analytics', 'insights', 'history']);
  const [selectedFormat, setSelectedFormat] = useState('json');

  const exportOptions = [
    { value: 'analytics', label: 'Analytics Data', icon: '📊' },
    { value: 'insights', label: 'Performance Insights', icon: '💡' },
    { value: 'history', label: 'Task History', icon: '📋' },
    { value: 'agents', label: 'Agent Profiles', icon: '👥' },
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'csv', label: 'CSV', icon: '📊' },
    { value: 'pdf', label: 'PDF Report', icon: '📑' },
    { value: 'excel', label: 'Excel', icon: '📈' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const data: any = {};

      if (selectedData.includes('analytics')) {
        const analyticsRes = await getAgentAnalytics();
        if (analyticsRes.success) data.analytics = analyticsRes.analytics;
      }

      if (selectedData.includes('insights')) {
        const insightsRes = await getPerformanceInsights();
        if (insightsRes.success) data.insights = insightsRes.insights;
      }

      if (selectedData.includes('history')) {
        const historyRes = await getTaskHistory();
        if (historyRes.success) data.history = historyRes.history;
      }

      onExport(selectedFormat, data);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const toggleDataSelection = (value: string) => {
    setSelectedData(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
      
      {/* Data Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Data to Export</h4>
        <div className="grid grid-cols-2 gap-3">
          {exportOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedData.includes(option.value)}
                onChange={() => toggleDataSelection(option.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm text-gray-700">{option.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={option.value}
                checked={selectedFormat === option.value}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm text-gray-700">{option.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedData.length} data type(s) selected • {selectedFormat.toUpperCase()} format
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || selectedData.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Export Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportFeatures; 