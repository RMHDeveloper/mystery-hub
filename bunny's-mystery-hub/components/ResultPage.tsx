import React, { useMemo } from 'react';
import { MysteryCase } from '../types';
import Button from './Button';

interface ResultPageProps {
  isCorrect: boolean;
  mystery: MysteryCase;
  onRestart: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ isCorrect, mystery, onRestart }) => {
  // Generate confetti for the winner theme only
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      />
    ));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center font-sans">
      {/* 1. INJECTED CSS ANIMATIONS */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 6px;
          height: 10px;
          z-index: 25;
          animation: fall linear forwards;
        }
        /* Removed @keyframes pulse-slow and .animate-badge as the SVG badge is replaced by a static image */
      `}</style>

      {/* 2. GLOBAL HEADER */}
      <div className="shrink-0 w-full p-3 flex justify-start items-center z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <img
          src="https://rabbitmarketinghouse.in/webinar/assets/crimelogo-removebg-preview.png"
          alt="Digital Detective Logo"
          className="h-10 w-auto"
        />
        {/* Removed onRestart button */}
      </div>

      {/* 3. THEME BACKGROUNDS */}
      {isCorrect ? (
        <div className="absolute inset-0 z-0"></div>
      ) : (
        <div
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center grayscale contrast-125"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1449156003053-c29380af999a?auto=format&fit=crop&q=80&w=1000')` }}
        ></div>
      )}

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/40 to-black"></div>

      {/* 4. CONFETTI */}
      {isCorrect && <div className="absolute inset-0 z-20 pointer-events-none">{confettiPieces}</div>}

      {/* 5. MAIN CONTENT - scrolls internally so header/button never move */}
      <div className="relative z-30 flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center justify-center px-8 text-center">
        {isCorrect ? (
          <>
            <img
              src="https://rabbitmarketinghouse.in/webinar/assets/winner.png"
              alt="Winner Trophy"
              className="w-32 h-auto mb-3 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]"
            />
          </>
        ) : (
          <>
            <div className="mb-3 text-yellow-600/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <circle cx="10" cy="10" r="3" strokeWidth="1" />
                <path d="M7 10h6" strokeWidth="1" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-widest mb-3 uppercase">Not Quite!</h2>
          </>
        )}

        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-sm mb-4">
          <span className={`font-bold ${isCorrect ? 'text-yellow-400' : 'text-cyan-400'}`}>
            {isCorrect ? 'CORRECT! ' : 'Keep investigating, Detective. '}
          </span>
          {mystery.explanation}
        </p>
      </div>

      {/* 6. NEON START BUTTON - fixed, always visible */}
      <div className="relative z-30 shrink-0 pb-6">
        <Button variant="neonGreen" onClick={onRestart}>
          Start New Case
        </Button>
      </div>
    </div>
  );
};

export default ResultPage;