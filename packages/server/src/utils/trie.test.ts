import { describe, it, expect, beforeEach } from "vitest";
import { Trie } from "./trie";

describe("Trie", () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie(["apple", "app", "banana", "band", "bat"]);
  });

  describe("search", () => {
    it("finds existing words", () => {
      expect(trie.search("apple")).toBe(true);
      expect(trie.search("app")).toBe(true);
      expect(trie.search("banana")).toBe(true);
    });

    it("returns false for non-existent words", () => {
      expect(trie.search("ap")).toBe(false);
      expect(trie.search("bana")).toBe(false);
      expect(trie.search("xyz")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(trie.search("")).toBe(false);
    });
  });

  describe("startsWith", () => {
    it("returns true for existing prefixes", () => {
      expect(trie.startsWith("a")).toBe(true);
      expect(trie.startsWith("ap")).toBe(true);
      expect(trie.startsWith("ban")).toBe(true);
    });

    it("returns false for non-existent prefixes", () => {
      expect(trie.startsWith("x")).toBe(false);
      expect(trie.startsWith("abc")).toBe(false);
    });

    it("returns true for empty prefix", () => {
      expect(trie.startsWith("")).toBe(true);
    });
  });

  describe("findByPrefix", () => {
    it("finds all words with given prefix", () => {
      const result = trie.findByPrefix("app");
      expect(result).toContain("app");
      expect(result).toContain("apple");
      expect(result).toHaveLength(2);
    });

    it("returns empty array for non-existent prefix", () => {
      expect(trie.findByPrefix("xyz")).toEqual([]);
    });

    it("returns all words for empty prefix", () => {
      const result = trie.findByPrefix("");
      expect(result).toHaveLength(5);
    });
  });

  describe("insert", () => {
    it("adds new words", () => {
      trie.insert("new");
      expect(trie.search("new")).toBe(true);
    });

    it("does not duplicate existing words", () => {
      const sizeBefore = trie.size;
      trie.insert("apple");
      expect(trie.size).toBe(sizeBefore);
    });
  });

  describe("size", () => {
    it("returns correct word count", () => {
      expect(trie.size).toBe(5);
    });

    it("updates after insert", () => {
      trie.insert("new");
      expect(trie.size).toBe(6);
    });
  });

  describe("constructor", () => {
    it("creates empty trie when no words provided", () => {
      const empty = new Trie();
      expect(empty.size).toBe(0);
    });

    it("pre-populates with provided words", () => {
      const prePopulated = new Trie(["a", "b", "c"]);
      expect(prePopulated.size).toBe(3);
    });
  });

  describe("findByLetters", () => {
    it("finds words using only allowed letters", () => {
      // Trie has: apple, app, banana, band, bat
      // With letters {a, p, l, e} and minLength 3, should find: app, apple
      const result = trie.findByLetters(new Set(["a", "p", "l", "e"]), 3);
      expect(result).toContain("app");
      expect(result).toContain("apple");
      expect(result).not.toContain("banana"); // uses b, n
    });

    it("prunes branches with invalid letters", () => {
      // With letters {a, b, t} and minLength 3, should find: bat
      // Should NOT traverse into "ban" branch (needs n) or "app" branch (needs p)
      const result = trie.findByLetters(new Set(["a", "b", "t"]), 3);
      expect(result).toContain("bat");
      expect(result).not.toContain("band"); // needs n
      expect(result).not.toContain("app"); // needs p
    });

    it("respects minimum length", () => {
      // With letters {a, p, l, e} and minLength 5, should find: apple only
      const result = trie.findByLetters(new Set(["a", "p", "l", "e"]), 5);
      expect(result).toContain("apple");
      expect(result).not.toContain("app"); // too short
    });

    it("returns empty array when no words match", () => {
      const result = trie.findByLetters(new Set(["z", "x", "y"]));
      expect(result).toEqual([]);
    });

    it("finds all words when all letters allowed", () => {
      // Trie has: apple, app, banana, band, bat
      // "band" uses "d" which is not in the set, so only 4 words match
      const result = trie.findByLetters(
        new Set(["a", "p", "l", "e", "b", "n", "t"]),
        3,
      );
      expect(result).toHaveLength(4);
      expect(result).toContain("app");
      expect(result).toContain("apple");
      expect(result).toContain("banana");
      expect(result).toContain("bat");
    });
  });
});
