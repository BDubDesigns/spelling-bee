import { Router } from "express";
import { createSuccessResponse } from "@spelling-bee/shared";
import type { Friendship, PublicUser } from "@spelling-bee/shared";

/**
 * Social routes.
 *
 * GET /api/social/friends    — Get user's friends list
 * GET /api/social/requests   — Get pending friend requests
 * POST /api/social/request   — Send a friend request
 * POST /api/social/respond   — Accept/decline a friend request
 */

const router = Router();

/** Get user's friends list */
router.get("/friends", async (_req, res, next) => {
  try {
    // TODO: Implement with Clerk auth and MongoDB
    const friends: PublicUser[] = [];
    res.json(createSuccessResponse(friends));
  } catch (err) {
    next(err);
  }
});

/** Get pending friend requests */
router.get("/requests", async (_req, res, next) => {
  try {
    // TODO: Implement with Clerk auth and MongoDB
    const requests: Friendship[] = [];
    res.json(createSuccessResponse(requests));
  } catch (err) {
    next(err);
  }
});

/** Send a friend request */
router.post("/request", async (_req, res, next) => {
  try {
    // TODO: Implement with Clerk auth and MongoDB
    res.json(createSuccessResponse({ success: true }));
  } catch (err) {
    next(err);
  }
});

/** Accept/decline a friend request */
router.post("/respond", async (_req, res, next) => {
  try {
    // TODO: Implement with Clerk auth and MongoDB
    res.json(createSuccessResponse({ success: true }));
  } catch (err) {
    next(err);
  }
});

export const socialRouter = router;
