import React from 'react';

// Branding configuration - can be set via environment variable
const BRANDING_VARIANT = import.meta.env.VITE_BRAND_TAG || 'beta';

export const LogoWithBeta = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-lg font-bold text-white">Sumeru AI</span>
      </div>
      <span className="badge badge-accent">beta</span>
    </div>
  );
}; 