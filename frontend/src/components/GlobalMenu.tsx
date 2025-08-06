import React from 'react';
import { useLocation } from 'react-router-dom';

export const GlobalMenu = () => {
  return (
    <div className="flex items-center gap-2">
      <button className="icon-btn" title="Settings">
        <span className="material-icons text-sm">settings</span>
      </button>
      <button className="icon-btn" title="Notifications">
        <span className="material-icons text-sm">notifications</span>
      </button>
      <div className="w-px h-4 bg-slate-700"></div>
      <button className="btn-secondary text-xs">
        <span className="material-icons text-sm mr-1">share</span>
        Share
      </button>
    </div>
  );
}; 