import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { config } from "@/config";
import { errorHandler } from "@/middleware";
import { puzzleRouter, leaderboardRouter, socialRouter } from "@/routes";
import { loadAllDictionaries } from "@/services";

/**
 * Spelling Bee Server
 *
 * Express API server that handles puzzle generation, word validation,
 * scoring, leaderboards, and social features.
 */

const app = express();

/** Security middleware */
app.use(helmet());

/** CORS middleware */
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

/** Body parsing middleware */
app.use(express.json());

/** Health check endpoint */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/** API routes */
app.use("/api/puzzle", puzzleRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/social", socialRouter);

/** Centralized error handler (must be last) */
app.use(errorHandler);

/**
 * Starts the server.
 *
 * Connects to MongoDB, loads all dictionaries into memory,
 * then starts listening for requests.
 */
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    // Load all dictionaries into memory (trie)
    loadAllDictionaries();

    // Start the server
    app.listen(config.port, () => {
      console.log(`Spelling Bee server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
