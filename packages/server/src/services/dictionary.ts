import { readFileSync } from "fs";
import { join } from "path";
import { Trie } from "@/utils/trie";

/**
 * Dictionary difficulty levels corresponding to SCOWL sizes.
 *
 * - easy (50): Common words everyone knows
 * - medium (60): Standard dictionary (default)
 * - hard (70): Includes less common words
 */
export type DictionaryDifficulty = "easy" | "medium" | "hard";

/** Map of difficulty to SCOWL size */
const DIFFICULTY_SIZE_MAP: Record<DictionaryDifficulty, number> = {
  easy: 50,
  medium: 60,
  hard: 70,
} as const;

/** Loaded dictionary tries indexed by difficulty */
const dictionaries: Map<DictionaryDifficulty, Trie> = new Map();

/**
 * Loads a dictionary from a JSON file into a Trie.
 *
 * @param difficulty - The difficulty level to load
 * @returns The loaded Trie
 */
const loadDictionary = (difficulty: DictionaryDifficulty): Trie => {
  const size = DIFFICULTY_SIZE_MAP[difficulty];
  const filePath = join(__dirname, "..", "data", `dictionary-${size}.json`);

  console.log(`Loading dictionary: ${difficulty} (size ${size})...`);
  const words: string[] = JSON.parse(readFileSync(filePath, "utf-8"));
  const trie = new Trie(words);

  console.log(`  Loaded ${trie.size.toLocaleString()} words`);
  return trie;
};

/**
 * Gets or loads a dictionary for the given difficulty.
 * Dictionaries are cached after first load.
 *
 * @param difficulty - The difficulty level
 * @returns The Trie for that difficulty
 */
export const getDictionary = (difficulty: DictionaryDifficulty = "medium"): Trie => {
  let trie = dictionaries.get(difficulty);

  if (!trie) {
    trie = loadDictionary(difficulty);
    dictionaries.set(difficulty, trie);
  }

  return trie;
};

/**
 * Loads all dictionaries into memory.
 * Call this at server startup to avoid lazy-load latency on first request.
 */
export const loadAllDictionaries = (): void => {
  const difficulties: DictionaryDifficulty[] = ["easy", "medium", "hard"];

  for (const difficulty of difficulties) {
    getDictionary(difficulty);
  }

  console.log("All dictionaries loaded");
};

/**
 * Checks if a word exists in the dictionary.
 *
 * @param word - The word to look up (should be lowercase)
 * @param difficulty - The dictionary to search
 * @returns Whether the word exists
 */
export const isWordInDictionary = (
  word: string,
  difficulty: DictionaryDifficulty = "medium",
): boolean => {
  const trie = getDictionary(difficulty);
  return trie.search(word);
};

/**
 * Finds all words matching a prefix.
 *
 * @param prefix - The prefix to search for
 * @param difficulty - The dictionary to search
 * @returns Array of matching words
 */
export const findWordsByPrefix = (
  prefix: string,
  difficulty: DictionaryDifficulty = "medium",
): string[] => {
  const trie = getDictionary(difficulty);
  return trie.findByPrefix(prefix);
};
