import { z } from "zod";

/**
 * Multiplayer schemas for real-time speed rounds.
 */

/** Status of a multiplayer game */
export const gameStatusSchema = z.enum([
  "waiting",    // Waiting for players in lobby
  "starting",   // Countdown to game start
  "playing",    // Game in progress
  "finished",   // Game over, showing results
]);

/** A player in a multiplayer game */
export const multiplayerPlayerSchema = z.object({
  /** Socket ID */
  socketId: z.string(),
  /** User ID (or "anonymous") */
  userId: z.string(),
  /** Display name */
  displayName: z.string(),
  /** Current score */
  score: z.number().int().nonnegative(),
  /** Words found */
  wordsFound: z.number().int().nonnegative(),
  /** Whether the player has finished (found all words or time up) */
  isFinished: z.boolean(),
});

/** A multiplayer game room */
export const gameRoomSchema = z.object({
  /** Unique room ID */
  id: z.string(),
  /** Current game status */
  status: gameStatusSchema,
  /** The puzzle for this game */
  puzzleId: z.string(),
  /** Players in the room */
  players: z.array(multiplayerPlayerSchema),
  /** Game duration in seconds */
  duration: z.number().int().positive(),
  /** When the game started (ISO string) */
  startedAt: z.string().datetime().nullable(),
  /** When the game ended (ISO string) */
  endedAt: z.string().datetime().nullable(),
});

/** Result of a multiplayer game */
export const gameResultSchema = z.object({
  /** Room ID */
  roomId: z.string(),
  /** Final rankings */
  rankings: z.array(
    z.object({
      /** Player rank (1-indexed) */
      rank: z.number().int().positive(),
      /** Player info */
      player: multiplayerPlayerSchema,
      /** Whether this player won */
      isWinner: z.boolean(),
    }),
  ),
  /** Total game duration in seconds */
  duration: z.number().int().positive(),
});

/** Socket events from client to server */
export const clientEventSchema = z.enum([
  "join_queue",     // Join matchmaking queue
  "leave_queue",    // Leave matchmaking queue
  "submit_word",    // Submit a word during game
  "game_finished",  // Player signals they're done
]);

/** Socket events from server to client */
export const serverEventSchema = z.enum([
  "match_found",     // Matched with opponent
  "game_starting",   // Countdown beginning
  "game_started",    // Game has started
  "score_update",    // Opponent's score updated
  "game_ended",      // Game over
  "opponent_left",   // Opponent disconnected
]);

export type GameStatus = z.infer<typeof gameStatusSchema>;
export type MultiplayerPlayer = z.infer<typeof multiplayerPlayerSchema>;
export type GameRoom = z.infer<typeof gameRoomSchema>;
export type GameResult = z.infer<typeof gameResultSchema>;
