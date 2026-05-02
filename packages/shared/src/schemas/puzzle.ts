import { z } from "zod";

/**
 * Puzzle schemas.
 *
 * A puzzle consists of 7 unique letters with one designated as the center letter.
 * Every valid word must use the center letter and only letters from the set.
 * At least one pangram (word using all 7 letters) is guaranteed.
 */

/** The rank thresholds based on percentage of maximum possible score */
export const puzzleRankSchema = z.enum([
  "BEGINNER",
  "GOOD_START",
  "MOVING_UP",
  "GOOD",
  "SOLID",
  "NICE",
  "GREAT",
  "AMAZING",
  "GENIUS",
]);

/** A complete puzzle definition */
export const puzzleSchema = z.object({
  /** Unique puzzle identifier */
  id: z.string(),
  /** The seven available letters */
  letters: z.array(z.string().length(1)).length(7),
  /** The center letter (must be used in every word) */
  centerLetter: z.string().length(1),
  /** Total number of valid words for this puzzle */
  totalWords: z.number().int().positive(),
  /** Maximum possible score for this puzzle */
  maxScore: z.number().int().positive(),
  /** The date this puzzle is active (ISO date string, e.g. "2026-05-02") */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Whether this is the daily puzzle or a generated practice puzzle */
  isDaily: z.boolean(),
  /** When the puzzle was created */
  createdAt: z.string().datetime(),
});

/** The rank thresholds as percentage ranges */
export const rankThresholdsSchema = z.record(
  puzzleRankSchema,
  z.object({
    /** Minimum percentage of max score to achieve this rank */
    minPercent: z.number().min(0).max(100),
    /** Display label for this rank */
    label: z.string(),
  }),
);

export type PuzzleRank = z.infer<typeof puzzleRankSchema>;
export type Puzzle = z.infer<typeof puzzleSchema>;

/** Default rank thresholds matching the NYT Spelling Bee */
export const DEFAULT_RANK_THRESHOLDS: Record<PuzzleRank, { minPercent: number; label: string }> = {
  BEGINNER: { minPercent: 0, label: "Beginner" },
  GOOD_START: { minPercent: 2, label: "Good Start" },
  MOVING_UP: { minPercent: 5, label: "Moving Up" },
  GOOD: { minPercent: 8, label: "Good" },
  SOLID: { minPercent: 15, label: "Solid" },
  NICE: { minPercent: 25, label: "Nice" },
  GREAT: { minPercent: 40, label: "Great" },
  AMAZING: { minPercent: 50, label: "Amazing" },
  GENIUS: { minPercent: 70, label: "Genius" },
} as const;
