import { z } from "zod";

/**
 * User schemas.
 *
 * The user record is synced from Clerk via webhook. We store game-specific
 * data (membership tier, stats) while Clerk owns authentication.
 */

/** Membership tier determines puzzle generation limits */
export const membershipTierSchema = z.enum(["free", "paid"]);

/** User profile stored in our database */
export const userSchema = z.object({
  /** Internal MongoDB ObjectId */
  id: z.string(),
  /** Clerk user ID — the link key between Clerk and our DB */
  clerkUserId: z.string(),
  /** Display name (synced from Clerk) */
  displayName: z.string().min(1).max(50),
  /** Email address (synced from Clerk) */
  email: z.string().email(),
  /** Membership tier */
  membershipTier: membershipTierSchema,
  /** Total puzzles completed */
  puzzlesCompleted: z.number().int().nonnegative(),
  /** Total words found across all puzzles */
  totalWordsFound: z.number().int().nonnegative(),
  /** Highest rank achieved */
  bestRank: z.string().nullable(),
  /** When the user account was created */
  createdAt: z.string().datetime(),
  /** When the user was last updated */
  updatedAt: z.string().datetime(),
});

/** Lightweight public profile (for leaderboards, friend lists) */
export const publicUserSchema = userSchema.pick({
  id: true,
  displayName: true,
  membershipTier: true,
  puzzlesCompleted: true,
  bestRank: true,
});

export type MembershipTier = z.infer<typeof membershipTierSchema>;
export type User = z.infer<typeof userSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
