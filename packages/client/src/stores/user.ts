import { create } from "zustand";

/**
 * User state store.
 *
 * Manages authentication state and user profile.
 */

interface UserState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** User display name */
  displayName: string | null;
  /** Membership tier */
  membershipTier: "free" | "paid";

  /** Set authentication state */
  setAuthenticated: (authenticated: boolean, displayName?: string) => void;
  /** Set membership tier */
  setMembershipTier: (tier: "free" | "paid") => void;
  /** Reset user state */
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  displayName: null,
  membershipTier: "free",

  setAuthenticated: (authenticated: boolean, displayName?: string): void => {
    set({
      isAuthenticated: authenticated,
      displayName: displayName ?? null,
    });
  },

  setMembershipTier: (tier: "free" | "paid"): void => {
    set({ membershipTier: tier });
  },

  reset: (): void => {
    set({
      isAuthenticated: false,
      displayName: null,
      membershipTier: "free",
    });
  },
}));
