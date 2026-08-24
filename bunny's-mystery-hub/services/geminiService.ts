import { Genre, MysteryCase } from '../types';

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const OPENROUTER_MODEL = 'openrouter/free';

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

STRICT OUTPUT FORMAT:
Return ONLY a valid JSON object. No markdown. No conversational filler. Adhere strictly to this schema:
{
  "title": "A Gritty Case Name",
  "scenes": [
    "Scene 1 text...",
    "Scene 2 text...",
    "Scene 3 text...",
    "Scene 4 text..."
  ],
  "question": "A high-stakes final question (e.g., 'The killer is reaching for their gun. Who do you tackle?' or 'The clock is ticking. Who do you accuse before it's too late?')",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "A dramatic reveal explaining how the Scene 4 clue proved the culprit's guilt, referencing the specific detail.",
  "hints": [
    "Hint for Scene 1...",
    "Hint for Scene 2...",
    "Hint for Scene 3...",
    "Hint for Scene 4..."
  ]
}
Ensure the 'correct_index' matches one of the provided options (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D). The explanation should be concise, dramatic, and clearly link back to the smoking gun clue from Scene 4. The mystery must be engaging and fit the specified genre: "${genre}".`;

const extractJson = (raw: string): string => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return candidate.trim();
  return candidate.slice(start, end + 1).trim();
};

export const generateMysteryCase = async (genre: Genre): Promise<MysteryCase> => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set.");
  }

  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_DELAY_MS = 1000; // 1 second
  const REQUEST_TIMEOUT_MS = 20000; // free-tier models can be slow or hang; fail fast and retry

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: buildPrompt(genre) }],
            response_format: { type: 'json_object' },
            max_tokens: 3500,
            provider: { sort: 'latency' },
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`OpenRouter request timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`);
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`OpenRouter request failed (${response.status}): ${errBody}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenRouter response contained no content.');
      }

      const jsonStr = extractJson(content);
      const mysteryCase: MysteryCase = JSON.parse(jsonStr);

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
