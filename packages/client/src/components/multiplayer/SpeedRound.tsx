import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useMultiplayerStore } from "@/stores/multiplayer";
import { HexGrid } from "@/components/game/HexGrid";

/**
 * SpeedRound — the main multiplayer game UI.
 *
 * Shows the shared puzzle, both players' scores, and a countdown timer.
 */

export const SpeedRound = (): React.JSX.Element => {
  const { puzzle, timeRemaining } = useMultiplayer();
  const { foundWords, opponentScore, opponentWordsFound, players } = useMultiplayerStore();

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-lg text-muted">Loading puzzle...</div>
      </div>
    );
  }

  const myScore = foundWords.reduce((sum, _word) => sum + 1, 0); // Simplified — real score from server
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 30;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer */}
      <div className={`text-4xl font-bold font-mono ${isLowTime ? "text-red-500" : "text-bee-brown"}`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>

      {/* Score comparison */}
      <div className="flex items-center gap-8 w-full max-w-md justify-center">
        <div className="text-center">
          <div className="text-sm text-muted">You</div>
          <div className="text-2xl font-bold text-bee-brown">{myScore}</div>
          <div className="text-xs text-muted">{foundWords.length} words</div>
        </div>

        <div className="text-xl font-bold text-muted">vs</div>

        <div className="text-center">
          <div className="text-sm text-muted">
            {players.find((p) => p.socketId !== players[0]?.socketId)?.displayName ?? "Opponent"}
          </div>
          <div className="text-2xl font-bold text-bee-brown">{opponentScore}</div>
          <div className="text-xs text-muted">{opponentWordsFound} words</div>
        </div>
      </div>

      {/* Puzzle */}
      <HexGrid
        letters={puzzle.letters}
        centerLetter={puzzle.centerLetter}
        onLetterClick={() => {
          // In multiplayer, we handle input differently
          // This will be wired up with a word input component
        }}
      />
    </div>
  );
};
