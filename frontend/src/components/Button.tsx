import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = ''
}: ButtonProps) => {
  const baseClasses = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed',
    secondary: 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:bg-slate-700/60 disabled:text-slate-400 disabled:cursor-not-allowed'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded',
    lg: 'h-9 px-6 text-sm rounded'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}; 