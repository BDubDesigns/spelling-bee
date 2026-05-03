import { clsx } from "clsx";

/**
 * HexGrid — the 7-hexagon honeycomb for the Spelling Bee.
 *
 * Displays the 7 puzzle letters in a honeycomb pattern with the
 * center letter highlighted. Clicking a letter adds it to the word.
 */

interface HexGridProps {
  /** The 7 letters to display */
  letters: string[];
  /** The center letter (must be used in every word) */
  centerLetter: string;
  /** Callback when a letter is clicked */
  onLetterClick: (letter: string) => void;
}

/**
 * SVG hexagon path for a flat-top hexagon.
 *
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param size - Radius of the hexagon
 */
const hexPath = (cx: number, cy: number, size: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M ${points.join(" L ")} Z`;
};

/** Hexagon cell positions for honeycomb layout (center + 6 surrounding) */
const HEX_POSITIONS = [
  { x: 150, y: 130 }, // center
  { x: 150, y: 30 }, // top
  { x: 237, y: 80 }, // top-right
  { x: 237, y: 180 }, // bottom-right
  { x: 150, y: 230 }, // bottom
  { x: 63, y: 180 }, // bottom-left
  { x: 63, y: 80 }, // top-left
];

const HEX_SIZE = 42;

export const HexGrid = ({ letters, centerLetter, onLetterClick }: HexGridProps): React.JSX.Element => {
  /** Reorder letters so center is first */
  const orderedLetters = [
    centerLetter,
    ...letters.filter((l) => l !== centerLetter),
  ];

  return (
    <svg viewBox="0 0 300 260" className="w-full max-w-xs mx-auto select-none">
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
