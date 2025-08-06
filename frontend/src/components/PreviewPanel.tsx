import React, { useState } from 'react';

interface PreviewPanelProps {
  content: string;
  contentType: 'html' | 'code' | 'terminal' | 'text' | 'image';
  filename?: string;
  onClose?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  content,
  contentType,
  filename,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const getContentType = (content: string, filename?: string): 'html' | 'code' | 'terminal' | 'text' | 'image' => {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename?.toLowerCase() || '';

    if (lowerContent.includes('<html') || lowerContent.includes('<div') || lowerFilename.endsWith('.html')) {
      return 'html';
    }
    if (lowerContent.includes('$ ') || lowerContent.includes('> ') || lowerContent.includes('command')) {
      return 'terminal';
    }
    if (lowerFilename.endsWith('.js') || lowerFilename.endsWith('.ts') || lowerFilename.endsWith('.py') ||
        lowerFilename.endsWith('.java') || lowerFilename.endsWith('.cpp') || lowerFilename.endsWith('.c')) {
      return 'code';
    }
    if (lowerFilename.endsWith('.png') || lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg') ||
        lowerFilename.endsWith('.gif') || lowerFilename.endsWith('.svg')) {
      return 'image';
    }
    return 'text';
  };

  const renderContent = () => {
    switch (contentType) {
      case 'html':
        return (
          <iframe
            srcDoc={content}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'white'
            }}
            title="HTML Preview"
          />
        );
      
      case 'code':
        return (
          <pre style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            overflow: 'auto',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--text-primary)',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
          }}>
            <code>{content}</code>
          </pre>
        );
      
      case 'terminal':
        return (
          <div style={{
            padding: 'var(--space-4)',
            background: '#1e1e1e',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
            color: '#00ff00',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {content.split('\n').map((line, index) => (
              <div key={index} style={{ marginBottom: 'var(--space-1)' }}>
                {line}
              </div>
            ))}
          </div>
        );
      
      case 'image':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'var(--bg-canvas)'
          }}>
            <img
              src={content}
              alt={filename || 'Image'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        );
      
      default:
        return (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            overflow: 'auto'
          }}>
            {content}
          </div>
        );
    }
  };

  const canShowPreview = contentType === 'html' || contentType === 'image';
  const canShowCode = contentType === 'html' || contentType === 'code';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-canvas)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            margin: '0 0 var(--space-1) 0'
          }}>
            {filename || 'Preview'}
          </h2>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>
            {contentType}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-2)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-lg)'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      {(canShowPreview && canShowCode) && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-card)',
          display: 'flex',
          gap: 'var(--space-2)'
        }}>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: activeTab === 'preview' ? 'var(--accent)' : 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'preview' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            👁️ Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              background: activeTab === 'code' ? 'var(--accent)' : 'var(--bg-canvas)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'code' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            📝 Code
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        padding: 'var(--space-4)',
        overflow: 'auto'
      }}>
        {activeTab === 'preview' || !canShowCode ? (
          renderContent()
        ) : (
          <pre style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            overflow: 'auto',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--text-primary)',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            height: '100%'
          }}>
            <code>{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
}; 