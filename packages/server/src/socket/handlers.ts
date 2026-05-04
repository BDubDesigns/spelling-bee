import type { Server, Socket } from "socket.io";
import {
  setSocketServer,
  joinQueue,
  leaveQueue,
  getPlayerRoom,
  getRoomPuzzle,
  startGame,
  submitWord,
  playerFinished,
  endGame,
  removePlayer,
  isGameExpired,
} from "@/services/multiplayer";

/**
 * Socket.IO event handlers for multiplayer.
 *
 * Events (client → server):
 *   join_queue    — Join matchmaking queue
 *   leave_queue   — Leave matchmaking queue
 *   submit_word   — Submit a word during game
 *   game_finished — Player signals they're done

 * Events (server → client):
 *   match_found    — Matched with opponent, room info
 *   game_starting  — Countdown (3 seconds)
 *   game_started   — Game has started, puzzle data
 *   score_update   — Opponent's score updated
 *   game_ended     — Game over, final results
 *   opponent_left  — Opponent disconnected
 */

/** Countdown duration in seconds before game starts */
const COUNTDOWN_SECONDS = 3;

/**
 * Initializes Socket.IO event handlers.
 */
export const initSocketHandlers = (io: Server): void => {
  setSocketServer(io);

  io.on("connection", (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    /** Join matchmaking queue */
    socket.on("join_queue", (data: { userId?: string; displayName?: string }) => {
      const userId = data.userId ?? "anonymous";
      const displayName = data.displayName ?? "Player";

      const roomId = joinQueue(socket.id, userId, displayName);

      if (roomId) {
        // Match found — notify both players
        const room = getPlayerRoom(socket.id);
        if (!room) return;

        // Join both sockets to the room
        for (const player of room.players) {
          io.sockets.sockets.get(player.socketId)?.join(roomId);
        }

        // Notify both players of the match
        io.to(roomId).emit("match_found", {
          roomId,
          players: room.players.map((p) => ({
            socketId: p.socketId,
            displayName: p.displayName,
            userId: p.userId,
          })),
          duration: room.duration,
        });

        // Start countdown
        setTimeout(() => {
          io.to(roomId).emit("game_starting", { seconds: COUNTDOWN_SECONDS });
        }, 500);

        // Start game after countdown
        setTimeout(() => {
          startGame(roomId);
          const puzzle = getRoomPuzzle(roomId);

          io.to(roomId).emit("game_started", {
            roomId,
            puzzle: puzzle
              ? {
                  id: puzzle.id,
                  letters: puzzle.letters,
                  centerLetter: puzzle.centerLetter,
                  totalWords: puzzle.totalWords,
                  maxScore: puzzle.maxScore,
                }
              : null,
            startedAt: new Date().toISOString(),
            duration: room.duration,
          });

          // Set timer to end the game
          setTimeout(() => {
            if (isGameExpired(roomId)) {
              const result = endGame(roomId);
              if (result) {
                io.to(roomId).emit("game_ended", result);
              }
            }
          }, room.duration * 1000);
        }, (COUNTDOWN_SECONDS + 1) * 1000);
      } else {
        // Queued — notify the player
        socket.emit("queued", { message: "Searching for opponent..." });
      }
    });

    /** Leave matchmaking queue */
    socket.on("leave_queue", () => {
      leaveQueue(socket.id);
      socket.emit("queue_left", {});
    });

    /** Submit a word during game */
    socket.on("submit_word", (data: { word: string; foundWords: string[] }) => {
      const room = getPlayerRoom(socket.id);
      if (!room || room.status !== "playing") return;

      const result = submitWord(room.id, socket.id, data.word, data.foundWords);

      if (result.valid) {
        // Notify the player of their score
        socket.emit("word_accepted", {
          word: data.word,
          points: result.points,
          isPangram: result.isPangram,
        });

        // Notify the opponent of the score update
        const opponent = room.players.find((p) => p.socketId !== socket.id);
        if (opponent) {
          const playerState = room.players.find((p) => p.socketId === socket.id);
          io.to(opponent.socketId).emit("score_update", {
            socketId: socket.id,
            score: playerState?.score ?? 0,
            wordsFound: playerState?.wordsFound ?? 0,
          });
        }
      } else {
        socket.emit("word_rejected", { message: result.message });
      }
    });

    /** Player signals they're done */
    socket.on("game_finished", () => {
      const room = getPlayerRoom(socket.id);
      if (!room) return;

      playerFinished(room.id, socket.id);

      // If all players finished, send results
      if (room.players.every((p) => p.isFinished)) {
        const result = endGame(room.id);
        if (result) {
          io.to(room.id).emit("game_ended", result);
        }
      }
    });

    /** Player disconnects */
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      const room = getPlayerRoom(socket.id);
      if (room) {
        // Notify opponent
        const opponent = room.players.find((p) => p.socketId !== socket.id);
        if (opponent) {
          io.to(opponent.socketId).emit("opponent_left", {
            message: "Opponent disconnected",
          });
        }

        // Remove player and clean up
        removePlayer(socket.id);
      } else {
        // Just remove from queue if queued
        leaveQueue(socket.id);
      }
    });
  });
};
