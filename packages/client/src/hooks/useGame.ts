import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "@/stores";
import { useApi } from "./useApi";
import type { Puzzle, Score } from "@spelling-bee/shared";

/** The valid branch of WordValidationResult */
interface ValidWordResult {
  valid: true;
  word: string;
  points: number;
  isPangram: boolean;
}

/** Response shape from POST /puzzle/submit (only returned for valid words) */
interface SubmitResponse {
  result: ValidWordResult;
  score: Score;
}

/**
 * Game hook — orchestrates game state and API calls.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGame = () => {
  const {
    puzzle,
    foundWords,
    currentWord,
    totalScore,
    rank,
    isLoading,
    feedback,
    setPuzzle,
    addLetter,
    deleteLetter,
    clearWord,
    addFoundWord,
    setLoading,
    showFeedback,
    clearFeedback,
  } = useGameStore();

  const { get, post } = useApi();
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Show feedback with auto-clear after 2 seconds */
  const showTimedFeedback = useCallback(
    (type: Parameters<typeof showFeedback>[0], message: string): void => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
      showFeedback(type, message);
      feedbackTimer.current = setTimeout(() => {
        clearFeedback();
        feedbackTimer.current = null;
      }, 2000);
    },
    [showFeedback, clearFeedback],
  );

  /** Fetch today's puzzle */
  const fetchTodayPuzzle = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const puzzleData = await get<Puzzle>("/puzzle/today");
      setPuzzle(puzzleData);
    } catch (err) {
      showTimedFeedback("error", "Failed to load puzzle");
      console.error("Failed to fetch puzzle:", err);
    } finally {
      setLoading(false);
    }
  }, [get, setPuzzle, setLoading, showTimedFeedback]);

  /** Submit a word */
  const submitWord = useCallback(async (): Promise<void> => {
    if (!puzzle || currentWord.length < 4) return;

    try {
      const data = await post<SubmitResponse>("/puzzle/submit", {
        word: currentWord,
        puzzleId: puzzle.id,
      });

      // Word was valid — add to found words
      addFoundWord({
        word: data.result.word,
        points: data.result.points,
        isPangram: data.result.isPangram,
      });

      if (data.result.isPangram) {
        showTimedFeedback("pangram", `${data.result.word} — Pangram! +${data.result.points}`);
      } else {
        showTimedFeedback("success", `${data.result.word} +${data.result.points}`);
      }
    } catch (err: unknown) {
      // Extract the error message from the API response
      const apiErr = err as { errorCode?: string; message?: string };
      const message = apiErr.message || "Word not accepted";
      showTimedFeedback("error", message);
    }
  }, [puzzle, currentWord, post, addFoundWord, showTimedFeedback]);

  /** Handle keyboard input */
  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "Enter") {
        submitWord();
      } else if (key === "Backspace") {
        deleteLetter();
      } else if (key === "Escape") {
        clearWord();
      } else if (/^[a-z]$/.test(key)) {
        addLetter(key);
      }
    },
    [submitWord, deleteLetter, clearWord, addLetter],
  );

  /** Load puzzle on mount */
  useEffect(() => {
    if (!puzzle) {
      fetchTodayPuzzle();
    }
  }, [puzzle, fetchTodayPuzzle]);

  /** Cleanup feedback timer on unmount */
  useEffect((): (() => void) => {
    return (): void => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  return {
    puzzle,
    foundWords,
    currentWord,
    totalScore,
    rank,
    isLoading,
    feedback,
    addLetter,
    deleteLetter,
    clearWord,
    submitWord,
    handleKeyPress,
    clearFeedback,
  };
};
