import { useMultiplayerStore } from "@/stores/multiplayer";

/**
 * Results — shows the final results of a multiplayer game.
 */

export const Results = (): React.JSX.Element => {
  const { result, reset } = useMultiplayerStore();

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <h2 className="text-xl font-bold text-bee-brown">Game Over</h2>
        <p className="text-sm text-muted">No results available.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-bee-brown bg-bee-yellow rounded-lg hover:bg-bee-yellow-dark transition-colors"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const myRanking = result.rankings[0]; // Simplified — should find actual player

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-2xl font-bold text-bee-brown">
        {myRanking?.isWinner ? "You Won!" : "Game Over"}
      </h2>

      {/* Rankings */}
      <div className="w-full max-w-sm space-y-3">
        {result.rankings.map((ranking) => (
          <div
            key={ranking.rank}
            className={`flex items-center justify-between p-3 rounded-lg ${
              ranking.isWinner
                ? "bg-amber-50 border-2 border-amber-300"
                : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-bee-brown">#{ranking.rank}</span>
              <span className="font-medium text-bee-brown">
                {ranking.player.displayName}
              </span>
            </div>
            <div className="text-right">
              <div className="font-bold text-bee-brown">{ranking.player.score}</div>
              <div className="text-xs text-muted">{ranking.player.wordsFound} words</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-bee-brown bg-bee-yellow rounded-lg hover:bg-bee-yellow-dark transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
