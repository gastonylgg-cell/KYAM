import React from 'react';

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Circle (Stethoscope Tube) */}
      <path 
        d="M256 80C158.8 80 80 158.8 80 256C80 353.2 158.8 432 256 432C353.2 432 432 353.2 432 256" 
        stroke="currentColor" 
        strokeWidth="24" 
        strokeLinecap="round"
      />
      
      {/* Stethoscope Ear Pieces */}
      <path 
        d="M200 40C200 62.1 182.1 80 160 80C137.9 80 120 62.1 120 40" 
        stroke="currentColor" 
        strokeWidth="16"
      />
      <path 
        d="M120 40V80" 
        stroke="currentColor" 
        strokeWidth="16"
      />
      <path 
        d="M200 40V80" 
        stroke="currentColor" 
        strokeWidth="16"
      />

      {/* Medical Cross */}
      <rect x="224" y="160" width="64" height="192" fill="currentColor" rx="8" />
      <rect x="160" y="224" width="192" height="64" fill="currentColor" rx="8" />

      {/* Syringe (Simplified) */}
      <rect x="248" y="170" width="16" height="130" fill="white" rx="2" />
      <rect x="240" y="290" width="32" height="8" fill="white" rx="1" />
      <rect x="252" y="160" width="8" height="20" fill="white" rx="1" />
      
      {/* Stethoscope Chest Piece */}
      <circle cx="432" cy="256" r="32" fill="currentColor" />
      <circle cx="432" cy="256" r="16" fill="white" />
    </svg>
  );
};

export default Logo;
