import React from 'react';

export function BrandLogo({ className = 'w-8 h-8' }) {
  return (
    <div className={`relative shrink-0 ${className} group-hover:scale-105 transition-transform duration-200 select-none flex items-center justify-center`}>
      <img
        src="/logo.svg"
        alt="QuickFormat Hub Logo"
        className="w-full h-full object-contain drop-shadow-sm"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/logo.png';
        }}
      />
    </div>
  );
}
