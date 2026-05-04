import { generatePuzzle, validateSubmission } from "./puzzle";
import type { GameRoom, MultiplayerPlayer, GameResult, Puzzle } from "@spelling-bee/shared";

/**
 * Multiplayer service — manages game rooms, matchmaking, and game state.
 *
 * Game flow:
 * 1. Players join the matchmaking queue
 * 2. When 2 players are queued, a room is created
 * 3. Both players get the same puzzle
 * 4. Players submit words in real-time (2 minute rounds)
 * 5. Game ends when time runs out or both players finish
 * 6. Results are calculated and sent to both players
 */

/** Game duration in seconds */
const GAME_DURATION = 120;

/** Active game rooms indexed by room ID */
const rooms = new Map<string, GameRoom>();

/** Player socket ID to room ID mapping */
const playerRoomMap = new Map<string, string>();

/** Matchmaking queue (socket IDs waiting for a match) */
const queue: Array<{ socketId: string; userId: string; displayName: string }> = [];

/**
 * Sets the Socket.IO server instance (no-op — handlers manage the reference).
 */
export const setSocketServer = (_server: import("socket.io").Server): void => {
  // Socket reference is managed by the handlers module
};

/**
 * Adds a player to the matchmaking queue.
 * If another player is waiting, creates a match immediately.
 *
 * @returns The room ID if matched, null if queued
 */
export const joinQueue = (
  socketId: string,
  userId: string,
  displayName: string,
): string | null => {
  // Check if already in queue
  if (queue.some((p) => p.socketId === socketId)) {
    return null;
  }

  // Check if already in a game
  if (playerRoomMap.has(socketId)) {
    return null;
  }

  // Add to queue
  queue.push({ socketId, userId, displayName });

  // Try to match
  if (queue.length >= 2) {
    const player1 = queue.shift()!;
    const player2 = queue.shift()!;
    return createRoom(player1, player2);
  }

  return null;
};

/**
 * Removes a player from the matchmaking queue.
 */
export const leaveQueue = (socketId: string): void => {
  const index = queue.findIndex((p) => p.socketId === socketId);
  if (index !== -1) {
    queue.splice(index, 1);
  }
};

/**
 * Creates a game room for two players.
 */
const createRoom = (
  player1: { socketId: string; userId: string; displayName: string },
  player2: { socketId: string; userId: string; displayName: string },
): string => {
  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Generate a puzzle for this room
  const puzzleSeed = `mp-${roomId}`;
  const puzzle = generatePuzzle(puzzleSeed, "medium");

  const room: GameRoom = {
    id: roomId,
    status: "waiting",
    puzzleId: puzzle.id,
    players: [
      {
        socketId: player1.socketId,
        userId: player1.userId,
        displayName: player1.displayName,
        score: 0,
        wordsFound: 0,
        isFinished: false,
      },
      {
        socketId: player2.socketId,
        userId: player2.userId,
        displayName: player2.displayName,
        score: 0,
        wordsFound: 0,
        isFinished: false,
      },
    ],
    duration: GAME_DURATION,
    startedAt: null,
    endedAt: null,
  };

  rooms.set(roomId, room);
  playerRoomMap.set(player1.socketId, roomId);
  playerRoomMap.set(player2.socketId, roomId);

  return roomId;
};

/**
 * Gets a room by ID.
 */
export const getRoom = (roomId: string): GameRoom | undefined => {
  return rooms.get(roomId);
};

/**
 * Gets the room a player is in.
 */
export const getPlayerRoom = (socketId: string): GameRoom | undefined => {
  const roomId = playerRoomMap.get(socketId);
  if (!roomId) return undefined;
  return rooms.get(roomId);
};

/**
 * Gets the puzzle for a room.
 */
export const getRoomPuzzle = (roomId: string): Puzzle | undefined => {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  // Generate the same puzzle using the stored seed
  return generatePuzzle(room.puzzleId, "medium");
};

/**
 * Starts the game for a room.
 */
export const startGame = (roomId: string): void => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = "playing";
  room.startedAt = new Date().toISOString();
};

/**
 * Submits a word for a player in a multiplayer game.
 *
 * @returns The validation result and updated player state
 */
export const submitWord = (
  roomId: string,
  socketId: string,
  word: string,
  foundWords: string[],
): { valid: boolean; points?: number; isPangram?: boolean; message?: string } => {
  const room = rooms.get(roomId);
  if (!room || room.status !== "playing") {
    return { valid: false, message: "Game not in progress" };
  }

  const player = room.players.find((p) => p.socketId === socketId);
  if (!player) {
    return { valid: false, message: "Player not in room" };
  }

  const puzzle = generatePuzzle(room.puzzleId, "medium");
  const result = validateSubmission(word, puzzle, foundWords, "medium");

  if (result.valid) {
    player.score += result.points;
    player.wordsFound += 1;
  }

  return result;
};

/**
 * Marks a player as finished.
 */
export const playerFinished = (roomId: string, socketId: string): void => {
  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.find((p) => p.socketId === socketId);
  if (player) {
    player.isFinished = true;
  }

  // Check if all players are finished
  if (room.players.every((p) => p.isFinished)) {
    endGame(roomId);
  }
};

/**
 * Ends the game and calculates results.
 */
export const endGame = (roomId: string): GameResult | undefined => {
  const room = rooms.get(roomId);
  if (!room) return undefined;

  room.status = "finished";
  room.endedAt = new Date().toISOString();

  // Sort players by score (descending)
  const sorted = [...room.players].sort((a, b) => b.score - a.score);

  const rankings = sorted.map((player, index) => ({
    rank: index + 1,
    player,
    isWinner: index === 0,
  }));

  const result: GameResult = {
    roomId,
    rankings,
    duration: room.duration,
  };

  return result;
};

/**
 * Removes a player from their room (disconnect handling).
 */
export const removePlayer = (socketId: string): string | undefined => {
  const roomId = playerRoomMap.get(socketId);
  if (!roomId) return undefined;

  const room = rooms.get(roomId);
  if (!room) {
    playerRoomMap.delete(socketId);
    return undefined;
  }

  // Remove player from room
  room.players = room.players.filter((p) => p.socketId !== socketId);
  playerRoomMap.delete(socketId);

  // If room is empty, clean it up
  if (room.players.length === 0) {
    rooms.delete(roomId);
    return undefined;
  }

  return roomId;
};

/**
 * Gets the current state of a room's players (for score updates).
 */
export const getPlayerStates = (roomId: string): MultiplayerPlayer[] => {
  const room = rooms.get(roomId);
  if (!room) return [];
  return room.players;
};

/**
 * Checks if a game's time has expired.
 */
export const isGameExpired = (roomId: string): boolean => {
  const room = rooms.get(roomId);
  if (!room || !room.startedAt) return false;

  const elapsed = (Date.now() - new Date(room.startedAt).getTime()) / 1000;
  return elapsed >= room.duration;
};

/**
 * Cleans up expired rooms (call periodically).
 */
export const cleanupExpiredRooms = (): void => {
  for (const [roomId, room] of rooms) {
    if (room.status === "finished" && room.endedAt) {
      const endedAgo = (Date.now() - new Date(room.endedAt).getTime()) / 1000;
      if (endedAgo > 300) {
        // Remove after 5 minutes
        for (const player of room.players) {
          playerRoomMap.delete(player.socketId);
        }
        rooms.delete(roomId);
      }
    }
  }
};
