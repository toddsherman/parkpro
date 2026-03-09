/**
 * Convert a busyness score (0-10) to a hex colour on a
 * green → yellow → red gradient.
 *
 * Stops:
 *  0 → #d1fae5  (light green / empty)
 *  3 → #22c55e  (green)
 *  5 → #eab308  (yellow)
 *  7 → #f97316  (orange)
 * 10 → #dc2626  (red)
 */
export function scoreToColor(score: number): string {
  const s = Math.max(0, Math.min(10, score));

  // Define colour stops as [score, r, g, b]
  const stops: [number, number, number, number][] = [
    [0, 0xd1, 0xfa, 0xe5],
    [3, 0x22, 0xc5, 0x5e],
    [5, 0xea, 0xb3, 0x08],
    [7, 0xf9, 0x73, 0x16],
    [10, 0xdc, 0x26, 0x26],
  ];

  // Find the two stops surrounding our score
  let low = stops[0];
  let high = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (s >= stops[i][0] && s <= stops[i + 1][0]) {
      low = stops[i];
      high = stops[i + 1];
      break;
    }
  }

  const range = high[0] - low[0];
  const t = range === 0 ? 0 : (s - low[0]) / range;

  const r = Math.round(low[1] + t * (high[1] - low[1]));
  const g = Math.round(low[2] + t * (high[2] - low[2]));
  const b = Math.round(low[3] + t * (high[3] - low[3]));

  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function hex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

/** Background colour for cells with no data */
export const EMPTY_COLOR = "#ebedf0";
