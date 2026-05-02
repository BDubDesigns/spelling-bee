/**
 * TypeScript types inferred from Zod schemas.
 *
 * These types are derived from the schemas in @/schemas to ensure
 * consistency between runtime validation and compile-time types.
 *
 * Import these types for type annotations. Import schemas for runtime validation.
 */

export type { PuzzleLetters, WordSubmission, ValidationErrorCode, WordValidationResult } from "@/schemas/word";

export type { PuzzleRank, Puzzle } from "@/schemas/puzzle";
export { DEFAULT_RANK_THRESHOLDS } from "@/schemas/puzzle";

export type { MembershipTier, User, PublicUser } from "@/schemas/user";

export type { WordScore, Score, ScoreBreakdown } from "@/schemas/score";

export type { LeaderboardTimeframe, LeaderboardEntry, Leaderboard } from "@/schemas/leaderboard";

export type {
  FriendRequestStatus,
  Friendship,
  FriendInvite,
  SendFriendRequest,
  RespondToFriendRequest,
} from "@/schemas/social";

export type { ApiErrorCode, ApiSuccessResponse, ApiErrorResponse, ApiResponse } from "@/schemas/api";
export { createSuccessResponse, createErrorResponse } from "@/schemas/api";
