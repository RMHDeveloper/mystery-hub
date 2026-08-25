import React from 'react';

interface HeaderProps {
  onRestart: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart }) => {
  return (
    <div className="relative w-full px-4 py-2 flex justify-between items-center z-20 mx-auto max-w-lg md:max-w-3xl lg:max-w-4xl">
      <div className="flex items-center space-x-2">
        <img
          src="https://rabbitmarketinghouse.in/webinar/assets/crimelogo-removebg-preview.png"
          alt="Bunny's Mystery Hub Logo"
          className="h-8 w-auto"
        />
        <span className="text-gray-100 text-sm font-semibold tracking-wide">Bunny's Mystery Hub</span>
      </div>
      <button
        onClick={onRestart}
        className="text-gray-400 hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
        title="Restart Application"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15"></path></svg>
      </button>
    </div>
  );
};

export default Header;