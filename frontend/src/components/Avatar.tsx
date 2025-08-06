import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  className?: string;
}

const LetterAvatar = ({ letter, size = 'md', className = '' }: { letter: string; size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-medium text-[var(--text-primary)] ${className}`}>
      {letter.toUpperCase()}
    </div>
  );
};

export const Avatar = ({ src, name, size = 'md', isActive = false, className = '' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const activeClasses = isActive 
    ? 'border border-[var(--accent-blue)] bg-blue-500/10 active-user-glow' 
    : 'opacity-50';

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${activeClasses} ${className}`}>
        <img 
          src={src} 
          alt={`${name} avatar`}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${activeClasses} ${className}`}>
      <LetterAvatar letter={name.charAt(0)} size={size} />
    </div>
  );
}; 