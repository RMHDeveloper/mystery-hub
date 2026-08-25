import React, { useState, useCallback } from 'react';
import { Genre, MysteryCase } from './types';
import { generateMysteryCase, RateLimitError } from './services/geminiService';
import GenreSelector from './components/GenreSelector';
import MysteryGame from './components/MysteryGame';
import LoadingScreen from './components/LoadingScreen'; // Import the new LoadingScreen

const App: React.FC = () => {
  const [appStarted, setAppStarted] = useState(false); // New state for initial app start
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [mysteryCase, setMysteryCase] = useState<MysteryCase | null>(null);
  const [loading, setLoading] = useState(false); // This 'loading' is for AI generation
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = useCallback(() => {
    setAppStarted(true);
  }, []);

  const handleSelectGenre = useCallback(async (genre: Genre) => {
    setSelectedGenre(genre);
    setMysteryCase(null);
    setLoading(true); // Set loading for AI generation
    setError(null);

    try {
      const generatedMystery = await generateMysteryCase(genre);
      setMysteryCase(generatedMystery);
    } catch (err) {
      console.error("Failed to generate mystery:", err);
      if (err instanceof RateLimitError) {
        setError(err.message);
      } else {
        setError(`Failed to generate mystery case. Please try again.
        Details: ${err instanceof Error ? err.message : String(err)}`);
      }
      setSelectedGenre(null); // Allow selecting genre again
    } finally {
      setLoading(false); // Reset loading after AI generation
    }
  }, []);

  const handleRestartGame = useCallback(() => {
    setSelectedGenre(null);
    setMysteryCase(null);
    setError(null);
    setAppStarted(false); // Go back to the loading screen on full restart
  }, []);

  if (!appStarted) {
    return <LoadingScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="relative flex flex-col items-center w-full h-screen overflow-hidden">
      {error && (
        <div className="absolute top-4 w-full max-w-lg p-4 bg-red-800 text-white rounded-lg shadow-lg text-center z-50">
          <p className="font-semibold">Error:</p>
          <p className="text-sm mt-2 whitespace-pre-wrap">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {!mysteryCase && (
        <GenreSelector onSelectGenre={handleSelectGenre} disabled={loading} onRestart={handleRestartGame} />
      )}

      {mysteryCase && (
        <MysteryGame mystery={mysteryCase} onRestart={handleRestartGame} />
      )}
    </div>
  );
};

export default App;