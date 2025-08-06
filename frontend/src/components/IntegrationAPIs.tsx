import React, { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'connected' | 'disconnected' | 'configuring';
  config?: any;
}

interface IntegrationAPIsProps {
  onIntegrationUpdate: (integration: Integration) => void;
}

const IntegrationAPIs: React.FC<IntegrationAPIsProps> = ({ onIntegrationUpdate }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Send alerts and notifications to Slack channels',
      status: 'disconnected'
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: '📋',
      description: 'Create and update Jira tickets for tasks',
      status: 'disconnected'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Create issues and pull requests automatically',
      status: 'disconnected'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '🎮',
      description: 'Send notifications to Discord webhooks',
      status: 'disconnected'
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      description: 'Send email notifications for critical alerts',
      status: 'disconnected'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      icon: '🔗',
      description: 'Send data to custom webhook endpoints',
      status: 'disconnected'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleConnect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setShowConfig(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations((prev: Integration[]) => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'disconnected' as const }
          : integration
      )
    );
  };

  const handleConfigure = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setShowConfig(true);
  };

  const handleSaveConfig = (config: any) => {
    setIntegrations((prev: Integration[]) => 
      prev.map(integration => 
        integration.id === selectedIntegration 
          ? { ...integration, status: 'connected' as const, config }
          : integration
      )
    );
    setShowConfig(false);
    setSelectedIntegration(null);
    onIntegrationUpdate(integrations.find(i => i.id === selectedIntegration)!);
  };

  const handleCancelConfig = () => {
    setShowConfig(false);
    setSelectedIntegration(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600 text-white';
      case 'disconnected': return 'bg-slate-600 text-slate-200';
      case 'configuring': return 'bg-yellow-600 text-white';
      default: return 'bg-slate-600 text-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'configuring': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-200">External Integrations</h2>
        <button
          onClick={() => setShowConfig(false)}
          className="px-3 py-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          📋 Documentation
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">{integration.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)} {integration.status}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">{integration.description}</p>
            
            <div className="flex space-x-2">
              {integration.status === 'disconnected' ? (
                <button
                  onClick={() => handleConnect(integration.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleConfigure(integration.id)}
                    className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfig && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Configure {integrations.find(i => i.id === selectedIntegration)?.name}
              </h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <IntegrationConfig 
              integrationId={selectedIntegration}
              onSave={handleSaveConfig}
              onCancel={handleCancelConfig}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-900">Export Analytics</div>
            <div className="text-xs text-gray-500">Send to connected services</div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">🚨</div>
            <div className="text-sm font-medium text-gray-900">Alert Settings</div>
            <div className="text-xs text-gray-500">Configure notification rules</div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-medium text-gray-900">API Keys</div>
            <div className="text-xs text-gray-500">Manage integration keys</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Configuration component for each integration
interface IntegrationConfigProps {
  integrationId: string;
  onSave: (config: any) => void;
  onCancel: () => void;
}

const IntegrationConfig: React.FC<IntegrationConfigProps> = ({ integrationId, onSave, onCancel }) => {
  const [config, setConfig] = useState<any>({});

  const getConfigFields = () => {
    switch (integrationId) {
      case 'slack':
        return [
          { name: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
          { name: 'channel', label: 'Channel', type: 'text', required: false },
          { name: 'username', label: 'Bot Username', type: 'text', required: false }
        ];
      case 'jira':
        return [
          { name: 'base_url', label: 'Jira Base URL', type: 'url', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'api_token', label: 'API Token', type: 'password', required: true },
          { name: 'project_key', label: 'Project Key', type: 'text', required: true }
        ];
      case 'github':
        return [
          { name: 'token', label: 'GitHub Token', type: 'password', required: true },
          { name: 'repository', label: 'Repository', type: 'text', required: true },
          { name: 'owner', label: 'Owner', type: 'text', required: true }
        ];
      case 'discord':
        return [
          { name: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
          { name: 'username', label: 'Bot Username', type: 'text', required: false }
        ];
      case 'email':
        return [
          { name: 'smtp_host', label: 'SMTP Host', type: 'text', required: true },
          { name: 'smtp_port', label: 'SMTP Port', type: 'number', required: true },
          { name: 'username', label: 'Username', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'to_email', label: 'To Email', type: 'email', required: true }
        ];
      case 'webhook':
        return [
          { name: 'url', label: 'Webhook URL', type: 'url', required: true },
          { name: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH'], required: true },
          { name: 'headers', label: 'Headers (JSON)', type: 'textarea', required: false }
        ];
      default:
        return [];
    }
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-4">
      {getConfigFields().map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'select' ? (
            <select
              value={config[field.name] || ''}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-md text-sm"
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={config[field.name] || ''}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-md text-sm"
              rows={3}
              placeholder="Enter JSON headers..."
            />
          ) : (
            <input
              type={field.type}
              value={config[field.name] || ''}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, [field.name]: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 rounded-md text-sm"
              required={field.required}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      ))}

      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Save Configuration
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-600 text-slate-200 rounded-md text-sm hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IntegrationAPIs; 