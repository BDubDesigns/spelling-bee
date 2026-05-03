import mongoose, { Schema, type Document } from "mongoose";

/**
 * Score Mongoose model.
 *
 * Stores a user's completed score for a puzzle. One score per user per puzzle.
 */

export interface IScore extends Document {
  userId: string;
  puzzleId: string;
  words: Array<{ word: string; points: number; isPangram: boolean }>;
  totalScore: number;
  wordsFound: number;
  totalWords: number;
  rank: string;
  percentOfMax: number;
  isComplete: boolean;
  submittedAt: Date;
}

const wordScoreSchema = new Schema(
  {
    word: { type: String, required: true },
    points: { type: Number, required: true, min: 1 },
    isPangram: { type: Boolean, required: true },
  },
  { _id: false },
);

const scoreSchema = new Schema<IScore>(
  {
    userId: { type: String, required: true },
    puzzleId: { type: String, required: true },
    words: { type: [wordScoreSchema], default: [] },
    totalScore: { type: Number, required: true, min: 0 },
    wordsFound: { type: Number, required: true, min: 0 },
    totalWords: { type: Number, required: true, min: 1 },
    rank: { type: String, required: true },
    percentOfMax: { type: Number, required: true, min: 0, max: 100 },
    isComplete: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: false } },
);

scoreSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });
scoreSchema.index({ puzzleId: 1, totalScore: -1 });

export const ScoreModel = mongoose.model<IScore>("Score", scoreSchema);
