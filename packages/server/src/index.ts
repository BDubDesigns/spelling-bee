import "./env"; // Must be first — loads .env before other imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "@/config";
import { errorHandler } from "@/middleware";
import { puzzleRouter, leaderboardRouter, socialRouter } from "@/routes";
import { loadAllDictionaries } from "@/services";
import { initSocketHandlers } from "@/socket/handlers";

/**
 * Spelling Bee Server
 *
 * Express API server with Socket.IO for multiplayer.
 * Handles puzzle generation, word validation, scoring,
 * leaderboards, social features, and real-time games.
 */

const app = express();
const httpServer = createServer(app);

/** Socket.IO server with CORS configuration */
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
 * initializes Socket.IO handlers, then starts listening.
 */
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    // Load all dictionaries into memory (trie)
    loadAllDictionaries();

    // Initialize Socket.IO handlers
    initSocketHandlers(io);
    console.log("Socket.IO initialized");

    // Start the server
    httpServer.listen(config.port, () => {
      console.log(`Spelling Bee server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
