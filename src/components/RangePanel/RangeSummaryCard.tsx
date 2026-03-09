"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { BarChart3 } from "lucide-react";
import { DateRange, YearScoreData } from "@/lib/types";
import { getDatesBetween } from "@/lib/utils/dates";
import { scoreToCrowdLevel } from "@/lib/utils/scoring";
import { CROWD_COLORS, CROWD_LABELS } from "@/lib/constants";

interface RangeSummaryCardProps {
  range: DateRange;
  yearScores: YearScoreData;
}

export default function RangeSummaryCard({
  range,
  yearScores,
}: RangeSummaryCardProps) {
  const summary = useMemo(() => {
    const dates = getDatesBetween(range.startDate, range.endDate);

    let totalScore = 0;
    let validDays = 0;
    let bestDay: { date: string; score: number } | null = null;
    let busiestDay: { date: string; score: number } | null = null;
    const levelCounts = { low: 0, moderate: 0, high: 0 };

    for (const d of dates) {
      const score = yearScores.dailyAverages[d];
      if (score == null) continue;

      validDays++;
      totalScore += score;

      const level = scoreToCrowdLevel(score);
      if (level !== "unknown") {
        levelCounts[level]++;
      }

      if (!bestDay || score < bestDay.score) {
        bestDay = { date: d, score };
      }
      if (!busiestDay || score > busiestDay.score) {
        busiestDay = { date: d, score };
      }
    }

    const avgScore = validDays > 0 ? totalScore / validDays : 0;
    const avgLevel = scoreToCrowdLevel(avgScore);

    return { avgScore, avgLevel, bestDay, busiestDay, levelCounts, validDays };
  }, [range, yearScores]);

  const bgByLevel: Record<string, string> = {
    low: "bg-green-50 dark:bg-green-950/30",
    moderate: "bg-yellow-50 dark:bg-yellow-950/30",
    high: "bg-red-50 dark:bg-red-950/30",
    unknown: "bg-slate-50 dark:bg-slate-800/30",
  };

  const totalCounted =
    summary.levelCounts.low +
    summary.levelCounts.moderate +
    summary.levelCounts.high;

  function formatDay(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    return format(new Date(y, m - 1, d), "EEE, MMM d");
  }

  return (
    <div
      className={`rounded-xl border border-panel-border p-4 ${bgByLevel[summary.avgLevel]}`}
    >
      {/* Average Busyness */}
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Average Busyness
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {summary.avgScore.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / 10
            </span>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full ml-1"
              style={{ backgroundColor: CROWD_COLORS[summary.avgLevel] }}
            />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {CROWD_LABELS[summary.avgLevel]}
            </span>
          </div>
        </div>
      </div>

      {/* Best / Busiest Day */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {summary.bestDay && (
          <div className="rounded-lg bg-white/60 dark:bg-slate-800/60 p-3">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
              Best Day
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDay(summary.bestDay.date)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Score: {summary.bestDay.score.toFixed(1)}
            </p>
          </div>
        )}
        {summary.busiestDay && (
          <div className="rounded-lg bg-white/60 dark:bg-slate-800/60 p-3">
            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
              Busiest Day
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDay(summary.busiestDay.date)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Score: {summary.busiestDay.score.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {/* Crowd Distribution Bar */}
      {totalCounted > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
            Crowd Distribution
          </p>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {summary.levelCounts.low > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{
                  width: `${(summary.levelCounts.low / totalCounted) * 100}%`,
                }}
                title={`Low: ${summary.levelCounts.low} day${summary.levelCounts.low !== 1 ? "s" : ""}`}
              />
            )}
            {summary.levelCounts.moderate > 0 && (
              <div
                className="bg-yellow-500 transition-all"
                style={{
                  width: `${(summary.levelCounts.moderate / totalCounted) * 100}%`,
                }}
                title={`Moderate: ${summary.levelCounts.moderate} day${summary.levelCounts.moderate !== 1 ? "s" : ""}`}
              />
            )}
            {summary.levelCounts.high > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{
                  width: `${(summary.levelCounts.high / totalCounted) * 100}%`,
                }}
                title={`High: ${summary.levelCounts.high} day${summary.levelCounts.high !== 1 ? "s" : ""}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Low: {summary.levelCounts.low}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Mod: {summary.levelCounts.moderate}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              High: {summary.levelCounts.high}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
