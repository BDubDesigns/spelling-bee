import { useCallback, useEffect } from "react";
import { useGameStore } from "@/stores";
import { useApi } from "./useApi";
import type { Puzzle, WordValidationResult, Score } from "@spelling-bee/shared";

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

  /** Fetch today's puzzle */
  const fetchTodayPuzzle = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const puzzleData = await get<Puzzle>("/puzzle/today");
      setPuzzle(puzzleData);
    } catch (err) {
      showFeedback("error", "Failed to load puzzle");
      console.error("Failed to fetch puzzle:", err);
    } finally {
      setLoading(false);
    }
  }, [get, setPuzzle, setLoading, showFeedback]);

  /** Submit a word */
  const submitWord = useCallback(async (): Promise<void> => {
    if (!puzzle || currentWord.length < 4) return;

    try {
      const result = await post<{ result: WordValidationResult; score: Score }>("/puzzle/submit", {
        word: currentWord,
        puzzleId: puzzle.id,
      });

      if (result.result.valid) {
        addFoundWord({
          word: result.result.word,
          points: result.result.points,
          isPangram: result.result.isPangram,
        });

        if (result.result.isPangram) {
          showFeedback("pangram", `Pangram! +${result.result.points}`);
        } else {
          showFeedback("success", `+${result.result.points}`);
        }
      } else {
        showFeedback("error", result.result.message);
      }
    } catch (err) {
      showFeedback("error", "Failed to submit word");
      console.error("Failed to submit word:", err);
    }
  }, [puzzle, currentWord, post, addFoundWord, showFeedback]);

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
