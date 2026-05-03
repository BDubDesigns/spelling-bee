/**
 * TypeScript types inferred from Zod schemas.
 *
 * Re-exports all types from the schemas module for convenience.
 * Import types from here; import schemas for runtime validation.
 */

export type {
  PuzzleLetters,
  WordSubmission,
  ValidationErrorCode,
  WordValidationResult,
  PuzzleRank,
  Puzzle,
  MembershipTier,
  User,
  PublicUser,
  WordScore,
  Score,
  ScoreBreakdown,
  LeaderboardTimeframe,
  LeaderboardEntry,
  Leaderboard,
  FriendRequestStatus,
  Friendship,
  FriendInvite,
  SendFriendRequest,
  RespondToFriendRequest,
  ApiErrorCode,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from "../schemas/index";

export { DEFAULT_RANK_THRESHOLDS, createSuccessResponse, createErrorResponse } from "../schemas/index";
