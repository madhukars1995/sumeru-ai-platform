import React from 'react';

// Placeholder FileTree component
const FileTree = () => (
  <div className="h-full bg-[var(--bg-secondary)] p-4">
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-2 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
        <span className="material-icons text-sm text-[var(--accent-purple)]">folder</span>
        <span className="text-[var(--text-secondary)] text-sm">src</span>
      </div>
      <div className="ml-4 space-y-1">
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
          <span className="material-icons text-sm text-[var(--accent-green)]">code</span>
          <span className="text-[var(--text-secondary)] text-sm">App.tsx</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
          <span className="material-icons text-sm text-[var(--accent-blue)]">settings</span>
          <span className="text-[var(--text-secondary)] text-sm">index.css</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
          <span className="material-icons text-sm text-[var(--accent-purple)]">description</span>
          <span className="text-[var(--text-secondary)] text-sm">README.md</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-2 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer">
        <span className="material-icons text-sm text-[var(--accent-blue)]">settings</span>
        <span className="text-[var(--text-secondary)] text-sm">package.json</span>
      </div>
    </div>
  </div>
);

// Placeholder CodeEditor component
const CodeEditor = () => (
  <div className="h-full bg-[var(--bg-secondary)] p-4">
    <div className="text-[var(--text-secondary)] text-sm font-mono">
      <div className="text-[var(--accent-purple)]">import</div>
      <div className="text-[var(--text-primary)]"> React from</div>
      <div className="text-[var(--accent-green)]"> 'react'</div>
      <div className="text-[var(--text-primary)]">;</div>
      <br />
      <div className="text-[var(--accent-purple)]">import</div>
      <div className="text-[var(--text-primary)]"> BrowserRouter, Routes, Route</div>
      <div className="text-[var(--text-primary)]"> from</div>
      <div className="text-[var(--accent-green)]"> 'react-router-dom'</div>
      <div className="text-[var(--text-primary)]">;</div>
      <br />
      <div className="text-[var(--accent-purple)]">function</div>
      <div className="text-[var(--text-primary)]"> App()</div>
      <div className="text-[var(--accent-purple)]">return</div>
      <div className="text-[var(--text-primary)]"> (</div>
      <div className="text-[var(--accent-blue)]">&lt;div&gt;</div>
      <div className="text-[var(--accent-blue)]">&lt;h1&gt;</div>
      <div className="text-[var(--text-primary)]">Hello World</div>
      <div className="text-[var(--accent-blue)]">&lt;/h1&gt;</div>
      <div className="text-[var(--accent-blue)]">&lt;/div&gt;</div>
      <div className="text-[var(--text-primary)]">);</div>
    </div>
  </div>
);

// Simple split implementation
const Split = ({ children, className, sizes }: { children: React.ReactNode; className?: string; sizes: number[] }) => (
  <div className={`${className} flex`}>
    <div className="flex-1 border-r border-[var(--border-primary)]">
      {Array.isArray(children) ? children[0] : children}
    </div>
    <div className="flex-1">
      {Array.isArray(children) ? children[1] : null}
    </div>
  </div>
);

export const EditorPane = ({ onClose }: { onClose: () => void }) => (
  <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]/80 backdrop-blur-sm">
    <header className="pane-head">
      <h3 className="font-medium text-[var(--text-primary)]">Editor</h3>
      <button onClick={onClose} className="icon-btn">
        <span className="material-icons text-sm">close</span>
      </button>
    </header>

    <Split className="flex-1" sizes={[20, 80]}>
      <FileTree />
      <CodeEditor />
    </Split>
  </div>
); 