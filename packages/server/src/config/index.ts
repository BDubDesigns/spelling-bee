/**
 * Application configuration.
 *
 * All configuration is read from environment variables with sensible defaults.
 * Uses `as const` for deep immutability and literal type narrowing.
 */

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

/** Server configuration */
export const config = {
  /** Server port */
  port: Number(getEnv("PORT", "3000")),

  /** Node environment */
  nodeEnv: getEnv("NODE_ENV", "development") as "development" | "production" | "test",

  /** Whether we're in production */
  get isProduction(): boolean {
    return this.nodeEnv === "production";
  },

  /** MongoDB connection URI */
  mongodbUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/spelling-bee"),

  /** Clerk authentication */
  clerk: {
    /** Clerk publishable key (frontend) */
    publishableKey: getEnv("CLERK_PUBLISHABLE_KEY", ""),
    /** Clerk secret key (backend) */
    secretKey: getEnv("CLERK_SECRET_KEY", ""),
  },

  /** CORS configuration */
  cors: {
    /** Allowed origins (comma-separated) */
    origin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
  },

  /** Rate limiting */
  rateLimit: {
    /** Window duration in milliseconds */
    windowMs: Number(getEnv("RATE_LIMIT_WINDOW_MS", "900000")), // 15 minutes
    /** Max requests per window */
    max: Number(getEnv("RATE_LIMIT_MAX", "100")),
  },

  /** Puzzle configuration */
  puzzle: {
    /** Daily puzzle reset hour (UTC) — 8 AM UTC = midnight PST */
    dailyResetHourUTC: 8,
    /** Maximum extra puzzles per day for paid users */
    paidUserDailyLimit: 10,
    /** Maximum extra puzzles per day for free users */
    freeUserDailyLimit: 1,
  },
} as const;
