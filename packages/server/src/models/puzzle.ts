import mongoose, { Schema, type Document } from "mongoose";

/**
 * Puzzle Mongoose model.
 *
 * Stores puzzle definitions. Daily puzzles are keyed by date string.
 * Practice puzzles are generated on-demand and stored for consistency.
 */

export interface IPuzzle extends Document {
  id: string;
  letters: string[];
  centerLetter: string;
  totalWords: number;
  maxScore: number;
  date: string;
  isDaily: boolean;
  difficulty: string;
  createdAt: Date;
}

const puzzleSchema = new Schema<IPuzzle>(
  {
    id: { type: String, required: true, unique: true },
    letters: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]): boolean => v.length === 7 && v.every((s) => s.length === 1),
        message: "Must have exactly 7 single characters",
      },
    },
    centerLetter: { type: String, required: true, minlength: 1, maxlength: 1 },
    totalWords: { type: Number, required: true, min: 1 },
    maxScore: { type: Number, required: true, min: 1 },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    isDaily: { type: Boolean, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true },
);

puzzleSchema.index({ date: 1, isDaily: 1 }, { unique: true });

export const PuzzleModel = mongoose.model<IPuzzle>("Puzzle", puzzleSchema);
