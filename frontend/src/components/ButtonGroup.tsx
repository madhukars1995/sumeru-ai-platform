import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className = '' }: ButtonGroupProps) => (
  <div className={`flex gap-3 px-4 py-3 ${className}`}>
    {children}
  </div>
); 