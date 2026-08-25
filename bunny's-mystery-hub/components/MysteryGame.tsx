import React, { useState, useCallback, useEffect } from 'react';
import { MysteryCase } from '../types';
import Button from './Button';
import ResultPage from './ResultPage';
import Header from './Header'; // Import the new Header component

interface MysteryGameProps {
  mystery: MysteryCase;
  onRestart: () => void;
}

const MysteryGame: React.FC<MysteryGameProps> = ({ mystery, onRestart }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(13); // Placeholder timer
  const [showHint, setShowHint] = useState(false); // Re-added state for hint visibility

  // Effect for placeholder timer
  useEffect(() => {
    // We only need the timer for the scene display
    if (currentSceneIndex < mystery.scenes.length) {
      const interval = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSceneIndex, mystery.scenes.length]);

  // Effect to reset hint visibility when scene changes
  useEffect(() => {
    setShowHint(false);
  }, [currentSceneIndex]);

  const handleAnalyzeClick = useCallback(() => {
    if (currentSceneIndex < mystery.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setTimer(13); // Reset timer for next scene
    } else if (currentSceneIndex === mystery.scenes.length - 1) {
      setCurrentSceneIndex(mystery.scenes.length); // Move to the question state
      setTimer(0); // Stop timer when moving to question
    }
  }, [currentSceneIndex, mystery.scenes.length]);

  const previousScene = useCallback(() => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setTimer(13); // Reset timer for previous scene
    }
  }, [currentSceneIndex]);

  const handleOptionSelect = useCallback((index: number) => {
    setSelectedOptionIndex(index);
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    setShowResult(true);
  }, []);

  const toggleHint = useCallback(() => { // Re-added toggleHint function
    setShowHint(prev => !prev);
  }, []);

  const isCorrect = selectedOptionIndex === mystery.correct_index;

  if (showResult) {
    return <ResultPage isCorrect={isCorrect} mystery={mystery} onRestart={onRestart} />;
  }

  const getOptionButtonVariant = (optionIndex: number) => {
    if (selectedOptionIndex === null) {
      return 'primary';
    }
    
    if (optionIndex === mystery.correct_index) {
      return 'success';
    } else if (optionIndex === selectedOptionIndex) {
      return 'danger';
    }
    return 'primary';
  };

  const formattedTimer = `0:${timer < 10 ? '0' : ''}${timer}`;

  const isSceneActive = currentSceneIndex < mystery.scenes.length;
  // Determine if the hint section for the question should be shown
  // It should be shown if we are on the question screen (!isSceneActive)
  // AND if there are hints available (mystery.hints)
  // AND specifically, if there is a hint for the last scene (index 3, which is for Scene 4)
  const showHintSectionForQuestion = !isSceneActive && mystery.hints && mystery.hints[3]; 

  return (
    <div className="relative w-full h-screen flex flex-col items-center overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://rabbitmarketinghouse.in/webinar/assets/scene-bg.jpg')` }}
      ></div>
      {/* Dark Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

      {/* Header - fixed, always visible */}
      <div className="shrink-0 w-full">
        <Header onRestart={onRestart} />
      </div>

      {/* Main Content Area - scrolls internally so header/nav never move */}
      <div className="relative z-20 flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center gap-y-1.5 max-w-lg lg:max-w-xl px-4 mx-auto">
        {/* Scene Progress Indicators */}
        {currentSceneIndex < mystery.scenes.length + 1 && ( // +1 to show dots even for question screen
          <div className="flex space-x-2 shrink-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${index === currentSceneIndex ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'border border-cyan-400 bg-transparent'}
                `}
              ></div>
            ))}
          </div>
        )}

        {/* Scene Title / Question Title */}
        <h2 className="text-2xl font-bold uppercase text-cyan-400 tracking-widest text-center
                       drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] md:text-3xl whitespace-nowrap shrink-0">
          {isSceneActive ? `SCENE ${currentSceneIndex + 1} OF 5` : `QUESTION 5 OF 5`}
        </h2>

        {/* Scene Content / Question and Options */}
        {isSceneActive ? (
          <div className="relative w-full p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm
                          rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex flex-col">
            <p className="text-gray-200 text-sm md:text-base leading-snug whitespace-pre-wrap text-left">
              {mystery.scenes[currentSceneIndex]}
            </p>

            {/* Hint Button and Display for the current scene */}
            {mystery.hints && mystery.hints[currentSceneIndex] && (
              <div className="w-full flex flex-col items-center gap-y-1.5 mt-3">
                <Button onClick={toggleHint} variant="outline-neon" className="px-6 py-1.5 text-xs">
                  {showHint ? 'HIDE HINT' : 'SHOW HINT'}
                </Button>
                {showHint && (
                  <div className="w-full p-3 bg-gray-800 bg-opacity-70 backdrop-blur-sm
                                  rounded-xl border border-dashed border-yellow-500 shadow-[0_0_10px_rgba(252,211,77,0.4)] text-yellow-300 text-xs italic text-left">
                    {mystery.hints[currentSceneIndex]}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Question and Options Display
          <div className="relative w-full p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm
                          rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex flex-col">
            <p className="text-gray-300 text-sm md:text-base mb-3 text-left">
              {mystery.question}
            </p>
            <div className="flex flex-col space-y-2">
              {mystery.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getOptionButtonVariant(index)}
                  onClick={() => handleOptionSelect(index)}
                  className={`text-left justify-start px-3 py-2 rounded-xl text-sm ${selectedOptionIndex === index ? 'ring-2 ring-cyan-400' : ''}`}
                  disabled={selectedOptionIndex !== null}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>

            {/* Hint Button and Display for the Question Screen - REINTRODUCED HERE */}
            {showHintSectionForQuestion && (
              <div className="w-full flex flex-col items-center gap-y-1.5 mt-3">
                <Button onClick={toggleHint} variant="outline-neon" className="px-6 py-1.5 text-xs">
                  {showHint ? 'HIDE HINT' : 'SHOW HINT'}
                </Button>
                {showHint && (
                  <div className="w-full p-3 bg-gray-800 bg-opacity-70 backdrop-blur-sm
                                  rounded-xl border border-dashed border-yellow-500 shadow-[0_0_10px_rgba(252,211,77,0.4)] text-yellow-300 text-xs italic text-left">
                    {mystery.hints[3]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timer, Neon Line, and Navigation Buttons - fixed, always visible */}
      <div className="relative z-20 shrink-0 w-full max-w-lg lg:max-w-xl flex flex-col items-center px-4 gap-y-1.5 py-2">
        {/* Timer */}
        {isSceneActive && (
          <p className="text-2xl font-bold text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
            {formattedTimer}
          </p>
        )}

        {/* New Neon Bottom Line */}
        <div className="w-24 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-1">
          {currentSceneIndex > 0 && isSceneActive && (
            <Button onClick={previousScene} variant="outline-neon" className="px-6 py-2">
              PREVIOUS
            </Button>
          )}
          {currentSceneIndex === 0 && isSceneActive && (
            // Placeholder to keep "NEXT" button aligned right if no "PREVIOUS" button
            <div className="w-0 invisible"></div>
          )}

          {isSceneActive ? (
            <Button onClick={handleAnalyzeClick} variant="neon" className="px-6 py-2 text-sm ml-auto">
              {currentSceneIndex === mystery.scenes.length - 1 ? 'FINAL' : 'NEXT'}
            </Button>
          ) : (
            <div className="flex justify-between w-full"> {/* For question screen navigation */}
              <Button onClick={() => setCurrentSceneIndex(mystery.scenes.length - 1)} variant="outline-neon" className="px-6 py-2">
                BACK TO SCENES
              </Button>
              <Button onClick={handleSubmitAnswer} disabled={selectedOptionIndex === null} variant="neon" className="px-6 py-2 text-sm">
                SUBMIT
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MysteryGame;