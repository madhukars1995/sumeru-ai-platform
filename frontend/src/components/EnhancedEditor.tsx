import React, { useState } from 'react';

interface Tab {
  id: string;
  name: string;
  content: string;
  isModified?: boolean;
  isActive?: boolean;
}

interface EnhancedEditorProps {
  tabs: Tab[];
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onContentChange?: (tabId: string, content: string) => void;
  onSave?: (tabId: string) => void;
}

export const EnhancedEditor = ({ 
  tabs, 
  onTabChange, 
  onTabClose, 
  onContentChange, 
  onSave 
}: EnhancedEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [activeTabId, setActiveTabId] = useState(tabs.find(t => t.isActive)?.id || tabs[0]?.id);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isModified = activeTab?.isModified;

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose?.(tabId);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(activeTab?.content || '');
  };

  const handleSave = () => {
    if (activeTabId) {
      onContentChange?.(activeTabId, editContent);
      onSave?.(activeTabId);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(activeTab?.content || '');
    setIsEditing(false);
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, '');
          return React.createElement(`h${level}`, { 
            key: index, 
            className: 'text-lg font-semibold mb-3 text-slate-100' 
          }, text);
        }
        
        // Tables
        if (line.includes('|')) {
          const cells = line.split('|').filter(cell => cell.trim());
          if (cells.length > 1) {
            const isHeader = line.includes('---');
            return (
              <tr key={index} className={`${isHeader ? 'border-b-2 border-slate-600' : 'border-b border-slate-700'}`}>
                {cells.map((cell, cellIndex) => {
                  const Tag = isHeader ? 'th' : 'td';
                  return (
                    <Tag 
                      key={cellIndex} 
                      className={`px-4 py-2 text-sm ${isHeader ? 'font-semibold text-slate-200' : 'text-slate-300'}`}
                    >
                      {cell.trim()}
                    </Tag>
                  );
                })}
              </tr>
            );
          }
        }
        
        // Code blocks
        if (line.startsWith('```')) {
          return <div key={index} className="bg-slate-800 p-3 rounded my-2 font-mono text-sm text-slate-300" />;
        }
        
        // Lists
        if (line.match(/^[-*+]\s/)) {
          return (
            <li key={index} className="text-sm text-slate-300 ml-4 mb-1">
              {line.replace(/^[-*+]\s/, '')}
            </li>
          );
        }
        
        // Regular text
        if (line.trim()) {
          return <p key={index} className="mb-2 text-sm text-slate-300 leading-relaxed">{line}</p>;
        }
        
        return <br key={index} />;
      });
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Tab Bar */}
      <div className="flex items-center bg-slate-900 border-b border-slate-700">
        <div className="flex-1 flex overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-slate-700 min-w-0 ${
                tab.id === activeTabId 
                  ? 'bg-slate-800 text-slate-200' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-300'
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="truncate">{tab.name}</span>
              {tab.isModified && <span className="text-yellow-400 text-xs">●</span>}
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs">📄</span>
          <span className="text-sm font-medium text-slate-200">{activeTab?.name || 'Untitled'}</span>
          {isModified && <span className="text-yellow-400 text-xs">●</span>}
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-4 bg-slate-800 text-slate-200 text-sm font-mono resize-none focus:outline-none"
            placeholder="Start typing..."
            style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="prose prose-invert prose-sm max-w-none">
              {activeTab && renderMarkdown(activeTab.content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 