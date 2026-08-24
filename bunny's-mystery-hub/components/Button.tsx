import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Expanded variants to match every genre color in your image
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'neon' | 'neonGreen' | 'murder' | 'cyber' | 'forgery' | 'espionage' | 'theft' | 'coldcase' | 'outline-neon';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  // Removed 'justify-center' from baseStyles
  const baseStyles = 'transition-all duration-300 focus:outline-none font-bold uppercase tracking-widest text-xs flex items-center';
  
  const variantStyles = {
    // These variants will now respect the 'justify-start' from MysteryGame.tsx
    primary: 'px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-2 focus:ring-indigo-500',
    secondary: 'px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-2 focus:ring-gray-500',
    danger: 'px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500',
    success: 'px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white border-2 border-green-300 focus:ring-2 focus:ring-green-500',
    
    // Main "Start New Case" Neon Pill - Added justify-center
    neon: 'px-10 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.8)] hover:shadow-[0_0_30px_rgba(6,182,212,1)] transform hover:scale-105 active:scale-95 text-sm justify-center',
    neonGreen: 'px-10 py-3 rounded-full bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transform hover:scale-105 active:scale-95 justify-center',

    // New Outline Neon variant for "PREVIOUS" button - Added justify-center
    'outline-neon': 'px-6 py-3 rounded-full bg-gray-700 bg-opacity-30 border border-gray-400 text-gray-300 hover:bg-opacity-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-500 justify-center',

    // Genre-Specific Designs from your image (these are for the genre selection screen)
    // Their container in GenreSelector.tsx already applies centering, so no change needed here.
    murder: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-red-500 text-white shadow-[inset_0_0_10px_rgba(239,68,68,0.4),0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500/10',
    cyber: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-cyan-400 text-white shadow-[inset_0_0_10px_rgba(34,211,238,0.4),0_0_15px_rgba(34,211,238,0.4)] hover:bg-cyan-400/10',
    forgery: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-purple-500 text-white shadow-[inset_0_0_10px_rgba(168,85,247,0.4),0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500/10',
    espionage: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-yellow-500 text-white shadow-[inset_0_0_10px_rgba(234,179,8,0.4),0_0_15px_rgba(234,179,8,0.4)] hover:bg-yellow-500/10',
    theft: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-blue-400 text-white shadow-[inset_0_0_10px_rgba(96,165,250,0.4),0_0_15px_rgba(96,165,250,0.4)] hover:bg-blue-400/10',
    coldcase: 'px-6 py-8 rounded-2xl bg-transparent border-2 border-teal-400 text-white shadow-[inset_0_0_10px_rgba(45,212,191,0.4),0_0_15px_rgba(45,212,191,0.4)] hover:bg-teal-400/10',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;