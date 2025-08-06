import React, { useState } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
  status?: 'saved' | 'modified' | 'new' | 'deleted';
  lastModified?: string;
}

interface EnhancedFileTreeProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileRename?: (file: FileNode, newName: string) => void;
  onFileDelete?: (file: FileNode) => void;
}

const FileTreeItem = ({ 
  file, 
  level = 0, 
  selectedFile, 
  onFileSelect,
  onFileRename,
  onFileDelete
}: { 
  file: FileNode; 
  level?: number; 
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileRename?: (file: FileNode, newName: string) => void;
  onFileDelete?: (file: FileNode) => void;
}) => {
  const [isOpen, setIsOpen] = useState(file.isOpen || false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const isSelected = selectedFile === file.path;
  const isFolder = file.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setShowContextMenu(false);
  };

  const handleRenameSave = () => {
    if (newName.trim() && newName !== file.name) {
      onFileRename?.(file, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewName(file.name);
    setIsRenaming(false);
  };

  const handleDelete = () => {
    onFileDelete?.(file);
    setShowContextMenu(false);
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'saved': return '✓';
      case 'modified': return '●';
      case 'new': return '+';
      case 'deleted': return '🗑️';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'saved': return 'text-green-400';
      case 'modified': return 'text-yellow-400';
      case 'new': return 'text-blue-400';
      case 'deleted': return 'text-red-400';
      default: return '';
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-700/50 rounded transition-colors ${
          isSelected ? 'bg-primary-600/20 text-primary-300 border-l-2 border-primary-600' : 'text-slate-300'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Status Indicator */}
        {file.status && (
          <span className={`text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
        )}
        
        {/* File/Folder Icon */}
        <span className="text-xs">
          {isFolder ? (isOpen ? '📁' : '📂') : '📄'}
        </span>
        
        {/* File Name */}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSave();
              if (e.key === 'Escape') handleRenameCancel();
            }}
            onBlur={handleRenameSave}
            className="flex-1 bg-slate-800 text-slate-200 text-sm border border-primary-600 rounded px-1 focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="truncate font-mono text-xs">{file.name}</span>
        )}
        
        {/* Last Modified */}
        {file.lastModified && !isRenaming && (
          <span className="text-xs text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {file.lastModified}
          </span>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div className="absolute z-50 bg-slate-800 border border-slate-600 rounded shadow-lg py-1 min-w-32">
          <button
            onClick={handleRename}
            className="w-full px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 text-left"
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-1 text-sm text-red-400 hover:bg-slate-700 text-left"
          >
            Delete
          </button>
        </div>
      )}

      {/* Children */}
      {isFolder && isOpen && file.children && (
        <div>
          {file.children.map(child => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              onFileRename={onFileRename}
              onFileDelete={onFileDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const EnhancedFileTree = ({ 
  files, 
  selectedFile, 
  onFileSelect,
  onFileRename,
  onFileDelete
}: EnhancedFileTreeProps) => {
  return (
    <div className="h-full overflow-y-auto bg-slate-900 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Files</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Status:</span>
          <span className="text-green-400">✓ saved</span>
          <span className="text-yellow-400">● modified</span>
          <span className="text-blue-400">+ new</span>
        </div>
      </div>
      <div className="p-2">
        {files.map(file => (
          <FileTreeItem
            key={file.id}
            file={file}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onFileRename={onFileRename}
            onFileDelete={onFileDelete}
          />
        ))}
      </div>
    </div>
  );
}; 