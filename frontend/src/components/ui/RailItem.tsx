import React from 'react';

interface Props {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const RailItem = ({ icon, label, isActive, onClick }: Props) => {
  return (
    <div className="rail-item">
      <button
        className={`rail-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
        title={label}
      >
        <span className="material-icons">{icon}</span>
      </button>
      
      {/* Hover Label */}
      <span className="rail-label">
        {label}
      </span>
    </div>
  );
}; 