import { Layout } from "@/components/layout";
import { HexGrid, WordInput, ScoreDisplay, FoundWords } from "@/components/game";
import { useGame } from "@/hooks";

/**
 * Root application component.
 *
 * Wires together the game state, hex grid, word input,
 * score display, and found words list.
 */
export const App = (): React.JSX.Element => {
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

        {/* Shuffle button */}
        <button
          onClick={() => {
            /* TODO: shuffle outer letters */
          }}
          className="text-sm text-muted hover:text-bee-brown transition-colors"
        >
          Shuffle Letters
        </button>

        {/* Found words */}
        <FoundWords words={foundWords} />
      </div>
    </Layout>
  );
};
