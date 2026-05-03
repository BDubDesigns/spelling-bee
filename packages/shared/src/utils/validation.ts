import type { WordValidationResult, ValidationErrorCode } from "../types/index";
import { SCORING } from "./scoring";

/**
 * Word validation utilities.
 *
 * These functions validate word submissions against puzzle constraints.
 * Full dictionary validation happens server-side; these helpers check
 * the structural rules (length, letter usage, center letter).
 */

/**
 * Checks if a word uses only the allowed puzzle letters.
 *
 * @param word - The word to check (must be lowercase)
 * @param allowedLetters - The 7 available letters for the puzzle
 * @returns Whether every letter in the word is in the allowed set
 */
export const usesOnlyAllowedLetters = (word: string, allowedLetters: string[]): boolean => {
  const letterSet = new Set(allowedLetters);
  return word.split("").every((letter) => letterSet.has(letter));
};

/**
 * Checks if a word contains the center letter.
 *
 * @param word - The word to check (must be lowercase)
 * @param centerLetter - The required center letter
 * @returns Whether the word contains the center letter
 */
export const usesCenterLetter = (word: string, centerLetter: string): boolean => {
  return word.includes(centerLetter);
};

/**
 * Validates a word submission against puzzle constraints (without dictionary check).
 *
 * This performs all validation that doesn't require a dictionary lookup:
 * - Minimum length (4 characters)
 * - Contains the center letter
 * - Uses only allowed letters
 *
 * Dictionary validation (checking if the word exists) must be done separately
 * on the server side.
 *
 * @param word - The submitted word (will be lowercased)
 * @param letters - The 7 available puzzle letters
 * @param centerLetter - The required center letter
 * @returns A validation result indicating success or the specific error
 */
export const validateWordStructure = (
  word: string,
  letters: string[],
  centerLetter: string,
): WordValidationResult => {
  const normalizedWord = word.toLowerCase();

  if (normalizedWord.length < SCORING.MIN_WORD_LENGTH) {
    return {
      valid: false,
      error: "TOO_SHORT" satisfies ValidationErrorCode,
      message: `Words must be at least ${SCORING.MIN_WORD_LENGTH} letters long`,
    };
  }

  if (!usesCenterLetter(normalizedWord, centerLetter)) {
    return {
      valid: false,
      error: "MISSING_CENTER_LETTER" satisfies ValidationErrorCode,
      message: `Word must contain the center letter "${centerLetter.toUpperCase()}"`,
    };
  }

  if (!usesOnlyAllowedLetters(normalizedWord, letters)) {
    return {
      valid: false,
      error: "INVALID_LETTERS" satisfies ValidationErrorCode,
      message: "Word contains letters not in the puzzle",
    };
  }

  return {
    valid: true,
    word: normalizedWord,
    points: 0, // Points calculated after dictionary validation
    isPangram: false, // Determined after dictionary validation
  };
};

/**
 * Calculates the rank based on percentage of maximum possible score.
 *
 * @param currentScore - The player's current score
 * @param maxScore - The maximum possible score for the puzzle
 * @returns The rank string (e.g., "GENIUS") and percentage
 */
export const calculateRank = (
  currentScore: number,
  maxScore: number,
): { rank: string; percent: number } => {
  if (maxScore <= 0) {
    return { rank: "BEGINNER", percent: 0 };
  }

  const percent = Math.round((currentScore / maxScore) * 100);

  const thresholds: Array<{ min: number; rank: string }> = [
    { min: 70, rank: "GENIUS" },
    { min: 50, rank: "AMAZING" },
    { min: 40, rank: "GREAT" },
    { min: 25, rank: "NICE" },
    { min: 15, rank: "SOLID" },
    { min: 8, rank: "GOOD" },
    { min: 5, rank: "MOVING_UP" },
    { min: 2, rank: "GOOD_START" },
    { min: 0, rank: "BEGINNER" },
  ];

  for (const threshold of thresholds) {
    if (percent >= threshold.min) {
      return { rank: threshold.rank, percent };
    }
  }

  return { rank: "BEGINNER", percent };
};
