import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { App } from "./App";
import "./styles/globals.css";

/** Clerk publishable key from environment (optional in dev) */
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

/** Wrapper that conditionally includes ClerkProvider */
const AppWithProviders = (): React.JSX.Element => {
  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    );
  }

  // No Clerk key — run without auth (dev mode)
  return <App />;
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppWithProviders />
    </ErrorBoundary>
  </React.StrictMode>,
);
