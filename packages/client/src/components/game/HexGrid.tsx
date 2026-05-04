import { clsx } from "clsx";

/**
 * HexGrid — the 7-hexagon honeycomb for the Spelling Bee.
 *
 * Layout: 2-3-2 pattern (like NYT Spelling Bee)
 *   [1] [2]
 *  [3] [4] [5]
 *   [6] [7]
 *
 * Hex 4 (center of middle row) is the center letter.
 * Edges line up between rows for a seamless honeycomb.
 */

interface HexGridProps {
  /** The 7 letters to display */
  letters: string[];
  /** The center letter (must be used in every word) */
  centerLetter: string;
  /** Callback when a letter is clicked */
  onLetterClick: (letter: string) => void;
}

/** Hexagon size (radius from center to vertex) */
const HEX_SIZE = 44;

/**
 * Generates SVG path for a flat-top hexagon.
 */
const hexPath = (cx: number, cy: number, size: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${points.join(" L ")} Z`;
};

/**
 * 2-3-2 honeycomb positions.
 *
 * For flat-top hexagons:
 * - Width = 2 * size
 * - Height = sqrt(3) * size
 * - Horizontal center-to-center = 1.5 * size (they overlap by 0.5 * size)
 * - Vertical row spacing = 0.75 * sqrt(3) * size (edges touch)
 *
 * Positions calculated with center of the whole grid at (150, 130).
 */
const getHexPositions = (): Array<{ x: number; y: number }> => {
  const w = 1.5 * HEX_SIZE; // horizontal center-to-center
  const h = Math.sqrt(3) * HEX_SIZE * 0.75; // vertical row spacing

  const cx = 150;
  const cy = 120;

  return [
    // Top row (2 hexes) — offset right by w/2
    { x: cx - w / 2, y: cy - h },
    { x: cx + w / 2, y: cy - h },
    // Middle row (3 hexes) — centered
    { x: cx - w, y: cy },
    { x: cx, y: cy },           // CENTER LETTER
    { x: cx + w, y: cy },
    // Bottom row (2 hexes) — offset right by w/2
    { x: cx - w / 2, y: cy + h },
    { x: cx + w / 2, y: cy + h },
  ];
};

const HEX_POSITIONS = getHexPositions();

/** Indices: center letter is at index 3 (middle of middle row) */
const CENTER_INDEX = 3;

export const HexGrid = ({ letters, centerLetter, onLetterClick }: HexGridProps): React.JSX.Element => {
  /**
   * Reorder letters: place center letter at index 3,
   * fill remaining positions with the other 6 letters.
   */
  const otherLetters = letters.filter((l) => l !== centerLetter);
  const orderedLetters: string[] = [];
  for (let i = 0; i < 7; i++) {
    if (i === CENTER_INDEX) {
      orderedLetters.push(centerLetter);
    } else {
      orderedLetters.push(otherLetters.shift() ?? "");
    }
  }

  /** Calculate viewBox to fit all hexagons with padding */
  const padding = HEX_SIZE + 10;
  const xs = HEX_POSITIONS.map((p) => p.x);
  const ys = HEX_POSITIONS.map((p) => p.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const viewBox = `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}`;

  return (
    <svg viewBox={viewBox} className="w-full max-w-xs mx-auto select-none">
      {orderedLetters.map((letter, index) => {
        const pos = HEX_POSITIONS[index];
        if (!pos) return null;

        const isCenter = index === CENTER_INDEX;

        return (
          <g
            key={index}
            className="hex-cell"
            onClick={() => onLetterClick(letter)}
            role="button"
            tabIndex={0}
            aria-label={`Letter ${letter.toUpperCase()}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onLetterClick(letter);
              }
            }}
          >
            <path
              d={hexPath(pos.x, pos.y, HEX_SIZE)}
              className={clsx(
                "transition-colors",
                isCenter
                  ? "fill-bee-yellow stroke-bee-yellow-dark"
                  : "fill-white stroke-slate-300",
              )}
              strokeWidth={2}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={clsx(
                "text-2xl font-bold uppercase pointer-events-none",
                isCenter ? "fill-bee-brown" : "fill-slate-700",
              )}
            >
              {letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
