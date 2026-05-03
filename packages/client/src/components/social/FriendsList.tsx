import { useEffect } from "react";
import { useFriends } from "@/hooks/useFriends";
import type { PublicUser, Friendship } from "@spelling-bee/shared";

/**
 * FriendsList — displays friends and pending requests.
 */

/** Friend request row with accept/decline buttons */
const FriendRequestRow = ({
  request,
  onAccept,
  onDecline,
}: {
  request: Friendship;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}): React.JSX.Element => {
  return (
    <div className="flex items-center justify-between py-2 px-3">
      <span className="text-sm text-bee-brown">{request.requesterId}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request.id)}
          className="px-3 py-1 text-xs font-medium text-white bg-correct rounded hover:bg-green-600 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-3 py-1 text-xs font-medium text-muted bg-slate-100 rounded hover:bg-slate-200 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

/** Friend row */
const FriendRow = ({ friend }: { friend: PublicUser }): React.JSX.Element => {
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-slate-100 last:border-0">
      <span className="font-medium text-bee-brown">{friend.displayName}</span>
      <span className="text-xs text-muted">{friend.puzzlesCompleted} puzzles</span>
    </div>
  );
};

export const FriendsList = (): React.JSX.Element => {
  const { friends, pendingRequests, isLoading, error, acceptRequest, declineRequest, fetchFriends } = useFriends();

  useEffect((): void => {
    void fetchFriends();
  }, [fetchFriends]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <h3 className="px-3 py-2 font-bold text-bee-brown border-b border-slate-200">Friends</h3>

      {isLoading ? (
        <div className="py-8 text-center text-muted">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="border-b border-slate-200">
              <div className="px-3 py-1 text-xs font-medium text-muted bg-slate-50">
                Pending Requests ({pendingRequests.length})
              </div>
              {pendingRequests.map((request) => (
                <FriendRequestRow
                  key={request.id}
                  request={request}
                  onAccept={(id) => void acceptRequest(id)}
                  onDecline={(id) => void declineRequest(id)}
                />
              ))}
            </div>
          )}

          {/* Friends list */}
          {friends.length > 0 ? (
            <div>
              {friends.map((friend) => (
                <FriendRow key={friend.id} friend={friend} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted">
              No friends yet. Share your invite link!
            </div>
          )}
        </>
      )}
    </div>
  );
};
