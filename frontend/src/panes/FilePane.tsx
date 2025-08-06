import React from 'react';

// Placeholder S3Browser component
const S3Browser = ({ className }: { className?: string }) => (
  <div className={`${className} p-4`}>
    <div className="space-y-4">
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-[var(--text-primary)]">Storage Browser</h4>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-inactive)] text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search files..." 
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-8 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            />
          </div>
          <button className="bg-[var(--accent-blue)] text-white px-3 py-1 rounded text-sm hover:bg-[var(--accent-blue-dark)] transition-colors">
            Upload
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--bg-quaternary)] cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-[var(--accent-purple)]">description</span>
            <div>
              <div className="text-[var(--text-primary)] font-medium">status_report.md</div>
              <div className="text-[var(--text-secondary)] text-xs">2.3 KB • Modified 2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">download</span>
            </button>
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--bg-quaternary)] cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-[var(--accent-green)]">code</span>
            <div>
              <div className="text-[var(--text-primary)] font-medium">assistant.py</div>
              <div className="text-[var(--text-secondary)] text-xs">15.7 KB • Modified 1 day ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">download</span>
            </button>
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--bg-quaternary)] cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-[var(--accent-blue)]">settings</span>
            <div>
              <div className="text-[var(--text-primary)] font-medium">config.yaml</div>
              <div className="text-[var(--text-secondary)] text-xs">1.2 KB • Modified 3 days ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">download</span>
            </button>
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--bg-quaternary)] cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-[var(--accent-yellow)]">image</span>
            <div>
              <div className="text-[var(--text-primary)] font-medium">screenshot.png</div>
              <div className="text-[var(--text-secondary)] text-xs">245 KB • Modified 1 week ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">download</span>
            </button>
            <button className="text-[var(--text-inactive)] hover:text-white p-1">
              <span className="material-icons text-sm">more_vert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Storage usage */}
      <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-secondary)] text-sm">Storage Usage</span>
          <span className="text-[var(--text-primary)] text-sm">2.1 GB / 10 GB</span>
        </div>
        <div className="w-full bg-[var(--bg-quaternary)] rounded-full h-2">
          <div className="bg-[var(--accent-blue)] h-2 rounded-full" style={{ width: '21%' }}></div>
        </div>
        <div className="text-[var(--text-secondary)] text-xs mt-1">21% used</div>
      </div>
    </div>
  </div>
);

export const FilePane = ({ onClose }: { onClose: () => void }) => (
  <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]/80 backdrop-blur-sm">
    <header className="pane-head">
      <h3 className="font-medium text-[var(--text-primary)]">Files</h3>
      <button onClick={onClose} className="icon-btn">
        <span className="material-icons text-sm">close</span>
      </button>
    </header>

    <S3Browser className="flex-1 overflow-auto" />
  </div>
); 