import { clsx } from "clsx";

/**
 * HexGrid — the 7-hexagon honeycomb for the Spelling Bee.
 *
 * Displays the 7 puzzle letters in a honeycomb pattern with the
 * center letter highlighted. Clicking a letter adds it to the word.
 *
 * Uses flat-top hexagons with proper honeycomb geometry:
 * - Center-to-center distance = sqrt(3) * size
 * - Surrounding hexes at 60-degree intervals
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

/** Center of the honeycomb in SVG coordinates */
const CENTER_X = 150;
const CENTER_Y = 130;

/**
 * Generates SVG path for a flat-top hexagon.
 * Flat-top means the top edge is horizontal.
 */
const hexPath = (cx: number, cy: number, size: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    // Flat-top: start at -30 degrees (top-right vertex)
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${points.join(" L ")} Z`;
};

/**
 * Calculates positions for 7 hexagons in a honeycomb pattern.
 * The 6 surrounding hexes are placed at 60-degree intervals
 * at a distance of sqrt(3) * size from center.
 */
const getHexPositions = (): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [{ x: CENTER_X, y: CENTER_Y }];

  // Distance from center to surrounding hex centers
  const dist = Math.sqrt(3) * HEX_SIZE;

  // 6 surrounding hexes at 60-degree intervals
  // Starting from top (270°) and going clockwise
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Start at top
    positions.push({
      x: CENTER_X + dist * Math.cos(angle),
      y: CENTER_Y + dist * Math.sin(angle),
    });
  }

  return positions;
};

const HEX_POSITIONS = getHexPositions();

export const HexGrid = ({ letters, centerLetter, onLetterClick }: HexGridProps): React.JSX.Element => {
  /** Reorder letters so center is first */
  const orderedLetters = [
    centerLetter,
    ...letters.filter((l) => l !== centerLetter),
  ];

  /** Calculate viewBox to fit all hexagons with padding */
  const padding = HEX_SIZE + 10;
  const minX = CENTER_X - Math.sqrt(3) * HEX_SIZE - padding;
  const maxX = CENTER_X + Math.sqrt(3) * HEX_SIZE + padding;
  const minY = CENTER_Y - Math.sqrt(3) * HEX_SIZE - padding;
  const maxY = CENTER_Y + Math.sqrt(3) * HEX_SIZE + padding;
  const viewBox = `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}`;

  return (
    <svg viewBox={viewBox} className="w-full max-w-xs mx-auto select-none">
      {orderedLetters.map((letter, index) => {
        const pos = HEX_POSITIONS[index];
        if (!pos) return null;

        const isCenter = index === 0;

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
