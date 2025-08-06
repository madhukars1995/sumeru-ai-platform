import React from 'react';
import { useNavigate } from 'react-router-dom';

export const IntegrationGuideLink: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => navigate('/integration-guide')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2"
        title="Integration Guide"
      >
        <span>📋</span>
        <span className="text-sm font-medium">Integration Guide</span>
      </button>
    </div>
  );
}; 