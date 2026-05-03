import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import type { Leaderboard, LeaderboardTimeframe } from "@spelling-bee/shared";

/**
 * Hook for fetching and managing leaderboard data.
 */

interface UseLeaderboardReturn {
  /** Current leaderboard data */
  leaderboard: Leaderboard | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Currently selected timeframe */
  timeframe: LeaderboardTimeframe;
  /** Set the timeframe and refetch */
  setTimeframe: (timeframe: LeaderboardTimeframe) => void;
  /** Refresh the leaderboard */
  refresh: () => void;
}

export const useLeaderboard = (initialTimeframe: LeaderboardTimeframe = "daily"): UseLeaderboardReturn => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframeState] = useState<LeaderboardTimeframe>(initialTimeframe);
  const { get } = useApi();

  const fetchLeaderboard = useCallback(async (tf: LeaderboardTimeframe): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await get<Leaderboard>(`/leaderboard/${tf}`);
      setLeaderboard(data);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const setTimeframe = useCallback((tf: LeaderboardTimeframe): void => {
    setTimeframeState(tf);
    void fetchLeaderboard(tf);
  }, [fetchLeaderboard]);

  const refresh = useCallback((): void => {
    void fetchLeaderboard(timeframe);
  }, [fetchLeaderboard, timeframe]);

  useEffect(() => {
    void fetchLeaderboard(timeframe);
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    refresh,
  };
};
