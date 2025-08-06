import React from 'react';

interface QuotaBarProps {
  dailyUsed: number;
  dailyMax: number;
  monthlyUsed?: number;
  monthlyMax?: number;
}

export const QuotaBar = ({ dailyUsed, dailyMax, monthlyUsed, monthlyMax }: QuotaBarProps) => {
  const pct = Math.min(dailyUsed / dailyMax, 1) * 100;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-[var(--bg-tertiary)]">
          <span className="material-icons text-[var(--text-inactive)]">videocam</span>
        </button>
        <button className="p-2 rounded-full hover:bg-[var(--bg-tertiary)]">
          <span className="material-icons text-[var(--text-inactive)]">info</span>
        </button>
      </div>
    </div>
  );
}; 