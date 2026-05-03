import { useState } from "react";
import { clsx } from "clsx";
import { Layout } from "@/components/layout";
import { HexGrid, WordInput, ScoreDisplay, FoundWords } from "@/components/game";
import { Leaderboard, FriendsList, InviteModal } from "@/components/social";
import { useGame } from "@/hooks";

/** Tab identifiers */
type Tab = "game" | "leaderboard" | "friends";

/**
 * Root application component.
 *
 * Wires together the game state, hex grid, word input,
 * score display, and found words list. Includes tabs for
 * leaderboard and friends features.
 */
export const App = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>("game");
  const [showInvite, setShowInvite] = useState(false);

  const {
    puzzle,
    foundWords,
    currentWord,
    totalScore,
    isLoading,
    feedback,
    addLetter,
    deleteLetter,
    clearWord,
    submitWord,
    handleKeyPress,
  } = useGame();

  if (isLoading || !puzzle) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-muted">Loading puzzle...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Tab navigation */}
      <div className="flex justify-center gap-1 mb-6">
        {(
          [
            { id: "game" as const, label: "Game" },
            { id: "leaderboard" as const, label: "Leaderboard" },
            { id: "friends" as const, label: "Friends" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.id
                ? "bg-bee-yellow text-bee-brown"
                : "text-muted hover:text-bee-brown hover:bg-slate-100",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "game" && (
        <div className="flex flex-col items-center gap-8">
          {/* Score display */}
          <ScoreDisplay
            totalScore={totalScore}
            maxScore={puzzle.maxScore}
            wordsFound={foundWords.length}
            totalWords={puzzle.totalWords}
          />

          {/* Word input and feedback */}
          <WordInput
            currentWord={currentWord}
            centerLetter={puzzle.centerLetter}
            feedback={feedback}
            onKeyPress={handleKeyPress}
          />

          {/* Hex grid */}
          <HexGrid
            letters={puzzle.letters}
            centerLetter={puzzle.centerLetter}
            onLetterClick={addLetter}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={deleteLetter}
              className="px-4 py-2 text-sm font-medium text-bee-brown bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={clearWord}
              className="px-4 py-2 text-sm font-medium text-bee-brown bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={submitWord}
              disabled={currentWord.length < 4}
              className="px-6 py-2 text-sm font-bold text-bee-brown bg-bee-yellow rounded-lg hover:bg-bee-yellow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enter
            </button>
          </div>

          {/* Shuffle and Invite buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                /* TODO: shuffle outer letters */
              }}
              className="text-sm text-muted hover:text-bee-brown transition-colors"
            >
              Shuffle Letters
            </button>
            <button
              onClick={() => setShowInvite(true)}
              className="text-sm text-bee-yellow-dark hover:text-bee-brown transition-colors font-medium"
            >
              Invite a Friend
            </button>
          </div>

          {/* Found words */}
          <FoundWords words={foundWords} />
        </div>
      )}

      {activeTab === "leaderboard" && <Leaderboard />}
      {activeTab === "friends" && (
        <div className="flex flex-col items-center gap-4">
          <FriendsList />
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 text-sm font-medium text-bee-brown bg-bee-yellow rounded-lg hover:bg-bee-yellow-dark transition-colors"
          >
            Invite a Friend
          </button>
        </div>
      )}

      {/* Invite modal */}
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
    </Layout>
  );
};
