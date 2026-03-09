"use client";

import { format, parseISO, getMonth } from "date-fns";
import { scoreToCrowdLevel } from "@/lib/utils/scoring";
import { CROWD_COLORS, CROWD_LABELS, MONTHLY_CLIMATE } from "@/lib/constants";
import { Thermometer } from "lucide-react";

interface HeatmapTooltipProps {
  date: string;
  score: number;
  position: { x: number; y: number };
}

export default function HeatmapTooltip({
  date,
  score,
  position,
}: HeatmapTooltipProps) {
  const crowdLevel = scoreToCrowdLevel(score);
  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy");
  const dotColor = CROWD_COLORS[crowdLevel] ?? CROWD_COLORS.unknown;
  const label = CROWD_LABELS[crowdLevel] ?? CROWD_LABELS.unknown;

  // Monthly climate for this date
  const month = getMonth(parseISO(date)) + 1; // 1-indexed
  const climate = MONTHLY_CLIMATE[month];

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg bg-white px-3 py-2 shadow-lg dark:bg-slate-800"
      style={{
        left: position.x + 12,
        top: position.y - 8,
      }}
    >
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {formattedDate}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Score: {score.toFixed(1)} / 10
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {label}
        </span>
      </div>
      {climate && (
        <div className="mt-1.5 flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-700 pt-1.5">
          <Thermometer className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Typical: {climate.highF}°/{climate.lowF}°F, {climate.conditions[0]}
          </span>
        </div>
      )}
    </div>
  );
}
