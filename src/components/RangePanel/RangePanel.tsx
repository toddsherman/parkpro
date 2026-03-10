"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import {
  X,
  MapPin,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Flame,
  AlertTriangle,
  Wind,
} from "lucide-react";
import {
  DateRange,
  YearScoreData,
  DailyForecast,
  CampsiteAvailability,
} from "@/lib/types";
import { formatDateRange, getDayCount, getDatesBetween } from "@/lib/utils/dates";
import { scoreToCrowdLevel } from "@/lib/utils/scoring";
import {
  PARK_ZONES,
  CROWD_COLORS,
  FIREFALL_WINDOW,
  SEASONAL_ROAD_CLOSURES,
  SMOKE_RISK_MONTHS,
} from "@/lib/constants";
import RangeSummaryCard from "./RangeSummaryCard";
import ZoneRankings from "./ZoneRankings";
import RangeDailyTable from "./RangeDailyTable";

interface RangePanelProps {
  selectedRange: DateRange;
  yearScores: YearScoreData;
  weather: DailyForecast[];
  campsites: CampsiteAvailability[];
  onClose: () => void;
}

/**
 * Parse "YYYY-MM-DD" as a local-timezone Date.
 */
function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function RangePanel({
  selectedRange,
  yearScores,
  weather,
  campsites,
  onClose,
}: RangePanelProps) {
  const dayCount = getDayCount(selectedRange);
  const rangeLabel = formatDateRange(selectedRange);

  // Compute trip tips
  const tips = useMemo(() => {
    const dates = getDatesBetween(selectedRange.startDate, selectedRange.endDate);

    // --- Best / worst days ---
    const dayScores: { date: string; score: number }[] = [];
    for (const d of dates) {
      const score = yearScores.dailyAverages[d];
      if (score != null) {
        dayScores.push({ date: d, score });
      }
    }
    dayScores.sort((a, b) => a.score - b.score);

    const bestDays = dayScores.slice(0, 2);
    const worstDays = dayScores
      .slice(-2)
      .sort((a, b) => b.score - a.score);

    // --- Quietest / busiest zone ---
    const zoneAvgs: { id: string; name: string; avg: number }[] = PARK_ZONES.map(
      (zone) => {
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
        return { id: zone.id, name: zone.name, avg: count > 0 ? total / count : 0 };
      }
    );
    zoneAvgs.sort((a, b) => a.avg - b.avg);
    const quietestZone = zoneAvgs[0] ?? null;
    const busiestZone = zoneAvgs[zoneAvgs.length - 1] ?? null;

    return { bestDays, worstDays, quietestZone, busiestZone };
  }, [selectedRange, yearScores]);

  // Contextual alerts for the selected range
  const rangeAlerts = useMemo(() => {
    const dates = getDatesBetween(selectedRange.startDate, selectedRange.endDate);

    // Firefall overlap
    const hasFirefall = dates.some((d) => {
      const [, m, day] = d.split("-").map(Number);
      return m === FIREFALL_WINDOW.month && day >= FIREFALL_WINDOW.seasonStart && day <= FIREFALL_WINDOW.seasonEnd;
    });

    // Road closures
    const closedRoads = new Set<string>();
    for (const d of dates) {
      const [, m, day] = d.split("-").map(Number);
      for (const road of SEASONAL_ROAD_CLOSURES) {
        const afterClose =
          m > road.typicalClose.month ||
          (m === road.typicalClose.month && day > road.typicalClose.day);
        const beforeOpen =
          m < road.typicalOpen.month ||
          (m === road.typicalOpen.month && day < road.typicalOpen.day);
        if (afterClose || beforeOpen) closedRoads.add(road.name);
      }
    }

    // Smoke risk
    const hasSmokeRisk = dates.some((d) => {
      const m = parseInt(d.split("-")[1], 10);
      return (SMOKE_RISK_MONTHS as readonly number[]).includes(m);
    });

    return {
      hasFirefall,
      closedRoads: Array.from(closedRoads),
      hasSmokeRisk,
    };
  }, [selectedRange]);

  function formatDayShort(iso: string): string {
    return format(parseLocal(iso), "EEE, MMM d");
  }

  return (
    <section className="mt-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {rangeLabel}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {dayCount} day{dayCount !== 1 ? "s" : ""} selected
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
          aria-label="Clear selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Top row: Summary + Trip Tips side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1. Summary Card */}
        <RangeSummaryCard range={selectedRange} yearScores={yearScores} />

        {/* 2. Trip Tips */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Trip Tips
            </h3>
          </div>

          <div className="space-y-3">
            {/* Best days */}
            {tips.bestDays.length > 0 && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40">
                <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                    Best days to visit
                  </p>
                  {tips.bestDays.map((d) => (
                    <p
                      key={d.date}
                      className="text-sm text-green-700 dark:text-green-400"
                    >
                      {formatDayShort(d.date)}{" "}
                      <span className="text-xs text-green-600/70 dark:text-green-500">
                        (score: {d.score.toFixed(1)})
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Worst days */}
            {tips.worstDays.length > 0 && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
                    Consider avoiding
                  </p>
                  {tips.worstDays.map((d) => (
                    <p
                      key={d.date}
                      className="text-sm text-red-700 dark:text-red-400"
                    >
                      {formatDayShort(d.date)}{" "}
                      <span className="text-xs text-red-600/70 dark:text-red-500">
                        (score: {d.score.toFixed(1)})
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Zone tips row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Quietest zone */}
              {tips.quietestZone && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-0.5">
                      Quietest zone
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {tips.quietestZone.name}{" "}
                      <span className="text-xs text-green-600/70 dark:text-green-500">
                        ({tips.quietestZone.avg.toFixed(1)})
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Busiest zone */}
              {tips.busiestZone && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-0.5">
                      Busiest zone
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {tips.busiestZone.name}{" "}
                      <span className="text-xs text-red-600/70 dark:text-red-500">
                        ({tips.busiestZone.avg.toFixed(1)})
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contextual alerts */}
            {rangeAlerts.hasFirefall && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40">
                <Flame className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-0.5">
                    Firefall Season
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    Horsetail Fall &ldquo;Firefall&rdquo; may be visible Feb
                    10&ndash;28. Expect significantly higher crowds in Yosemite
                    Valley, especially around sunset.
                  </p>
                </div>
              </div>
            )}

            {rangeAlerts.closedRoads.length > 0 && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
                    Seasonal Road Closures
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Typically closed during your dates:{" "}
                    {rangeAlerts.closedRoads.join(", ")}.
                    Affected zones will have reduced accessibility.
                  </p>
                </div>
              </div>
            )}

            {rangeAlerts.hasSmokeRisk && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <Wind className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                    Wildfire Smoke Risk
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    July&ndash;October sees elevated smoke risk in the Sierra
                    Nevada. Check{" "}
                    <a
                      href="https://fire.airnow.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      AirNow Fire &amp; Smoke Map
                    </a>{" "}
                    before your visit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Zone Rankings + Daily Table side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Zone Rankings */}
        <ZoneRankings range={selectedRange} yearScores={yearScores} />

        {/* 4. Daily Table */}
        <RangeDailyTable
          range={selectedRange}
          yearScores={yearScores}
          weather={weather}
          campsites={campsites}
        />
      </div>
    </section>
  );
}
