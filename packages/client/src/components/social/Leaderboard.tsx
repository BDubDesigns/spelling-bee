import { clsx } from "clsx";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardTimeframe, LeaderboardEntry } from "@spelling-bee/shared";

/**
 * Leaderboard — displays ranked scores for a given timeframe.
 */

const TIMEFRAMES: Array<{ value: LeaderboardTimeframe; label: string }> = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "allTime", label: "All Time" },
];

/** Single leaderboard row */
const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }): React.JSX.Element => {
  const rankColors = {
    1: "text-amber-500 font-bold",
    2: "text-slate-400 font-bold",
    3: "text-amber-700 font-bold",
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "w-6 text-center text-sm",
            rankColors[entry.rank as keyof typeof rankColors] ?? "text-muted",
          )}
        >
          {entry.rank}
        </span>
        <span className="font-medium text-bee-brown">{entry.displayName}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted">{entry.wordsFound} words</span>
        <span className="font-bold text-bee-brown">{entry.score}</span>
      </div>
    </div>
  );
};

export const Leaderboard = (): React.JSX.Element => {
  const { leaderboard, isLoading, error, timeframe, setTimeframe } = useLeaderboard();

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Timeframe tabs */}
      <div className="flex border-b border-slate-200">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={clsx(
              "flex-1 py-2 text-sm font-medium transition-colors",
              timeframe === tf.value
                ? "text-bee-yellow-dark border-b-2 border-bee-yellow"
                : "text-muted hover:text-bee-brown",
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8 text-center text-muted">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : leaderboard && leaderboard.entries.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {leaderboard.entries.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted">No scores yet. Be the first!</div>
      )}

      {/* Footer */}
      {leaderboard && (
        <div className="px-3 py-2 bg-slate-50 text-xs text-muted text-center">
          {leaderboard.totalParticipants} participant{leaderboard.totalParticipants !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
