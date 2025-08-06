import React from 'react';

export const CurrentProjects: React.FC = () => {
  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Current Projects</h2>
        <p className="text-slate-400 text-sm">No active projects</p>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No Projects Yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Start your first project to see it here
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Project
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h3 className="text-slate-200 font-medium mb-2">Team Members</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sarah Chen</span>
            <span className="text-slate-200">Product Manager</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Marcus Rodriguez</span>
            <span className="text-slate-200">Architect</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Alex Thompson</span>
            <span className="text-slate-200">Engineer</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Chris Lee</span>
            <span className="text-slate-200">QA Engineer</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Maria Garcia</span>
            <span className="text-slate-200">Technical Writer</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 