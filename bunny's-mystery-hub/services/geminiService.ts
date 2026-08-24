import { GoogleGenAI, Type } from "@google/genai";
import { Genre, MysteryCase } from '../types';

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const generateMysteryCase = async (genre: Genre): Promise<MysteryCase> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are a "Hardboiled Noir" Mystery Engine. Your goal is to generate high-stakes, atmospheric crime cases that keep the player on the edge of their seat.

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
  "correct_index": 0, // 0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D
  "explanation": "A dramatic reveal explaining how the Scene 4 clue proved the culprit's guilt, referencing the specific detail.",
  "hints": [
    "Hint for Scene 1...",
    "Hint for Scene 2...",
    "Hint for Scene 3...",
    "Hint for Scene 4..."
  ]
}
Ensure the 'correct_index' matches one of the provided options. The explanation should be concise, dramatic, and clearly link back to the smoking gun clue from Scene 4. The mystery must be engaging and fit the specified genre: "${genre}".`;

  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_DELAY_MS = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              scenes: { type: Type.ARRAY, items: { type: Type.STRING } },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct_index: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } }, // Added hints to schema
            },
            required: ["title", "scenes", "question", "options", "correct_index", "explanation", "hints"], // Added hints to required
          },
          thinkingConfig: { thinkingBudget: 0 } // Added to prioritize faster generation
        },
      });

      const jsonStr = response.text.trim();
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
        !Array.isArray(mysteryCase.hints) || // Validate hints array
        mysteryCase.hints.length !== 4 // Ensure 4 hints
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