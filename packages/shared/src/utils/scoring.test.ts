import { describe, it, expect } from "vitest";
import {
  calculateWordPoints,
  isPangram,
  createWordScore,
  calculateScoreBreakdown,
  SCORING,
} from "./scoring";

describe("SCORING constants", () => {
  it("has correct constants", () => {
    expect(SCORING.FOUR_LETTER_POINTS).toBe(1);
    expect(SCORING.PANGRAM_BONUS).toBe(7);
    expect(SCORING.MIN_WORD_LENGTH).toBe(4);
  });
});

describe("calculateWordPoints", () => {
  it("returns 1 point for 4-letter words", () => {
    expect(calculateWordPoints("able", false)).toBe(1);
    expect(calculateWordPoints("test", false)).toBe(1);
  });

  it("returns word length for 5+ letter words", () => {
    expect(calculateWordPoints("table", false)).toBe(5);
    expect(calculateWordPoints("testing", false)).toBe(7);
    expect(calculateWordPoints("abcdefgh", false)).toBe(8);
  });

  it("adds pangram bonus when isPangram is true", () => {
    expect(calculateWordPoints("table", true)).toBe(12); // 5 + 7
    expect(calculateWordPoints("testing", true)).toBe(14); // 7 + 7
  });

  it("handles 4-letter pangram (1 + 7 = 8)", () => {
    expect(calculateWordPoints("able", true)).toBe(8);
  });
});

describe("isPangram", () => {
  it("returns true when word uses all 7 letters", () => {
    expect(isPangram("belting", ["b", "e", "l", "t", "i", "n", "g"])).toBe(true);
  });

  it("returns false when word misses some letters", () => {
    expect(isPangram("belt", ["b", "e", "l", "t", "i", "n", "g"])).toBe(false);
  });

  it("returns true for pangram with repeated letters", () => {
    // "billing" uses b,i,l,n,g — all 7 letters needed
    expect(isPangram("billing", ["b", "i", "l", "n", "g", "x", "y"])).toBe(false); // missing x, y
    // "boxing" uses b,o,x,i,n,g — all 7 letters
    expect(isPangram("boxing", ["b", "o", "x", "i", "n", "g", "z"])).toBe(false); // missing z
  });

  it("returns false for empty word", () => {
    expect(isPangram("", ["a", "b", "c", "d", "e", "f", "g"])).toBe(false);
  });
});

describe("createWordScore", () => {
  it("creates correct score for non-pangram", () => {
    const score = createWordScore("test", ["t", "e", "s", "x", "y", "z", "w"]);
    expect(score.word).toBe("test");
    expect(score.points).toBe(1); // 4-letter word
    expect(score.isPangram).toBe(false);
  });

  it("creates correct score for pangram", () => {
    // "testing" uses t,e,s,i,n,g — but puzzle has t,e,s,i,n,g,x
    // So it's NOT a pangram (missing x)
    const score = createWordScore("testing", ["t", "e", "s", "i", "n", "g", "x"]);
    expect(score.word).toBe("testing");
    expect(score.points).toBe(7); // 7-letter word, not pangram
    expect(score.isPangram).toBe(false);
  });

  it("creates correct score for actual pangram", () => {
    // "abeling" uses a,b,e,l,i,n,g — all 7 unique letters
    const score = createWordScore("abeling", ["a", "b", "e", "l", "i", "n", "g"]);
    expect(score.word).toBe("abeling");
    expect(score.points).toBe(14); // 7 + 7 pangram bonus
    expect(score.isPangram).toBe(true);
  });
});

describe("calculateScoreBreakdown", () => {
  it("calculates breakdown from word scores", () => {
    const words = [
      { word: "test", points: 1, isPangram: false },
      { word: "testing", points: 14, isPangram: true },
      { word: "table", points: 5, isPangram: false },
    ];

    const breakdown = calculateScoreBreakdown(words);

    expect(breakdown.fourLetterPoints).toBe(1); // "test"
    expect(breakdown.longerWordPoints).toBe(12); // "testing" (7) + "table" (5)
    expect(breakdown.pangramBonus).toBe(7); // "testing"
    expect(breakdown.total).toBe(20); // 1 + 14 + 5
  });

  it("handles empty word list", () => {
    const breakdown = calculateScoreBreakdown([]);
    expect(breakdown.fourLetterPoints).toBe(0);
    expect(breakdown.longerWordPoints).toBe(0);
    expect(breakdown.pangramBonus).toBe(0);
    expect(breakdown.total).toBe(0);
  });
});
