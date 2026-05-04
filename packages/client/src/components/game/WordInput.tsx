import { useEffect, useCallback, useState } from "react";
import { clsx } from "clsx";
import type { Feedback } from "@/stores";

/**
 * WordInput — displays the current word and handles keyboard input.
 */

interface WordInputProps {
  /** The current word being typed */
  currentWord: string;
  /** The center letter (for highlighting) */
  centerLetter: string;
  /** Feedback message to display */
  feedback: Feedback | null;
  /** Callback for keyboard events */
  onKeyPress: (key: string) => void;
}

export const WordInput = ({
  currentWord,
  centerLetter,
  feedback,
  onKeyPress,
}: WordInputProps): React.JSX.Element => {
  /** Key to force animation replay on new feedback */
  const [feedbackKey, setFeedbackKey] = useState(0);

  /** Listen for keyboard events */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      onKeyPress(e.key);
    },
    [onKeyPress],
  );

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    return (): void => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /** Increment key when feedback changes to replay animation */
  useEffect(() => {
    if (feedback) {
      setFeedbackKey((k) => k + 1);
    }
  }, [feedback]);

  return (
    <div className="flex flex-col items-center gap-2 h-20 justify-start">
      {/* Current word display */}
      <div className="game-input text-3xl font-bold h-12 flex items-center justify-center">
        {currentWord.split("").map((letter, index) => (
          <span
            key={index}
            className={clsx(
              "inline-block",
              letter === centerLetter && "text-bee-yellow-dark",
            )}
          >
            {letter}
          </span>
        ))}
        {!currentWord && (
          <span className="text-muted animate-pulse">|</span>
        )}
      </div>

      {/* Feedback message with float-up animation */}
      {feedback && (
        <div
          key={feedbackKey}
          className={clsx(
            "text-sm font-bold px-4 py-1.5 rounded-full feedback-pop",
            feedback.type === "success" && "bg-green-100 text-green-700",
            feedback.type === "pangram" && "bg-amber-100 text-amber-700",
            feedback.type === "error" && "bg-red-100 text-red-700 word-error",
            feedback.type === "info" && "bg-slate-100 text-slate-700",
          )}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};
