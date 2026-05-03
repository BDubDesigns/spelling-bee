import { Router } from "express";
import { generatePuzzle, getDailyDate, validateSubmission, submitScore, getUserScore } from "@/services";
import { PuzzleModel } from "@/models";
import { NotFoundError, ValidationError } from "@/errors";
import { createSuccessResponse, createErrorResponse } from "@spelling-bee/shared";
import type { DictionaryDifficulty } from "@/services";
import type { Puzzle } from "@spelling-bee/shared";

/**
 * Puzzle routes.
 *
 * GET /api/puzzle/today     — Get today's daily puzzle
 * GET /api/puzzle/:id       — Get a specific puzzle by ID
 * POST /api/puzzle/generate — Generate a practice puzzle
 * POST /api/puzzle/submit   — Submit a word for validation
 */

const router = Router();

/** Get today's daily puzzle */
router.get("/today", async (_req, res, next) => {
  try {
    const date = getDailyDate();

    let puzzle = await PuzzleModel.findOne({ date, isDaily: true });

    if (!puzzle) {
      // Generate and store the daily puzzle
      const generated = generatePuzzle(date, "medium");
      puzzle = await PuzzleModel.create(generated);
    }

    res.json(createSuccessResponse(puzzle.toJSON() as unknown as Puzzle));
  } catch (err) {
    next(err);
  }
});

/** Get a specific puzzle by ID */
router.get("/:id", async (req, res, next) => {
  try {
    const puzzle = await PuzzleModel.findOne({ id: req.params.id });

    if (!puzzle) {
      throw new NotFoundError("Puzzle", req.params.id);
    }

    res.json(createSuccessResponse(puzzle.toJSON() as unknown as Puzzle));
  } catch (err) {
    next(err);
  }
});

/** Generate a practice puzzle */
router.post("/generate", async (req, res, next) => {
  try {
    const difficulty = (req.body.difficulty as DictionaryDifficulty) ?? "medium";
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const generated = generatePuzzle(seed, difficulty);
    const puzzle = await PuzzleModel.create(generated);

    res.status(201).json(createSuccessResponse(puzzle.toJSON() as unknown as Puzzle));
  } catch (err) {
    next(err);
  }
});

/** Submit a word for validation */
router.post("/submit", async (req, res, next) => {
  try {
    const { word, puzzleId } = req.body;

    if (!word || !puzzleId) {
      throw new ValidationError("Missing required fields: word, puzzleId");
    }

    const puzzle = await PuzzleModel.findOne({ id: puzzleId });
    if (!puzzle) {
      throw new NotFoundError("Puzzle", puzzleId);
    }

    // Get existing score to check already-found words
    const existingScore = await getUserScore("anonymous", puzzleId);
    const foundWords = existingScore?.words.map((w) => w.word) ?? [];

    const result = validateSubmission(word, puzzle as unknown as Puzzle, foundWords, "medium");

    if (!result.valid) {
      // Return error response (success: false) so client can handle it properly
      res.status(400).json(createErrorResponse("VALIDATION_ERROR", result.message));
      return;
    }

    // Add word to score
    const updatedWords = [
      ...foundWords.map((w) => ({ word: w, points: 0, isPangram: false })), // Placeholder
      { word: result.word, points: result.points, isPangram: result.isPangram },
    ];

    // For now, use "anonymous" as userId until auth is wired up
    const score = await submitScore(
      "anonymous",
      puzzleId,
      updatedWords,
      puzzle.totalWords,
      puzzle.maxScore,
    );

    res.json(createSuccessResponse({ result, score }));
  } catch (err) {
    next(err);
  }
});

export const puzzleRouter = router;
