#!/usr/bin/env python3
"""
Generate Spelling Bee dictionary files from SCOWL.

Extracts word lists at sizes 50, 60, and 70 from the SCOWL database,
filters them for Spelling Bee rules, and outputs JSON files.

Spelling Bee rules:
- Words must be at least 4 letters long
- Only lowercase letters (no abbreviations, proper nouns, etc.)
- No apostrophes, hyphens, or special characters
- American English spellings only

Usage:
    python -X utf8 scripts/generate-dictionaries.py

Output:
    packages/server/src/data/dictionary-50.json (easy)
    packages/server/src/data/dictionary-60.json (medium)
    packages/server/src/data/dictionary-70.json (hard)
"""

import json
import subprocess
import sys
import re
from pathlib import Path

SCOWL_DIR = Path(__file__).parent.parent.parent / "scowl"
OUTPUT_DIR = Path(__file__).parent.parent / "packages" / "server" / "src" / "data"

SIZES = {
    50: "easy",
    60: "medium",
    70: "hard",
}

def extract_word_list(size: int) -> list[str]:
    """Extract a word list from SCOWL at the given size."""
    cmd = [
        sys.executable, "-X", "utf8",
        str(SCOWL_DIR / "scowl"),
        "word-list",
        str(size),
        "A",  # American English
        "1",  # Variant level 1
        "--deaccent",
        "--apostrophe", "False",
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(SCOWL_DIR),
    )

    if result.returncode != 0:
        print(f"Error extracting size {size}: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    words = []
    for line in result.stdout.splitlines():
        word = line.strip()
        # Filter: lowercase only, 4+ letters, alphabetic only
        if re.fullmatch(r"[a-z]{4,}", word):
            words.append(word)

    return sorted(set(words))


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for size, difficulty in SIZES.items():
        print(f"Extracting size {size} ({difficulty})...")
        words = extract_word_list(size)

        output_path = OUTPUT_DIR / f"dictionary-{size}.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(words, f, indent=2)

        print(f"  {len(words):,} words -> {output_path}")

    print("Done!")


if __name__ == "__main__":
    main()
