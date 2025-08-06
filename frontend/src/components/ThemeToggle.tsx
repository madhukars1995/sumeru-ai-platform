import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, themes, changeTheme, getCurrentThemeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = getCurrentThemeConfig();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Change theme"
      >
        <span>{currentTheme.icon}</span>
        <span style={{ fontSize: '12px' }}>{currentTheme.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: '6px',
            padding: '8px 0',
            minWidth: '150px',
            zIndex: 1001,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {Object.entries(themes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  changeTheme(key as any);
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '8px 16px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-canvas)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '16px' }}>{config.icon}</span>
                <div>
                  <div style={{ fontWeight: '500' }}>{config.name}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}>
                    {config.description}
                  </div>
                </div>
                {theme === key && (
                  <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 