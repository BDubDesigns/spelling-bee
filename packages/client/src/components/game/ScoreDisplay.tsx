import { calculateRank } from "@spelling-bee/shared";

/**
 * ScoreDisplay — shows the current score and rank progress.
 */

interface ScoreDisplayProps {
  /** Current total score */
  totalScore: number;
  /** Maximum possible score */
  maxScore: number;
  /** Number of words found */
  wordsFound: number;
  /** Total words available */
  totalWords: number;
}

/** Rank thresholds for progress bar segments */
const RANKS = [
  { name: "Beginner", min: 0 },
  { name: "Good Start", min: 2 },
  { name: "Moving Up", min: 5 },
  { name: "Good", min: 8 },
  { name: "Solid", min: 15 },
  { name: "Nice", min: 25 },
  { name: "Great", min: 40 },
  { name: "Amazing", min: 50 },
  { name: "Genius", min: 70 },
] as const;

export const ScoreDisplay = ({
  totalScore,
  maxScore,
  wordsFound,
  totalWords,
}: ScoreDisplayProps): React.JSX.Element => {
  const { rank, percent } = calculateRank(totalScore, maxScore);

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {/* Current rank */}
      <div className="text-center">
        <span className="text-lg font-bold text-bee-brown">{rank}</span>
        <span className="text-sm text-muted ml-2">
          {totalScore} / {maxScore} points
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-bee-yellow rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
        {/* Rank markers */}
        {RANKS.slice(1).map((r) => (
          <div
            key={r.name}
            className="absolute top-0 bottom-0 w-px bg-slate-400"
            style={{ left: `${r.min}%` }}
          />
        ))}
      </div>

      {/* Words found */}
      <div className="text-center text-sm text-muted">
        {wordsFound} of {totalWords} words found
      </div>
    </div>
  );
};
