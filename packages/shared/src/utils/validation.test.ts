import { describe, it, expect } from "vitest";
import {
  usesOnlyAllowedLetters,
  usesCenterLetter,
  validateWordStructure,
  calculateRank,
} from "./validation";

describe("usesOnlyAllowedLetters", () => {
  it("returns true when word uses only allowed letters", () => {
    expect(usesOnlyAllowedLetters("test", ["t", "e", "s", "x", "y", "z", "w"])).toBe(true);
  });

  it("returns false when word uses disallowed letters", () => {
    expect(usesOnlyAllowedLetters("test", ["a", "b", "c", "d", "e", "f", "g"])).toBe(false);
  });

  it("allows repeated letters", () => {
    expect(usesOnlyAllowedLetters("ttt", ["t", "a", "b", "c", "d", "e", "f"])).toBe(true);
  });
});

describe("usesCenterLetter", () => {
  it("returns true when word contains center letter", () => {
    expect(usesCenterLetter("test", "t")).toBe(true);
    expect(usesCenterLetter("test", "e")).toBe(true);
  });

  it("returns false when word does not contain center letter", () => {
    expect(usesCenterLetter("test", "x")).toBe(false);
  });
});

describe("validateWordStructure", () => {
  const letters = ["t", "e", "s", "x", "y", "z", "w"];
  const centerLetter = "t";

  it("rejects words shorter than 4 letters", () => {
    const result = validateWordStructure("tes", letters, centerLetter);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("TOO_SHORT");
    }
  });

  it("accepts 4-letter words", () => {
    const result = validateWordStructure("test", letters, centerLetter);
    expect(result.valid).toBe(true);
  });

  it("rejects words missing center letter", () => {
    const result = validateWordStructure("sexy", letters, centerLetter);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("MISSING_CENTER_LETTER");
    }
  });

  it("rejects words with disallowed letters", () => {
    const result = validateWordStructure("tabs", letters, centerLetter);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe("INVALID_LETTERS");
    }
  });

  it("accepts valid words", () => {
    const result = validateWordStructure("text", letters, centerLetter);
    expect(result.valid).toBe(true);
  });

  it("normalizes to lowercase", () => {
    const result = validateWordStructure("TEST", letters, centerLetter);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.word).toBe("test");
    }
  });
});

describe("calculateRank", () => {
  it("returns BEGINNER at 0%", () => {
    const { rank, percent } = calculateRank(0, 100);
    expect(rank).toBe("BEGINNER");
    expect(percent).toBe(0);
  });

  it("returns GOOD_START at 2%", () => {
    const { rank, percent } = calculateRank(2, 100);
    expect(rank).toBe("GOOD_START");
    expect(percent).toBe(2);
  });

  it("returns GENIUS at 70%+", () => {
    const { rank, percent } = calculateRank(70, 100);
    expect(rank).toBe("GENIUS");
    expect(percent).toBe(70);
  });

  it("returns GENIUS at 100%", () => {
    const { rank, percent } = calculateRank(100, 100);
    expect(rank).toBe("GENIUS");
    expect(percent).toBe(100);
  });

  it("handles zero max score", () => {
    const { rank, percent } = calculateRank(0, 0);
    expect(rank).toBe("BEGINNER");
    expect(percent).toBe(0);
  });

  it("rounds percentage", () => {
    const { percent } = calculateRank(33, 100);
    expect(percent).toBe(33);
  });
});
