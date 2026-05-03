import { ScoreModel } from "@/models";
import { calculateRank } from "@spelling-bee/shared";
import type { Score, WordScore } from "@spelling-bee/shared";

/**
 * Score service — handles score submission and retrieval.
 */

/**
 * Submits or updates a score for a user on a puzzle.
 *
 * @param userId - The user's ID
 * @param puzzleId - The puzzle ID
 * @param words - All words found with their scores
 * @param totalWords - Total words available in the puzzle
 * @param maxScore - Maximum possible score
 * @returns The saved score document
 */
export const submitScore = async (
  userId: string,
  puzzleId: string,
  words: WordScore[],
  totalWords: number,
  maxScore: number,
): Promise<Score> => {
  const totalScore = words.reduce((sum, w) => sum + w.points, 0);
  const { rank, percent } = calculateRank(totalScore, maxScore);

  const scoreData = {
    userId,
    puzzleId,
    words,
    totalScore,
    wordsFound: words.length,
    totalWords,
    rank,
    percentOfMax: percent,
    isComplete: words.length === totalWords,
  };

  const score = await ScoreModel.findOneAndUpdate(
    { userId, puzzleId },
    scoreData,
    { upsert: true, new: true },
  );

  return score.toJSON() as unknown as Score;
};

/**
 * Gets a user's score for a specific puzzle.
 */
export const getUserScore = async (
  userId: string,
  puzzleId: string,
): Promise<Score | null> => {
  const score = await ScoreModel.findOne({ userId, puzzleId });
  return score ? (score.toJSON() as unknown as Score) : null;
};

/**
 * Gets all scores for a puzzle, sorted by score descending.
 */
export const getPuzzleScores = async (puzzleId: string): Promise<Score[]> => {
  const scores = await ScoreModel.find({ puzzleId }).sort({ totalScore: -1 });
  return scores.map((s) => s.toJSON() as unknown as Score);
};
