import type { WordScore, ScoreBreakdown } from "../types/index";

/**
 * Scoring constants for the Spelling Bee game.
 *
 * Rules:
 * - 4-letter words earn 1 point
 * - 5+ letter words earn 1 point per letter
 * - Pangrams (using all 7 letters) earn an additional 7 bonus points
 */
export const SCORING = {
  /** Points for a 4-letter word */
  FOUR_LETTER_POINTS: 1,
  /** Bonus points added for a pangram */
  PANGRAM_BONUS: 7,
  /** Minimum word length to be valid */
  MIN_WORD_LENGTH: 4,
} as const;

/**
 * Calculates the points for a single word.
 *
 * @param word - The word to score (must be lowercase)
 * @param isPangram - Whether the word uses all 7 puzzle letters
 * @returns The number of points earned
 *
 * @example
 * calculateWordPoints("able", false) // 1 (4-letter word)
 * calculateWordPoints("table", false) // 5 (5-letter word)
 * calculateWordPoints("belting", true) // 14 (7-letter pangram: 7 + 7 bonus)
 */
export const calculateWordPoints = (word: string, isPangram: boolean): number => {
  let points: number;

  if (word.length === 4) {
    points = SCORING.FOUR_LETTER_POINTS;
  } else {
    points = word.length;
  }

  if (isPangram) {
    points += SCORING.PANGRAM_BONUS;
  }

  return points;
};

/**
 * Checks if a word is a pangram (uses all 7 unique puzzle letters).
 *
 * @param word - The word to check (must be lowercase)
 * @param puzzleLetters - The 7 available letters for the puzzle
 * @returns Whether the word uses all 7 letters
 *
 * @example
 * isPangram("belting", ["b", "e", "l", "t", "i", "n", "g"]) // true
 * isPangram("belt", ["b", "e", "l", "t", "i", "n", "g"]) // false
 */
export const isPangram = (word: string, puzzleLetters: string[]): boolean => {
  const uniqueLetters = new Set(word.split(""));
  return puzzleLetters.every((letter) => uniqueLetters.has(letter));
};

/**
 * Creates a word score object for a validated word.
 *
 * @param word - The validated word
 * @param puzzleLetters - The 7 available puzzle letters
 * @returns A WordScore object with points and pangram status
 */
export const createWordScore = (word: string, puzzleLetters: string[]): WordScore => {
  const pangram = isPangram(word, puzzleLetters);
  const points = calculateWordPoints(word, pangram);

  return {
    word,
    points,
    isPangram: pangram,
  };
};

/**
 * Calculates the score breakdown from a list of found words.
 *
 * @param words - Array of word scores
 * @returns A breakdown showing how points were distributed
 */
export const calculateScoreBreakdown = (words: WordScore[]): ScoreBreakdown => {
  let fourLetterPoints = 0;
  let longerWordPoints = 0;
  let pangramBonus = 0;

  for (const word of words) {
    if (word.word.length === 4) {
      fourLetterPoints += SCORING.FOUR_LETTER_POINTS;
    } else {
      longerWordPoints += word.word.length;
    }

    if (word.isPangram) {
      pangramBonus += SCORING.PANGRAM_BONUS;
    }
  }

  return {
    fourLetterPoints,
    longerWordPoints,
    pangramBonus,
    total: fourLetterPoints + longerWordPoints + pangramBonus,
  };
};
