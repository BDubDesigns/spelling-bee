import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useMultiplayerStore } from "@/stores/multiplayer";
import type { Puzzle, MultiplayerPlayer, GameResult } from "@spelling-bee/shared";

/**
 * Socket.IO hook for multiplayer.
 *
 * Manages the socket connection and event handlers.
 */

/** Socket.IO server URL (same origin in dev) */
const SOCKET_URL = "";

export const useSocket = (): Socket | null => {
  const socketRef = useRef<Socket | null>(null);
  const store = useMultiplayerStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    /** Match found */
    socket.on("match_found", (data: { roomId: string; players: MultiplayerPlayer[]; duration: number }) => {
      store.setMatchFound(data.roomId, data.players, data.duration);
      store.setPhase("countdown");
    });

    /** Game starting (countdown) */
    socket.on("game_starting", (_data: { seconds: number }) => {
      store.setPhase("countdown");
    });

    /** Game started */
    socket.on("game_started", (data: { puzzle: Puzzle; duration: number }) => {
      store.setGameStarted(data.puzzle, data.duration);
    });

    /** Score update from opponent */
    socket.on("score_update", (data: { socketId: string; score: number; wordsFound: number }) => {
      store.updateOpponentScore(data.score, data.wordsFound);
    });

    /** Game ended */
    socket.on("game_ended", (result: GameResult) => {
      store.setGameResult(result);
    });

    /** Opponent left */
    socket.on("opponent_left", (_data: { message: string }) => {
      // End the game — player wins by forfeit
      store.setPhase("results");
    });

    /** Word accepted */
    socket.on("word_accepted", (data: { word: string; points: number; isPangram: boolean }) => {
      store.addFoundWord(data.word);
    });

    return (): void => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef.current;
};

/**
 * Hook providing multiplayer actions.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useMultiplayer = () => {
  const socket = useSocket();
  const { phase, roomId, puzzle, timeRemaining, tick, foundWords, reset } = useMultiplayerStore();

  /** Join the matchmaking queue */
  const joinQueue = useCallback((displayName: string): void => {
    socket?.emit("join_queue", { userId: "anonymous", displayName });
    useMultiplayerStore.getState().setPhase("queued");
  }, [socket]);

  /** Leave the queue */
  const leaveQueue = useCallback((): void => {
    socket?.emit("leave_queue");
    reset();
  }, [socket, reset]);

  /** Submit a word during multiplayer */
  const submitWord = useCallback((word: string): void => {
    if (!socket || !roomId) return;
    socket.emit("submit_word", { word, foundWords });
  }, [socket, roomId, foundWords]);

  /** Signal that the player is done */
  const finishGame = useCallback((): void => {
    socket?.emit("game_finished");
  }, [socket]);

  /** Start the game timer */
  useEffect((): (() => void) => {
    if (phase !== "playing") return (): void => {};

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return (): void => clearInterval(interval);
  }, [phase, tick]);

  return {
    phase,
    roomId,
    puzzle,
    timeRemaining,
    joinQueue,
    leaveQueue,
    submitWord,
    finishGame,
  };
};
