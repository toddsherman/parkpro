"use client";

import React, { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { DateRange, YearScoreData } from "@/lib/types";
import { getDatesBetween } from "@/lib/utils/dates";
import { scoreToCrowdLevel } from "@/lib/utils/scoring";
import { PARK_ZONES, CROWD_COLORS, SEASONAL_ROAD_CLOSURES } from "@/lib/constants";

interface ZoneRankingsProps {
  range: DateRange;
  yearScores: YearScoreData;
}

interface RankedZone {
  id: string;
  name: string;
  avgScore: number;
  level: string;
  roadClosed: boolean;
}

export default function ZoneRankings({
  range,
  yearScores,
}: ZoneRankingsProps) {
  const ranked = useMemo(() => {
    const dates = getDatesBetween(range.startDate, range.endDate);

    // Determine which zones have road closures during any date in range
    const closedZoneIds = new Set<string>();
    for (const d of dates) {
      const [, m, day] = d.split("-").map(Number);
      for (const road of SEASONAL_ROAD_CLOSURES) {
        const afterClose =
          m > road.typicalClose.month ||
          (m === road.typicalClose.month && day > road.typicalClose.day);
        const beforeOpen =
          m < road.typicalOpen.month ||
          (m === road.typicalOpen.month && day < road.typicalOpen.day);
        if (afterClose || beforeOpen) {
          for (const z of road.affectedZones) closedZoneIds.add(z);
        }
      }
    }

    const zoneScores: RankedZone[] = PARK_ZONES.map((zone) => {
      let total = 0;
      let count = 0;

      for (const d of dates) {
        const zoneMap = yearScores.dailyByZone[d];
        if (!zoneMap) continue;
        const score = zoneMap[zone.id];
        if (score == null) continue;
        total += score;
        count++;
      }

      const avgScore = count > 0 ? total / count : 0;
      return {
        id: zone.id,
        name: zone.name,
        avgScore,
        level: scoreToCrowdLevel(avgScore),
        roadClosed: closedZoneIds.has(zone.id),
      };
    });

    // Sort from quietest to busiest
    zoneScores.sort((a, b) => a.avgScore - b.avgScore);

    return zoneScores;
  }, [range, yearScores]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Zone Rankings
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
          quietest &rarr; busiest
        </span>
      </div>

      {/* Rankings list */}
      <div className="space-y-1.5">
        {ranked.map((zone, index) => (
          <div
            key={zone.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/50 border border-transparent hover:border-panel-border transition-colors"
          >
            {/* Rank number */}
            <span className="w-5 text-xs font-bold text-slate-400 dark:text-slate-500 text-right shrink-0">
              {index + 1}
            </span>

            {/* Zone name */}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 min-w-0 truncate w-36 shrink-0">
              {zone.name}
              {zone.roadClosed && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 align-middle" title="Access road typically closed during selected dates">
                  Road closed
                </span>
              )}
            </span>

            {/* Score bar */}
            <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(2, (zone.avgScore / 10) * 100)}%`,
                  backgroundColor: CROWD_COLORS[zone.level],
                }}
              />
            </div>

            {/* Score value */}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-7 text-right shrink-0">
              {zone.avgScore.toFixed(1)}
            </span>

            {/* Crowd level dot */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CROWD_COLORS[zone.level] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
