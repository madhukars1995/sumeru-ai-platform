import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose }) => {
  const [userCredits] = useState({ used: '433.06K', total: '2.50M' });
  const [recentChats] = useState([
    { id: 1, title: 'Build a React dashboard', timestamp: '2 hours ago' },
    { id: 2, title: 'Create landing page', timestamp: '1 day ago' },
    { id: 3, title: 'API integration help', timestamp: '3 days ago' }
  ]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Side Panel */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Sumeru AI</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6 space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Quick Actions</h3>
              <Link
                to="/chat"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
              >
                <span className="text-lg">💬</span>
                <span>New Chat</span>
              </Link>
              <Link
                to="/app-world"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
              >
                <span className="text-lg">🌍</span>
                <span>App World</span>
              </Link>
            </div>

            {/* Recent Chats */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recent Chats</h3>
              <div className="space-y-2">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{chat.title}</p>
                      <p className="text-xs text-slate-400">{chat.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings & Help */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Settings</h3>
              <div className="space-y-2">
                <button className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white w-full text-left">
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white w-full text-left">
                  <span className="text-lg">💬</span>
                  <span>Feedback</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white w-full text-left">
                  <span className="text-lg">❓</span>
                  <span>Help Center</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">User</p>
                <p className="text-xs text-slate-400">
                  {userCredits.used} / {userCredits.total} credits
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 