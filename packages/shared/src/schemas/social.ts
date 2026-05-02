import { z } from "zod";

/**
 * Social schemas.
 *
 * Friend system: users can send, accept, or decline friend requests.
 * Friends can see each other's scores on the friends-only leaderboard.
 */

/** Status of a friend request */
export const friendRequestStatusSchema = z.enum(["pending", "accepted", "declined"]);

/** A friend request or established friendship */
export const friendshipSchema = z.object({
  /** Unique friendship ID */
  id: z.string(),
  /** The user who sent the request */
  requesterId: z.string(),
  /** The user who received the request */
  recipientId: z.string(),
  /** Current status of the request */
  status: friendRequestStatusSchema,
  /** When the friendship record was created */
  createdAt: z.string().datetime(),
  /** When the status was last changed */
  updatedAt: z.string().datetime(),
});

/** A friend invite link */
export const friendInviteSchema = z.object({
  /** Unique invite ID */
  id: z.string(),
  /** The user who created the invite */
  inviterId: z.string(),
  /** The inviter's display name */
  inviterName: z.string(),
  /** Optional message from the inviter */
  message: z.string().max(200).optional(),
  /** When the invite was created */
  createdAt: z.string().datetime(),
  /** When the invite expires (null = never) */
  expiresAt: z.string().datetime().nullable(),
});

/** Request to send a friend request */
export const sendFriendRequestSchema = z.object({
  /** The user to send the request to */
  recipientId: z.string(),
});

/** Request to respond to a friend request */
export const respondToFriendRequestSchema = z.object({
  /** The friendship ID */
  friendshipId: z.string(),
  /** Whether to accept or decline */
  action: z.enum(["accept", "decline"]),
});

export type FriendRequestStatus = z.infer<typeof friendRequestStatusSchema>;
export type Friendship = z.infer<typeof friendshipSchema>;
export type FriendInvite = z.infer<typeof friendInviteSchema>;
export type SendFriendRequest = z.infer<typeof sendFriendRequestSchema>;
export type RespondToFriendRequest = z.infer<typeof respondToFriendRequestSchema>;
