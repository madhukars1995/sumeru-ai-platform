import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'var(--accent)', 
  text 
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)'
    }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `2px solid var(--border-primary)`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <div style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-sm)',
          textAlign: 'center'
        }}>
          {text}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 