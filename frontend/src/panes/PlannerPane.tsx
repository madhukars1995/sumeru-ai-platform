import React from 'react';

// Placeholder TaskBoard component - would be replaced with actual Kanban implementation
const TaskBoard = ({ className }: { className?: string }) => (
  <div className={`${className} p-4`}>
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* To Do Column */}
      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
        <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--accent-yellow)] rounded-full"></span>
          To Do
        </h4>
        <div className="space-y-2">
          <div className="bg-[var(--bg-secondary)] p-3 rounded border-l-4 border-[var(--accent-yellow)]">
            <h5 className="font-medium text-[var(--text-primary)] text-sm">Review current implementation</h5>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Analyze existing code structure and identify areas for improvement</p>
          </div>
          <div className="bg-[var(--bg-secondary)] p-3 rounded border-l-4 border-[var(--accent-yellow)]">
            <h5 className="font-medium text-[var(--text-primary)] text-sm">Create development roadmap</h5>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Plan next development phases and milestones</p>
          </div>
        </div>
      </div>

      {/* In Progress Column */}
      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
        <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--accent-blue)] rounded-full"></span>
          In Progress
        </h4>
        <div className="space-y-2">
          <div className="bg-[var(--bg-secondary)] p-3 rounded border-l-4 border-[var(--accent-blue)]">
            <h5 className="font-medium text-[var(--text-primary)] text-sm">Implement utility rail system</h5>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Add expandable panels with proper state management</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-full bg-[var(--bg-quaternary)] rounded-full h-2">
                <div className="bg-[var(--accent-blue)] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[var(--text-secondary)] text-xs">75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Done Column */}
      <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
        <h4 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--accent-green)] rounded-full"></span>
          Done
        </h4>
        <div className="space-y-2">
          <div className="bg-[var(--bg-secondary)] p-3 rounded border-l-4 border-[var(--accent-green)]">
            <h5 className="font-medium text-[var(--text-primary)] text-sm">Set up project structure</h5>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Initialize React app with TypeScript and Tailwind</p>
          </div>
          <div className="bg-[var(--bg-secondary)] p-3 rounded border-l-4 border-[var(--accent-green)]">
            <h5 className="font-medium text-[var(--text-primary)] text-sm">Create basic layout components</h5>
            <p className="text-[var(--text-secondary)] text-xs mt-1">Implement DashboardLayout and navigation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PlannerPane = ({ onClose }: { onClose: () => void }) => (
  <div className="h-full w-full flex flex-col bg-[var(--bg-primary)]/80 backdrop-blur-sm">
    <header className="pane-head">
      <h3 className="font-medium text-[var(--text-primary)]">Planner</h3>
      <button onClick={onClose} className="icon-btn">
        <span className="material-icons text-sm">close</span>
      </button>
    </header>

    <TaskBoard className="flex-1 overflow-auto" />
  </div>
); 