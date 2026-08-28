import { Genre, MysteryCase } from '../types';

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const GEMINI_MODEL = 'gemini-3.6-flash';

// Vite replaces `import.meta.env.*` in both dev and build, but only replaces
// `process.env.GEMINI_API_KEY` at build time (via `define` in vite.config).
// In dev the left side resolves from .env.local's VITE_GEMINI_API_KEY and
// short-circuits; in the production build `process.env.GEMINI_API_KEY` is
// statically replaced with the key string, so no `process` reference remains.
const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const buildPrompt = (genre: Genre): string => `You are a "Hardboiled Noir" Mystery Engine. Your goal is to generate high-stakes, atmospheric crime cases that keep the player on the edge of their seat.

NARRATIVE STYLE:
1. TONE: Gritty, suspenseful, and professional. Use simple, easy-to-understand English for the scenes. Avoid overly complex vocabulary or sentence structures. Use sensory details (e.g., "the smell of stale cigarettes," "the flicker of a broken neon sign," "the cold steel of a forgotten gun").
2. STRUCTURE:
   - Scene 1: The Hook. Start with a shocking discovery or a tense confrontation.
   - Scene 2: The Twist. Introduce a clue that contradicts an earlier assumption, deepening the mystery.
   - Scene 3: The Pressure. Raise the stakes; describe a suspect fleeing, vital evidence being destroyed, or a new threat emerging.
   - Scene 4: The Smoking Gun. Drop the final, unambiguous clue that directly points to the correct answer. This clue must be subtle but undeniably conclusive upon reflection.
3. Scene endings MUST use dramatic ellipses (...) to encourage clicking "Continue."
4. HINTS: Provide one subtle hint for each scene. These hints should guide the player's thinking or draw attention to a detail without directly giving away the solution. They should be short, concise, and in the form of an observation or question, e.g., "Note the strange scorch mark on the floor."

Ensure the 'correct_index' matches one of the provided options (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D). The explanation should be concise, dramatic, and clearly link back to the smoking gun clue from Scene 4. The mystery must be engaging and fit the specified genre: "${genre}".`;

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

const responseSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    scenes: { type: 'ARRAY', items: { type: 'STRING' } },
    question: { type: 'STRING' },
    options: { type: 'ARRAY', items: { type: 'STRING' } },
    correct_index: { type: 'NUMBER' },
    explanation: { type: 'STRING' },
    hints: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['title', 'scenes', 'question', 'options', 'correct_index', 'explanation', 'hints'],
};

export const generateMysteryCase = async (genre: Genre): Promise<MysteryCase> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_DELAY_MS = 1000; // 1 second
  const REQUEST_TIMEOUT_MS = 20000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildPrompt(genre) }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema,
                maxOutputTokens: 2000,
                thinkingConfig: { thinkingBudget: 1 }, // 0 isn't accepted by this model; 1 is the minimum and fastest allowed value
              },
            }),
            signal: controller.signal,
          }
        );
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`);
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errBody = await response.text();

        if (response.status === 429) {
          // Retrying won't help until the quota window resets, so fail immediately instead of burning all attempts.
          throw new RateLimitError("Gemini's free-tier request limit has been reached. Please wait a bit and try again, or use a key with more quota.");
        }

        throw new Error(`Gemini request failed (${response.status}): ${errBody}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini response contained no content.');
      }

      const mysteryCase: MysteryCase = JSON.parse(content);

      // Basic validation to ensure the generated JSON matches the schema
      if (
        !mysteryCase.title ||
        !Array.isArray(mysteryCase.scenes) ||
        mysteryCase.scenes.length !== 4 ||
        !mysteryCase.question ||
        !Array.isArray(mysteryCase.options) ||
        mysteryCase.options.length !== 4 ||
        typeof mysteryCase.correct_index !== 'number' ||
        mysteryCase.correct_index < 0 ||
        mysteryCase.correct_index > 3 ||
        !mysteryCase.explanation ||
        !Array.isArray(mysteryCase.hints) ||
        mysteryCase.hints.length !== 4
      ) {
        throw new Error("Invalid mystery case structure received from API.");
      }

      return mysteryCase; // If successful, return the case
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      console.error(`Attempt ${attempt} failed to generate mystery case:`, error);
      if (attempt < MAX_RETRIES) {
        const backoffDelay = INITIAL_BACKOFF_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${backoffDelay / 1000} seconds...`);
        await delay(backoffDelay);
      } else {
        // If all retries fail, re-throw the last error
        throw new Error(`Failed to generate mystery case after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  // This line should theoretically not be reached but added for type safety
  throw new Error("Failed to generate mystery case due to unexpected retry loop exit.");
};
