import React, { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';
import type { FileItem } from '../services/api';

interface File extends FileItem {
  id: string;
  size?: string;
  isGenerated?: boolean;
}

interface FileManagerProps {
  onFileSelect?: (file: File) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const filesData = await filesAPI.getFiles();
      // Transform FileItem[] to File[] by adding required fields
      const transformedFiles: File[] = filesData.map((file, index) => ({
        ...file,
        id: file.name || `file-${index}`,
        size: 'Unknown size',
        isGenerated: file.isGenerated || false
      }));
      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      // Fallback to sample data
      setFiles([
        { id: '1', name: 'index.html', type: 'html', icon: '🌐', size: '2.1 KB', isGenerated: true },
        { id: '2', name: 'style.css', type: 'css', icon: '🎨', size: '1.8 KB', isGenerated: false },
        { id: '3', name: 'script.js', type: 'javascript', icon: '📜', size: '3.2 KB', isGenerated: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: File) => {
    if (expandedFile === file.id) {
      // Collapse if already expanded
      setExpandedFile(null);
      return;
    }

    // Expand the clicked file
    setExpandedFile(file.id);
    
    // Load file content if not already loaded
    if (!fileContents[file.id]) {
      try {
        const content = await filesAPI.getFileContent(file.id);
        setFileContents(prev => ({ ...prev, [file.id]: content }));
      } catch (error) {
        console.error('Error loading file content:', error);
        // Set a fallback content
        setFileContents(prev => ({ 
          ...prev, 
          [file.id]: `// Content for ${file.name}\n// This is a sample content for ${file.type} file.\n\nfunction example() {\n  console.log("Hello from ${file.name}");\n}`
        }));
      }
    }

    onFileSelect?.(file);
  };

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      html: '#e34c26',
      css: '#264de4',
      javascript: '#f7df1e',
      typescript: '#3178c6',
      json: '#f7df1e',
      python: '#3776ab',
      js: '#f7df1e',
      ts: '#3178c6',
      py: '#3776ab',
      md: '#ff6b6b',
      txt: '#6c757d'
    };
    return colors[type] || '#6e7681';
  };

  const getFileCategory = (type: string) => {
    const categories: Record<string, string> = {
      html: 'frontend',
      css: 'frontend',
      javascript: 'frontend',
      js: 'frontend',
      typescript: 'frontend',
      ts: 'frontend',
      python: 'backend',
      py: 'backend',
      json: 'config',
      md: 'docs',
      txt: 'docs'
    };
    return categories[type] || 'other';
  };

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size';
    return size;
  };

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || getFileCategory(file.type) === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
          return 0; // Would need date field
        default:
          return 0;
      }
    });

  const categories = [
    { id: 'all', name: 'All Files', count: files.length },
    { id: 'frontend', name: 'Frontend', count: files.filter(f => getFileCategory(f.type) === 'frontend').length },
    { id: 'backend', name: 'Backend', count: files.filter(f => getFileCategory(f.type) === 'backend').length },
    { id: 'config', name: 'Config', count: files.filter(f => getFileCategory(f.type) === 'config').length },
    { id: 'docs', name: 'Documentation', count: files.filter(f => getFileCategory(f.type) === 'docs').length },
    { id: 'other', name: 'Other', count: files.filter(f => getFileCategory(f.type) === 'other').length }
  ];

  if (loading) {
    return (
      <div style={{ 
        width: '100%',
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-canvas)',
        overflow: 'hidden',
        color: 'white'
      }}>
        <div style={{ 
          padding: 'var(--space-4)', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid var(--border-primary)',
              borderTop: '2px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Loading files...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%',
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>File Manager</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {files.length} files • {files.filter(f => f.isGenerated).length} AI-generated
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <button
              onClick={() => {
                // TODO: Implement file upload
                console.log('Upload file clicked');
              }}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
            >
              📁 Upload File
            </button>
            <button
              onClick={() => {
                // TODO: Implement file creation
                console.log('Create file clicked');
              }}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--success)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
            >
              ➕ Create File
            </button>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'date')}
              style={{
                padding: 'var(--space-2)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              paddingLeft: 'var(--space-8)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}
          />
          <div style={{
            position: 'absolute',
            left: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}>
            🔍
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-1)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-1)'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: selectedCategory === category.id ? 'var(--accent)' : 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                color: selectedCategory === category.id ? 'white' : 'var(--text-primary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
            >
              {category.name}
              <span style={{
                background: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-canvas)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '10px'
              }}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: 'var(--space-3)'
      }}>
        {filteredFiles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              📁
            </div>
            <div>No files found</div>
            <div style={{ fontSize: 'var(--font-size-sm)' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Files will appear here when created'}
            </div>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.id}>
              {/* File Item */}
              <div 
                onClick={() => handleFileClick(file)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  background: expandedFile === file.id ? 'var(--bg-card)' : 'transparent',
                  border: expandedFile === file.id ? '1px solid var(--border-primary)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-2)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-normal)',
                  position: 'relative',
                  boxShadow: expandedFile === file.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = expandedFile === file.id ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = expandedFile === file.id ? 'var(--bg-card)' : 'transparent';
                }}
              >
                {/* File Icon */}
                <div style={{ 
                  marginRight: 'var(--space-3)',
                  fontSize: 'var(--font-size-lg)',
                  width: '24px',
                  textAlign: 'center'
                }}>
                  {file.icon}
                </div>

                {/* File Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    {file.name}
                    {file.isGenerated && (
                      <span style={{ 
                        background: 'var(--accent)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '10px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        AI
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span style={{ 
                      color: getFileTypeColor(file.type),
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {file.type.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span style={{
                      textTransform: 'capitalize',
                      color: 'var(--text-muted)'
                    }}>
                      {getFileCategory(file.type)}
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse Indicator */}
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-muted)',
                  transition: 'transform var(--duration-normal)',
                  transform: expandedFile === file.id ? 'rotate(90deg)' : 'rotate(0deg)'
                }}>
                  ▶
                </div>
              </div>

              {/* Expanded Content */}
              {expandedFile === file.id && (
                <div style={{
                  marginLeft: 'var(--space-6)',
                  marginBottom: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  borderTop: 'none',
                  borderTopLeftRadius: '0',
                  borderTopRightRadius: '0'
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                    maxHeight: '300px',
                    overflow: 'auto',
                    background: 'var(--bg-canvas)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-secondary)'
                  }}>
                    {fileContents[file.id] || 'Loading content...'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 