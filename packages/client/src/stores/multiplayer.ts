import { create } from "zustand";
import type { Puzzle, MultiplayerPlayer, GameResult } from "@spelling-bee/shared";

/**
 * Multiplayer state store.
 *
 * Manages the multiplayer game flow: lobby, game, results.
 */

/** Game phases */
export type GamePhase = "menu" | "queued" | "matched" | "countdown" | "playing" | "results";

interface MultiplayerState {
  /** Current game phase */
  phase: GamePhase;
  /** Room ID */
  roomId: string | null;
  /** Players in the current game */
  players: MultiplayerPlayer[];
  /** Shared puzzle for the game */
  puzzle: Puzzle | null;
  /** Game duration in seconds */
  duration: number;
  /** Seconds remaining */
  timeRemaining: number;
  /** Game result (after game ends) */
  result: GameResult | null;
  /** Opponent's current score */
  opponentScore: number;
  /** Opponent's words found */
  opponentWordsFound: number;
  /** Player's found words in this game */
  foundWords: string[];

  /** Set the game phase */
  setPhase: (phase: GamePhase) => void;
  /** Set room info after match found */
  setMatchFound: (roomId: string, players: MultiplayerPlayer[], duration: number) => void;
  /** Set the puzzle when game starts */
  setGameStarted: (puzzle: Puzzle, duration: number) => void;
  /** Update time remaining */
  tick: () => void;
  /** Update opponent's score */
  updateOpponentScore: (score: number, wordsFound: number) => void;
  /** Add a found word */
  addFoundWord: (word: string) => void;
  /** Set game result */
  setGameResult: (result: GameResult) => void;
  /** Reset state */
  reset: () => void;
}

const initialState = {
  phase: "menu" as GamePhase,
  roomId: null,
  players: [],
  puzzle: null,
  duration: 120,
  timeRemaining: 120,
  result: null,
  opponentScore: 0,
  opponentWordsFound: 0,
  foundWords: [],
};

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  ...initialState,

  setPhase: (phase: GamePhase): void => {
    set({ phase });
  },

  setMatchFound: (roomId: string, players: MultiplayerPlayer[], duration: number): void => {
    set({
      phase: "matched",
      roomId,
      players,
      duration,
      timeRemaining: duration,
    });
  },

  setGameStarted: (puzzle: Puzzle, duration: number): void => {
    set({
      phase: "playing",
      puzzle,
      duration,
      timeRemaining: duration,
      opponentScore: 0,
      opponentWordsFound: 0,
      foundWords: [],
    });
  },

  tick: (): void => {
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    }));
  },

  updateOpponentScore: (score: number, wordsFound: number): void => {
    set({ opponentScore: score, opponentWordsFound: wordsFound });
  },

  addFoundWord: (word: string): void => {
    set((state) => ({
      foundWords: [...state.foundWords, word],
    }));
  },

  setGameResult: (result: GameResult): void => {
    set({
      phase: "results",
      result,
    });
  },

  reset: (): void => {
    set(initialState);
  },
}));
