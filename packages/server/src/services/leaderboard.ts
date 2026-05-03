import { ScoreModel } from "@/models";
import type { Leaderboard, LeaderboardEntry, LeaderboardTimeframe } from "@spelling-bee/shared";

/**
 * Leaderboard service — generates ranked scoreboards.
 */

/**
 * Gets the start date for a given timeframe.
 */
const getStartDate = (timeframe: LeaderboardTimeframe): Date => {
  const now = new Date();

  switch (timeframe) {
    case "daily": {
      // Today at 8 AM UTC
      const today = new Date(now);
      today.setUTCHours(8, 0, 0, 0);
      if (now.getUTCHours() < 8) {
        today.setUTCDate(today.getUTCDate() - 1);
      }
      return today;
    }
    case "weekly": {
      // Start of current week (Monday)
      const day = now.getUTCDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = 0
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - diff);
      monday.setUTCHours(0, 0, 0, 0);
      return monday;
    }
    case "allTime":
      return new Date(0);
  }
};

/**
 * Generates a leaderboard for a given timeframe.
 *
 * @param timeframe - daily, weekly, or allTime
 * @param limit - Maximum entries to return
 * @returns Ranked leaderboard
 */
export const getLeaderboard = async (
  timeframe: LeaderboardTimeframe,
  limit = 50,
): Promise<Leaderboard> => {
  const startDate = getStartDate(timeframe);

  const pipeline = [
    {
      $match: {
        submittedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$userId",
        score: { $max: "$totalScore" },
        wordsFound: { $max: "$wordsFound" },
        puzzleRank: { $last: "$rank" },
        updatedAt: { $max: "$submittedAt" },
      },
    },
    { $sort: { score: -1 as const } },
    { $limit: limit },
  ];

  const results = await ScoreModel.aggregate(pipeline);

  const entries: LeaderboardEntry[] = results.map((r, idx) => ({
    rank: idx + 1,
    userId: r._id,
    displayName: r._id, // Will be resolved with user lookup in a future iteration
    score: r.score,
    wordsFound: r.wordsFound,
    puzzleRank: r.puzzleRank,
    updatedAt: r.updatedAt.toISOString(),
  }));

  const totalParticipants = await ScoreModel.distinct("userId", {
    submittedAt: { $gte: startDate },
  }).then((ids) => ids.length);

  return {
    timeframe,
    date: startDate.toISOString().split("T")[0] ?? "",
    isFriendsOnly: false,
    entries,
    totalParticipants,
  };
};
