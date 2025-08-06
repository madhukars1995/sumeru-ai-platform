import React, { useState } from 'react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
}

const FileTreeItem = ({ 
  file, 
  level = 0, 
  selectedFile, 
  onFileSelect 
}: { 
  file: FileNode; 
  level?: number; 
  selectedFile?: string;
  onFileSelect?: (file: FileNode) => void;
}) => {
  const [isOpen, setIsOpen] = useState(file.isOpen || false);
  const isSelected = selectedFile === file.path;
  const isFolder = file.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(file);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-slate-700/50 rounded ${
          isSelected ? 'bg-primary-600/20 text-primary-300' : 'text-slate-300'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="text-xs">
          {isFolder ? (isOpen ? '📁' : '📂') : '📄'}
        </span>
        <span className="truncate">{file.name}</span>
      </div>
      {isFolder && isOpen && file.children && (
        <div>
          {file.children.map(child => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = ({ files, selectedFile, onFileSelect }: FileTreeProps) => {
  return (
    <div className="h-full overflow-y-auto bg-slate-900 border-r border-slate-700">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Files</h3>
      </div>
      <div className="p-2">
        {files.map(file => (
          <FileTreeItem
            key={file.id}
            file={file}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}; 