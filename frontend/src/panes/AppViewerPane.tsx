import React from 'react';

// Placeholder IFramePreview component - would be replaced with actual iframe implementation
const IFramePreview = ({ url, className }: { url: string; className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <div className="text-center">
      <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center mb-4">
        <span className="material-icons text-3xl text-[var(--text-inactive)]">desktop_mac</span>
      </div>
      <h4 className="text-[var(--text-primary)] font-medium mb-2">App Preview</h4>
      <p className="text-[var(--text-secondary)] text-sm mb-4">
        Live preview of the web application
      </p>
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-secondary)] text-xs">Preview URL</span>
          <span className="text-[var(--accent-blue)] text-xs">http://localhost:3000</span>
        </div>
        <div className="bg-[var(--bg-tertiary)] rounded h-32 flex items-center justify-center">
          <span className="text-[var(--text-inactive)] text-sm">App content would appear here</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-2 h-2 bg-[var(--accent-green)] rounded-full"></span>
          <span>Live preview active</span>
        </div>
      </div>
    </div>
  </div>
);

export const AppViewerPane = ({ onClose }: { onClose: () => void }) => (
  <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]/80 backdrop-blur-sm">
    <header className="pane-head">
      <h3 className="font-medium text-[var(--text-primary)]">App Viewer</h3>
      <button onClick={onClose} className="icon-btn">
        <span className="material-icons text-sm">close</span>
      </button>
    </header>

    <IFramePreview url="/preview" className="flex-1 bg-black" />
  </div>
); 