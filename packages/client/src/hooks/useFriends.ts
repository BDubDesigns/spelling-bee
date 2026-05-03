import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import type { Friendship, PublicUser } from "@spelling-bee/shared";

/**
 * Hook for managing friend requests and friends list.
 */

interface UseFriendsReturn {
  /** List of friends */
  friends: PublicUser[];
  /** Pending friend requests (incoming) */
  pendingRequests: Friendship[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Send a friend request */
  sendRequest: (recipientId: string) => Promise<boolean>;
  /** Accept a friend request */
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  /** Decline a friend request */
  declineRequest: (friendshipId: string) => Promise<boolean>;
  /** Fetch friends and requests */
  fetchFriends: () => Promise<void>;
}

export const useFriends = (): UseFriendsReturn => {
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();

  const fetchFriends = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [friendsData, requestsData] = await Promise.all([
        get<PublicUser[]>("/social/friends"),
        get<Friendship[]>("/social/requests"),
      ]);

      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (err) {
      setError("Failed to load friends");
      console.error("Friends fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const sendRequest = useCallback(async (recipientId: string): Promise<boolean> => {
    try {
      await post("/social/request", { recipientId });
      return true;
    } catch (err) {
      setError("Failed to send friend request");
      console.error("Send request error:", err);
      return false;
    }
  }, [post]);

  const acceptRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    try {
      await post("/social/respond", { friendshipId, action: "accept" });
      await fetchFriends();
      return true;
    } catch (err) {
      setError("Failed to accept request");
      console.error("Accept request error:", err);
      return false;
    }
  }, [post, fetchFriends]);

  const declineRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    try {
      await post("/social/respond", { friendshipId, action: "decline" });
      await fetchFriends();
      return true;
    } catch (err) {
      setError("Failed to decline request");
      console.error("Decline request error:", err);
      return false;
    }
  }, [post, fetchFriends]);

  return {
    friends,
    pendingRequests,
    isLoading,
    error,
    sendRequest,
    acceptRequest,
    declineRequest,
    fetchFriends,
  };
};
