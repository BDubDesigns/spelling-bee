import { Router } from "express";
import { getLeaderboard } from "@/services";
import { createSuccessResponse } from "@spelling-bee/shared";

/**
 * Leaderboard routes.
 *
 * GET /api/leaderboard/:timeframe — Get leaderboard (daily, weekly, allTime)
 */

const router = Router();

router.get("/:timeframe", async (req, res, next) => {
  try {
    const timeframe = req.params.timeframe as "daily" | "weekly" | "allTime";
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const leaderboard = await getLeaderboard(timeframe, limit);

    res.json(createSuccessResponse(leaderboard));
  } catch (err) {
    next(err);
  }
});

export const leaderboardRouter = router;
