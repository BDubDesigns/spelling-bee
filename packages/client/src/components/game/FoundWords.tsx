import { clsx } from "clsx";
import type { WordScore } from "@spelling-bee/shared";

/**
 * FoundWords — displays the list of words the player has found.
 */

interface FoundWordsProps {
  /** Array of found word scores */
  words: WordScore[];
}

export const FoundWords = ({ words }: FoundWordsProps): React.JSX.Element => {
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
              "text-sm px-2 py-0.5 rounded word-found",
              wordScore.isPangram
                ? "bg-amber-100 text-amber-800 font-bold"
                : "bg-slate-100 text-slate-700",
            )}
          >
            {wordScore.word}
          </span>
        ))}
      </div>
    </div>
  );
};
