import React, { useState } from 'react';

interface EditorProps {
  content: string;
  filename?: string;
  onChange?: (content: string) => void;
  onSave?: () => void;
}

export const Editor = ({ content, filename, onChange, onSave }: EditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleSave = () => {
    onChange?.(editContent);
    onSave?.();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for tables and basic formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, '');
          return React.createElement(`h${level}`, { key: index, className: 'text-lg font-semibold mb-2' }, text);
        }
        
        // Handle tables
        if (line.includes('|')) {
          const cells = line.split('|').filter(cell => cell.trim());
          if (cells.length > 1) {
            return (
              <tr key={index} className="border-b border-slate-600">
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-sm">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            );
          }
        }
        
        // Handle regular text
        if (line.trim()) {
          return <p key={index} className="mb-2 text-sm">{line}</p>;
        }
        
        return <br key={index} />;
      });
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs">📄</span>
          <span className="text-sm font-medium text-slate-200">{filename || 'Untitled'}</span>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700"
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
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="prose prose-invert prose-sm max-w-none">
              {renderMarkdown(content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 