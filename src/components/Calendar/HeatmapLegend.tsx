"use client";

import { CROWD_COLORS, CROWD_LABELS } from "@/lib/constants";

const LEVELS: Array<"low" | "moderate" | "high"> = [
  "low",
  "moderate",
  "high",
];

export default function HeatmapLegend() {
  return (
    <div className="flex flex-col gap-3">
      {/* Gradient bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Less Busy
        </span>
        <div
          className="h-3 flex-1 rounded-sm"
          style={{
            background:
              "linear-gradient(to right, #d1fae5, #22c55e, #eab308, #f97316, #dc2626)",
          }}
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          More Busy
        </span>
      </div>

      {/* Crowd level dots */}
      <div className="flex items-center gap-4">
        {LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CROWD_COLORS[level] }}
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {CROWD_LABELS[level]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
