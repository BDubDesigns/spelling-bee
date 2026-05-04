import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import type { WordScore } from "@spelling-bee/shared";

/**
 * FoundWords — displays the list of words the player has found.
 * Newly added words get a brief highlight animation.
 */

interface FoundWordsProps {
  /** Array of found word scores */
  words: WordScore[];
}

export const FoundWords = ({ words }: FoundWordsProps): React.JSX.Element => {
  /** Track the most recently added word for highlighting */
  const [newWord, setNewWord] = useState<string | null>(null);
  const prevCount = useRef(words.length);

  useEffect((): (() => void) => {
    if (words.length > prevCount.current) {
      // A new word was added — highlight the most recent one
      const latest = words[words.length - 1];
      if (latest) {
        setNewWord(latest.word);
        const timer = setTimeout(() => setNewWord(null), 1000);
        prevCount.current = words.length;
        return (): void => clearTimeout(timer);
      }
    }
    prevCount.current = words.length;
    return (): void => {};
  }, [words]);

  if (words.length === 0) {
    return (
      <div className="text-center text-sm text-muted py-4">
        No words found yet. Start typing!
      </div>
    );
  }

  /** Sort: pangrams first, then alphabetically */
  const sorted = [...words].sort((a, b) => {
    if (a.isPangram && !b.isPangram) return -1;
    if (!a.isPangram && b.isPangram) return 1;
    return a.word.localeCompare(b.word);
  });

  return (
    <div className="w-full max-w-sm mx-auto">
      <h3 className="text-sm font-medium text-muted mb-2">
        Found Words ({words.length})
      </h3>
      <div className="flex flex-wrap gap-1">
        {sorted.map((wordScore) => (
          <span
            key={wordScore.word}
            className={clsx(
              "text-sm px-2 py-0.5 rounded transition-all duration-300",
              wordScore.isPangram
                ? "bg-amber-100 text-amber-800 font-bold"
                : "bg-slate-100 text-slate-700",
              wordScore.word === newWord && "ring-2 ring-green-400 bg-green-50 word-found",
            )}
          >
            {wordScore.word}
          </span>
        ))}
      </div>
    </div>
  );
};
