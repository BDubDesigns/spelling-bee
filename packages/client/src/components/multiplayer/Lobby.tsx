import { useState } from "react";
import { useMultiplayer } from "@/hooks/useMultiplayer";

/**
 * MultiplayerLobby — allows players to join the matchmaking queue.
 */

export const MultiplayerLobby = (): React.JSX.Element => {
  const { joinQueue } = useMultiplayer();
  const [name, setName] = useState("");

  const handleJoin = (): void => {
    const displayName = name.trim() || "Player";
    joinQueue(displayName);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-2xl font-bold text-bee-brown">Speed Round</h2>
      <p className="text-sm text-muted text-center max-w-sm">
        Challenge another player to a 2-minute speed round. Both players get the same puzzle — highest score wins!
      </p>

      <div className="w-full max-w-xs space-y-4">
        <div>
          <label htmlFor="display-name" className="block text-sm font-medium text-bee-brown mb-1">
            Your Name
          </label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bee-yellow"
            maxLength={20}
          />
        </div>

        <button
          onClick={handleJoin}
          className="w-full py-3 text-lg font-bold text-bee-brown bg-bee-yellow rounded-lg hover:bg-bee-yellow-dark transition-colors"
        >
          Find Opponent
        </button>
      </div>
    </div>
  );
};
