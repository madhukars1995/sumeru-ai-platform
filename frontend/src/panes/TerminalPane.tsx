import React from 'react';

// Placeholder Terminal component - would be replaced with actual terminal implementation
const Terminal = ({ className }: { className?: string }) => (
  <div className={`${className} bg-[var(--bg-secondary)] p-4 font-mono text-sm`}>
    <div className="text-[var(--text-secondary)] space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-[var(--accent-green)]">$</span>
        <span className="text-[var(--text-primary)]">npm run dev</span>
      </div>
      <div className="text-[var(--accent-green)]">✓ Development server running on http://localhost:5175</div>
      <div className="text-[var(--accent-green)]">✓ Hot reload enabled</div>
      <div className="text-[var(--accent-green)]">✓ TypeScript compilation successful</div>
      
      <div className="mt-4 flex items-center space-x-2">
        <span className="text-[var(--accent-green)]">$</span>
        <span className="text-[var(--text-primary)]">git status</span>
      </div>
      <div className="text-[var(--accent-blue)]">On branch main</div>
      <div className="text-[var(--text-secondary)]">Your branch is up to date with 'origin/main'.</div>
      
      <div className="mt-4 flex items-center space-x-2">
        <span className="text-[var(--accent-green)]">$</span>
        <span className="text-[var(--text-primary)]">ls -la</span>
      </div>
      <div className="text-[var(--text-secondary)]">total 32</div>
      <div className="text-[var(--text-secondary)]">drwxr-xr-x  5 user  staff  160 Dec 15 10:30 .</div>
      <div className="text-[var(--text-secondary)]">drwxr-xr-x  3 user  staff   96 Dec 15 10:30 ..</div>
      <div className="text-[var(--accent-blue)]">-rw-r--r--  1 user  staff  1234 Dec 15 10:30 package.json</div>
      <div className="text-[var(--accent-purple)]">drwxr-xr-x  8 user  staff  256 Dec 15 10:30 src</div>
      <div className="text-[var(--accent-green)]">-rw-r--r--  1 user  staff   567 Dec 15 10:30 README.md</div>
    </div>
  </div>
);

export const TerminalPane = ({ onClose }: { onClose: () => void }) => (
  <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]/80 backdrop-blur-sm">
    <header className="pane-head">
      <h3 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
        <span className="text-[var(--accent-blue)]">⌘</span>
        Terminal
      </h3>
      <button onClick={onClose} className="icon-btn">
        <span className="material-icons text-sm">close</span>
      </button>
    </header>

    <Terminal className="flex-1 overflow-hidden" />
  </div>
); 