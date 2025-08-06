import React from 'react';
import { LogoWithBeta } from './LogoWithBeta';
import { GlobalMenu } from './GlobalMenu';
import { SidePanel } from './SidePanel';

export const WorkspaceHead = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = React.useState(false);

  return (
    <>
      <header className="header">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Logo and Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
              title="Open Menu"
            >
              <span className="text-xl">☰</span>
            </button>
            <LogoWithBeta />
          </div>

          {/* Right side - Global Menu */}
          <GlobalMenu />
        </div>
      </header>

      {/* Side Panel */}
      <SidePanel 
        isOpen={isSidePanelOpen} 
        onClose={() => setIsSidePanelOpen(false)} 
      />
    </>
  );
}; 