import { UserButton, SignInButton, useUser } from "@clerk/clerk-react";

/**
 * Header — top navigation bar with Clerk auth controls.
 */

export const Header = (): React.JSX.Element => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-bee-yellow shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-bee-brown">Spelling Bee</h1>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <span className="text-sm text-bee-brown/70">
                {user.firstName ?? user.username ?? "Player"}
              </span>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-sm font-medium text-bee-brown bg-white rounded-lg hover:bg-slate-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};
