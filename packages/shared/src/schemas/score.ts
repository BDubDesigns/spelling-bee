import { z } from "zod";

/**
 * Score schemas.
 *
 * Scoring rules:
 * - 4-letter words: 1 point
 * - 5+ letter words: 1 point per letter
 * - Pangrams (using all 7 letters): word length + 7 bonus points
 */

/** A single word score entry */
export const wordScoreSchema = z.object({
  /** The word that was scored */
  word: z.string(),
  /** Points earned for this word */
  points: z.number().int().positive(),
  /** Whether this word is a pangram */
  isPangram: z.boolean(),
});

/** A complete score submission for a puzzle */
export const scoreSchema = z.object({
  /** Unique score ID */
  id: z.string(),
  /** The user who earned this score */
  userId: z.string(),
  /** The puzzle this score is for */
  puzzleId: z.string(),
  /** All words found with their individual scores */
  words: z.array(wordScoreSchema),
  /** Total score for the puzzle */
  totalScore: z.number().int().nonnegative(),
  /** Number of words found */
  wordsFound: z.number().int().nonnegative(),
  /** Total words available in the puzzle */
  totalWords: z.number().int().positive(),
  /** Rank achieved (e.g., "GENIUS") */
  rank: z.string(),
  /** Percentage of maximum possible score */
  percentOfMax: z.number().min(0).max(100),
  /** Whether all words have been found */
  isComplete: z.boolean(),
  /** When the score was submitted */
  submittedAt: z.string().datetime(),
});

/** Breakdown of how a score was calculated */
export const scoreBreakdownSchema = z.object({
  /** Points from 4-letter words (1 pt each) */
  fourLetterPoints: z.number().int().nonnegative(),
  /** Points from longer words (1 pt per letter) */
  longerWordPoints: z.number().int().nonnegative(),
  /** Bonus points from pangrams (+7 each) */
  pangramBonus: z.number().int().nonnegative(),
  /** Total score */
  total: z.number().int().nonnegative(),
});

export type WordScore = z.infer<typeof wordScoreSchema>;
export type Score = z.infer<typeof scoreSchema>;
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>;
