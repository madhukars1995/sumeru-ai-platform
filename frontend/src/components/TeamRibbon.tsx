import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

export const TeamRibbon: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: '🏠', description: 'Dashboard' },
    { path: '/chat', label: 'Chat', icon: '💬', description: 'AI Conversations' },
    { path: '/files', label: 'Files', icon: '📁', description: 'File Manager' },
    { path: '/collaboration', label: 'Team', icon: '👥', description: 'Collaboration' },
    { path: '/code-review', label: 'Review', icon: '🔍', description: 'Code Review' },
    { path: '/performance', label: 'Analytics', icon: '📊', description: 'Performance' },
    { path: '/workflows', label: 'Workflows', icon: '⚡', description: 'Workflows' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="team-ribbon">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Go to Home"
        >
          <span className="text-xl">🚀</span>
          <span className="font-semibold text-slate-200">Sumeru AI</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 flex-1 justify-center" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              ${isActive(item.path)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-slate-200 hover:bg-slate-700'
              }
            `}
            aria-label={`Navigate to ${item.description}`}
            title={item.description}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Status and Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">Online</span>
        </div>
      </div>
    </div>
  );
}; 