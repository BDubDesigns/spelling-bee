import mongoose, { Schema, type Document } from "mongoose";

/**
 * User Mongoose model.
 *
 * Linked to Clerk via clerkUserId. Stores game-specific data
 * (membership tier, stats) while Clerk owns authentication.
 */

export interface IUser extends Document {
  clerkUserId: string;
  displayName: string;
  email: string;
  membershipTier: "free" | "paid";
  puzzlesCompleted: number;
  totalWordsFound: number;
  bestRank: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true, minlength: 1, maxlength: 50 },
    email: { type: String, required: true },
    membershipTier: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    puzzlesCompleted: { type: Number, default: 0, min: 0 },
    totalWordsFound: { type: Number, default: 0, min: 0 },
    bestRank: { type: String, default: null },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
