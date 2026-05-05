import { Router } from "express";
import { UserModel } from "@/models";
import { createSuccessResponse } from "@spelling-bee/shared";

/**
 * Clerk webhook routes.
 *
 * POST /api/webhooks/clerk — Receives Clerk webhook events
 *
 * Events we handle:
 * - user.created: Create user in our database
 * - user.updated: Update user in our database
 * - user.deleted: Soft-delete or remove user
 */

const router = Router();

/** Verify webhook signature (simplified — in production, verify Svix signature) */
const verifyWebhook = (_req: { headers: Record<string, string | string[] | undefined> }): boolean => {
  // In production, verify the Svix signature headers:
  // svix-id, svix-timestamp, svix-signature
  // For dev, we'll accept all webhooks
  return true;
};

/** Handle Clerk webhook events */
router.post("/clerk", async (req, res, next) => {
  try {
    if (!verifyWebhook(req)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    const { type, data } = req.body;

    switch (type) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, username } = data;
        const email = email_addresses?.[0]?.email_address ?? "";
        const displayName = first_name
          ? `${first_name} ${last_name ?? ""}`.trim()
          : username ?? "Player";

        await UserModel.create({
          clerkUserId: id,
          displayName,
          email,
          membershipTier: "free",
          puzzlesCompleted: 0,
          totalWordsFound: 0,
          bestRank: null,
        });

        console.log(`User created: ${id} (${displayName})`);
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, username } = data;
        const email = email_addresses?.[0]?.email_address ?? "";
        const displayName = first_name
          ? `${first_name} ${last_name ?? ""}`.trim()
          : username ?? "Player";

        await UserModel.findOneAndUpdate(
          { clerkUserId: id },
          { displayName, email },
          { new: true },
        );

        console.log(`User updated: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = data;
        await UserModel.findOneAndDelete({ clerkUserId: id });
        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    res.json(createSuccessResponse({ received: true }));
  } catch (err) {
    next(err);
  }
});

export const webhookRouter = router;
