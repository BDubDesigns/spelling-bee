import { z } from "zod";

/**
 * Leaderboard schemas.
 *
 * Leaderboards display ranked scores for a given time period.
 * Supports daily, weekly, and all-time views, plus friends-only filtering.
 */

/** Time period for leaderboard queries */
export const leaderboardTimeframeSchema = z.enum(["daily", "weekly", "allTime"]);

/** A single entry on the leaderboard */
export const leaderboardEntrySchema = z.object({
  /** User's rank position (1-indexed) */
  rank: z.number().int().positive(),
  /** User ID */
  userId: z.string(),
  /** Display name */
  displayName: z.string(),
  /** Total score for the timeframe */
  score: z.number().int().nonnegative(),
  /** Number of words found */
  wordsFound: z.number().int().nonnegative(),
  /** Highest rank title achieved (e.g., "GENIUS") */
  puzzleRank: z.string().nullable(),
  /** When this entry was last updated */
  updatedAt: z.string().datetime(),
});

/** Full leaderboard response */
export const leaderboardSchema = z.object({
  /** The timeframe this leaderboard covers */
  timeframe: leaderboardTimeframeSchema,
  /** The date this leaderboard is for (ISO date for daily, week start for weekly) */
  date: z.string(),
  /** Whether this is a friends-only leaderboard */
  isFriendsOnly: z.boolean(),
  /** The ranked entries */
  entries: z.array(leaderboardEntrySchema),
  /** Total number of participants */
  totalParticipants: z.number().int().nonnegative(),
});

export type LeaderboardTimeframe = z.infer<typeof leaderboardTimeframeSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
