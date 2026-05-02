import { z } from "zod";

/**
 * Word-related schemas.
 *
 * These define the shape of words, submissions, and validation results
 * used throughout the Spelling Bee application.
 */

/** The set of letters available in a puzzle */
export const puzzleLettersSchema = z.object({
  /** The seven unique letters for this puzzle */
  letters: z.array(z.string().length(1)).length(7),
  /** The center letter that must be used in every word */
  centerLetter: z.string().length(1),
});

/** A single word submission from a player */
export const wordSubmissionSchema = z.object({
  /** The word the player is submitting */
  word: z.string().min(4).transform((s) => s.toLowerCase()),
  /** The puzzle ID this submission is for */
  puzzleId: z.string(),
});

/** The possible outcomes of a word validation */
export const validationErrorCodeSchema = z.enum([
  "TOO_SHORT",
  "MISSING_CENTER_LETTER",
  "INVALID_LETTERS",
  "NOT_IN_DICTIONARY",
  "ALREADY_FOUND",
]);

/** Result of validating a submitted word */
export const wordValidationResultSchema = z.discriminatedUnion("valid", [
  z.object({
    valid: z.literal(true),
    /** The validated word (lowercased) */
    word: z.string(),
    /** Points earned for this word */
    points: z.number().int().positive(),
    /** Whether this word is a pangram (uses all 7 letters) */
    isPangram: z.boolean(),
  }),
  z.object({
    valid: z.literal(false),
    /** Why the word was rejected */
    error: validationErrorCodeSchema,
    /** Human-readable error message */
    message: z.string(),
  }),
]);

export type PuzzleLetters = z.infer<typeof puzzleLettersSchema>;
export type WordSubmission = z.infer<typeof wordSubmissionSchema>;
export type ValidationErrorCode = z.infer<typeof validationErrorCodeSchema>;
export type WordValidationResult = z.infer<typeof wordValidationResultSchema>;
