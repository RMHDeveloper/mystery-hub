import React, { ReactElement } from 'react';
import { Genre } from '../types';
import Button from './Button';
import Header from './Header'; // Import the new Header component

interface GenreSelectorProps {
  onSelectGenre: (genre: Genre) => void;
  disabled: boolean; // Indicates if the selector is in a loading/disabled state (AI generation)
  onRestart: () => void; // Passed for the restart button in the header
}

interface ButtonConfig {
  id: string; // Unique ID for key
  label: string | null; // Text label or null if icon-only
  icon: ReactElement | null; // Icon or null if text-only
  genre?: Genre; // The actual genre enum value, undefined if non-functional/placeholder
  textColor: string;
  borderColor: string;
  shadowColor: string;
  disabled?: boolean;
}

const buttonsConfig: ButtonConfig[] = [
  {
    id: 'murder',
    label: 'MURDER',
    icon: null, // Removed icon
    genre: Genre.Murder,
    textColor: 'text-red-400',
    borderColor: 'border-red-500',
    shadowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]',
  },
  {
    id: 'cybercrime',
    label: 'CYBERCRIME',
    icon: null, // Removed icon
    genre: Genre.Cybercrime,
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500',
    shadowColor: 'shadow-[0_0_15px_rgba(14,165,233,0.7)]',
  },
  {
    id: 'forgery',
    label: 'FORGERY',
    icon: null, // Removed icon
    genre: Genre.Forgery,
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500',
    shadowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.7)]',
  },
  {
    id: 'espionage',
    label: 'ESPIONAGE', // Corrected typo here
    icon: null, // Removed icon
    genre: Genre.Espionage,
    textColor: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-500',
    shadowColor: 'shadow-[0_0_15px_rgba(217,70,239,0.7)]',
  },
  {
    id: 'theft',
    label: 'THEFT',
    icon: null, // Removed icon
    genre: Genre.Theft,
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500',
    shadowColor: 'shadow-[0_0_15px_rgba(139,92,246,0.7)]',
  },
  {
    id: 'cold-case', // Updated ID
    label: 'COLD CASE',
    icon: null, // Removed icon
    genre: Genre.ColdCase, // Enabled and linked to new enum
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500',
    shadowColor: 'shadow-[0_0_15px_rgba(20,184,166,0.7)]',
  },
];

const GenreSelector: React.FC<GenreSelectorProps> = ({ onSelectGenre, disabled, onRestart }) => {
  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center gap-2 px-4">
      {/* Background overlay/effect */}
      <div className="absolute inset-0 bg-gray-950 opacity-80 z-0"></div>
      <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h3v1H0V0zm0 3h2v1H0V3zm3 0h3v1H3V3zm1 0h2v1H4V3z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Top Bar: Logo, Digital Detective Text, Refresh Icon */}
      <div className="absolute top-0 left-0 w-full">
        <Header onRestart={onRestart} />
      </div>

      {/* Central Brain/Magnifying Glass Image */}
      <div className="relative z-10">
        <img
          src="https://rabbitmarketinghouse.in/webinar/assets/Screenshot%202026-01-13%20115710.png"
          alt="Brain with Magnifying Glass"
          className="w-16 h-16 md:w-20 md:h-20 object-contain animate-pulse-light"
        />
      </div>

      {/* Content for Genre Selection */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg">
        <h2 className="text-lg font-light text-gray-200 tracking-widest uppercase mb-3 text-center">
          CHOOSE YOUR MYSTERY:
        </h2>

        {/* Genre Selection Grid (3 columns for 6 options) */}
        <div className="grid grid-cols-3 gap-2.5 px-4 w-full">
          {buttonsConfig.map((button) => (
            <Button
              key={button.id}
              onClick={() => button.genre && onSelectGenre(button.genre)}
              disabled={disabled || button.disabled}
              className={`flex flex-col items-center justify-center p-2 h-16 md:h-20 text-center text-sm font-bold uppercase
                bg-gray-700 bg-opacity-20 backdrop-filter backdrop-blur-sm
                border-2 ${button.borderColor} rounded-lg
                hover:bg-opacity-40 transition-all duration-300 ease-in-out
                ${button.textColor} ${button.shadowColor}
                ${(disabled || button.disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* No icon rendered here */}
              {button.label && <span className={'text-xs md:text-sm'}>{button.label}</span>}
            </Button>
          ))}
        </div>
        {disabled && ( // Display loading indicator when AI is generating a mystery
          <div className="flex space-x-2 mt-3">
            <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce-dot-1"></div>
            <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce-dot-2"></div>
            <div className="h-3 w-3 bg-indigo-500 rounded-full animate-bounce-dot-3"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreSelector;