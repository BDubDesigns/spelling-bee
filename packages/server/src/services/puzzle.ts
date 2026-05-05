import type { DictionaryDifficulty } from "./dictionary";
import { getDictionary } from "./dictionary";
import { calculateWordPoints, isPangram, validateWordStructure } from "@spelling-bee/shared";
import type { WordValidationResult, Puzzle } from "@spelling-bee/shared";

/**
 * Puzzle service — core game logic.
 *
 * Handles puzzle generation, word validation, and scoring.
 * Puzzles are generated deterministically from a seed (date string or random).
 */

/**
 * Simple seeded PRNG (mulberry32).
 * Returns a function that produces deterministic pseudo-random numbers.
 */
const createRng = (seed: number) => {
  return (): number => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Hashes a string to a 32-bit integer for seeding the PRNG.
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
};

/**
 * Selects 7 unique letters that form at least one pangram.
 *
 * Strategy: Find a pangram (word with 7 unique letters) in the dictionary,
 * then use its letters as the puzzle set. This guarantees a valid puzzle.
 *
 * @param rng - Seeded random number generator
 * @param trie - Dictionary trie to validate pangrams exist
 * @returns Object with letters array and center letter
 */
const selectLetters = (
  rng: () => number,
  trie: ReturnType<typeof getDictionary>,
): { letters: string[]; centerLetter: string } => {
  // Get all words and find pangrams (7 unique letters)
  const allWords = trie.findByPrefix("");
  const pangrams = allWords.filter(
    (w) => w.length >= 7 && new Set(w).size === 7,
  );

  if (pangrams.length === 0) {
    throw new Error("No pangrams found in dictionary");
  }

  // Pick a random pangram
  const pangramIdx = Math.floor(rng() * pangrams.length);
  const pangram = pangrams[pangramIdx];
  if (!pangram) {
    throw new Error("Failed to select pangram");
  }

  // Extract the 7 unique letters
  const letters = [...new Set(pangram)];

  // Pick a center letter (prefer common letters that appear in many words)
  const centerIdx = Math.floor(rng() * letters.length);
  const centerLetter = letters[centerIdx];
  if (!centerLetter) {
    throw new Error("Failed to select center letter");
  }

  return { letters, centerLetter };
};

/**
 * Finds all valid words for a given puzzle.
 *
 * Uses the trie's findByLetters to efficiently traverse only branches
 * with valid letters, then filters for center letter inclusion.
 *
 * @param letters - The 7 available letters
 * @param centerLetter - The required center letter
 * @param trie - Dictionary trie
 * @returns Array of valid words
 */
const findValidWords = (
  letters: string[],
  centerLetter: string,
  trie: ReturnType<typeof getDictionary>,
): string[] => {
  const letterSet = new Set(letters);
  // Efficient: only traverses branches with valid letters
  const candidateWords = trie.findByLetters(letterSet, 4);
  // Filter for center letter (can't prune this during traversal without knowing center)
  return candidateWords.filter((word) => word.includes(centerLetter));
};

/**
 * Generates a puzzle from a seed string.
 *
 * @param seed - Deterministic seed (e.g., "2026-05-02" or random UUID)
 * @param difficulty - Dictionary difficulty level
 * @returns Complete puzzle definition
 */
export const generatePuzzle = (
  seed: string,
  difficulty: DictionaryDifficulty = "medium",
): Puzzle => {
  const rng = createRng(hashString(seed));
  const trie = getDictionary(difficulty);

  const { letters, centerLetter } = selectLetters(rng, trie);
  const validWords = findValidWords(letters, centerLetter, trie);

  const totalScore = validWords.reduce((sum, word) => {
    const pangram = isPangram(word, letters);
    return sum + calculateWordPoints(word, pangram);
  }, 0);

  return {
    id: seed,
    letters,
    centerLetter,
    totalWords: validWords.length,
    maxScore: totalScore,
    date: seed.match(/^\d{4}-\d{2}-\d{2}$/) ? seed : new Date().toISOString().split("T")[0] ?? "",
    isDaily: seed.match(/^\d{4}-\d{2}-\d{2}$/) !== null,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Gets the current date string in UTC for the daily puzzle.
 * Resets at 8 AM UTC (midnight PST).
 */
export const getDailyDate = (): string => {
  const now = new Date();
  const utcHour = now.getUTCHours();

  // If before 8 AM UTC, use yesterday's date
  if (utcHour < 8) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().split("T")[0] ?? "";
};

/**
 * Validates a word submission against the puzzle and dictionary.
 *
 * @param word - The submitted word
 * @param puzzle - The current puzzle
 * @param foundWords - Words the player has already found
 * @param difficulty - Dictionary difficulty
 * @returns Validation result with points if valid
 */
export const validateSubmission = (
  word: string,
  puzzle: Puzzle,
  foundWords: string[],
  difficulty: DictionaryDifficulty = "medium",
): WordValidationResult => {
  // Structural validation (length, letters, center letter)
  const structural = validateWordStructure(word, puzzle.letters, puzzle.centerLetter);
  if (!structural.valid) {
    return structural;
  }

  // Check if already found
  if (foundWords.includes(word.toLowerCase())) {
    return {
      valid: false,
      error: "ALREADY_FOUND",
      message: "You already found this word",
    };
  }

  // Dictionary validation
  const trie = getDictionary(difficulty);
  if (!trie.search(word.toLowerCase())) {
    return {
      valid: false,
      error: "NOT_IN_DICTIONARY",
      message: "Word not found in dictionary",
    };
  }

  // Word is valid — calculate score
  const normalizedWord = word.toLowerCase();
  const pangram = isPangram(normalizedWord, puzzle.letters);
  const points = calculateWordPoints(normalizedWord, pangram);

  return {
    valid: true,
    word: normalizedWord,
    points,
    isPangram: pangram,
  };
};
