import React from 'react';
import Button from './Button'; // Assuming Button component is in a components folder

interface LoadingScreenProps {
  onStartGame: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStartGame }) => {
  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black font-sans">
      {/* Background overlay/effect */}
      <div className="absolute inset-0 bg-gray-950 opacity-80 z-0"></div>
      <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h3v1H0V0zm0 3h2v1H0V3zm3 0h3v1H3V3zm1 0h2v1H4V3z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo */}
        <img
          src="https://rabbitmarketinghouse.in/webinar/assets/crimelogo-removebg-preview.png"
          alt="Bunny's Mystery Hub Logo"
          className="h-20 w-auto mb-4 md:h-28 animate-pulse-light drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
        />

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold uppercase text-cyan-400 tracking-widest text-center mb-6
                       drop-shadow-[0_0_25px_rgba(6,182,212,0.9)]">
          Bunny's Mystery Hub
        </h1>

        {/* Start Button */}
        <Button onClick={onStartGame} variant="neon" className="px-10 py-3 text-lg">
          Start New Case
        </Button>
      </div>
    </div>
  );
};

export default LoadingScreen;