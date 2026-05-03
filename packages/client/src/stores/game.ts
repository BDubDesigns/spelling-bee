import { create } from "zustand";
import type { Puzzle, WordScore } from "@spelling-bee/shared";

/**
 * Game state store.
 *
 * Manages the current puzzle, player's found words, score,
 * and UI feedback state.
 */

/** Feedback message types */
export type FeedbackType = "success" | "pangram" | "error" | "info";

/** Feedback message */
export interface Feedback {
  type: FeedbackType;
  message: string;
}

interface GameState {
  /** Current puzzle */
  puzzle: Puzzle | null;
  /** Words the player has found */
  foundWords: WordScore[];
  /** Current word being typed */
  currentWord: string;
  /** Total score */
  totalScore: number;
  /** Current rank */
  rank: string;
  /** Loading state */
  isLoading: boolean;
  /** Feedback message */
  feedback: Feedback | null;

  /** Set the current puzzle */
  setPuzzle: (puzzle: Puzzle) => void;
  /** Add a letter to the current word */
  addLetter: (letter: string) => void;
  /** Remove the last letter */
  deleteLetter: () => void;
  /** Clear the current word */
  clearWord: () => void;
  /** Add a found word */
  addFoundWord: (word: WordScore) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Show feedback message */
  showFeedback: (type: FeedbackType, message: string) => void;
  /** Clear feedback */
  clearFeedback: () => void;
  /** Reset game state */
  reset: () => void;
}

const initialState = {
  puzzle: null,
  foundWords: [],
  currentWord: "",
  totalScore: 0,
  rank: "BEGINNER",
  isLoading: false,
  feedback: null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setPuzzle: (puzzle: Puzzle): void => {
    set({ puzzle, foundWords: [], currentWord: "", totalScore: 0, rank: "BEGINNER" });
  },

  addLetter: (letter: string): void => {
    set((state) => ({
      currentWord: state.currentWord + letter,
    }));
  },

  deleteLetter: (): void => {
    set((state) => ({
      currentWord: state.currentWord.slice(0, -1),
    }));
  },

  clearWord: (): void => {
    set({ currentWord: "" });
  },

  addFoundWord: (word: WordScore): void => {
    set((state) => {
      const newFoundWords = [...state.foundWords, word];
      const newTotalScore = state.totalScore + word.points;

      return {
        foundWords: newFoundWords,
        totalScore: newTotalScore,
        currentWord: "",
      };
    });
  },

  setLoading: (loading: boolean): void => {
    set({ isLoading: loading });
  },

  showFeedback: (type: FeedbackType, message: string): void => {
    set({ feedback: { type, message } });
  },

  clearFeedback: (): void => {
    set({ feedback: null });
  },

  reset: (): void => {
    set(initialState);
  },
}));
