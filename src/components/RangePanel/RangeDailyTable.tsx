"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { CalendarDays, Sunrise, Sunset } from "lucide-react";
import {
  DateRange,
  YearScoreData,
  DailyForecast,
  CampsiteAvailability,
} from "@/lib/types";
import { getDatesBetween } from "@/lib/utils/dates";
import { scoreToCrowdLevel } from "@/lib/utils/scoring";
import { computeDaylight } from "@/lib/utils/daylight";
import { CROWD_COLORS, CROWD_LABELS } from "@/lib/constants";

interface RangeDailyTableProps {
  range: DateRange;
  yearScores: YearScoreData;
  weather: DailyForecast[];
  campsites: CampsiteAvailability[];
}

interface DayRow {
  dateStr: string;
  dayName: string;
  dateLabel: string;
  score: number | null;
  level: string;
  weatherInfo: string | null;
  sunrise: string;
  sunset: string;
  dayLength: number;
}

export default function RangeDailyTable({
  range,
  yearScores,
  weather,
}: RangeDailyTableProps) {
  const rows = useMemo(() => {
    const dates = getDatesBetween(range.startDate, range.endDate);
    const weatherMap = new Map<string, DailyForecast>();
    for (const w of weather) {
      weatherMap.set(w.date, w);
    }

    return dates.map((d): DayRow => {
      const [y, m, day] = d.split("-").map(Number);
      const dateObj = new Date(y, m - 1, day);
      const score = yearScores.dailyAverages[d] ?? null;
      const level = score != null ? scoreToCrowdLevel(score) : "unknown";
      const forecast = weatherMap.get(d);
      const weatherInfo = forecast
        ? `${forecast.condition} ${forecast.tempHighF}/${forecast.tempLowF}\u00B0F`
        : null;
      const daylight = computeDaylight(d);

      return {
        dateStr: d,
        dayName: format(dateObj, "EEE"),
        dateLabel: format(dateObj, "MMM d"),
        score,
        level,
        weatherInfo,
        sunrise: daylight.sunrise,
        sunset: daylight.sunset,
        dayLength: daylight.dayLengthHours,
      };
    });
  }, [range, yearScores, weather]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Day-by-Day Breakdown
        </h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-panel-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80">
              <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Day
              </th>
              <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Date
              </th>
              <th className="text-center px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Busyness
              </th>
              <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Level
              </th>
              <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Weather
              </th>
              <th className="text-left px-3 py-2 font-medium text-slate-600 dark:text-slate-400">
                Daylight
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.dateStr}
                className={
                  i % 2 === 0
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-50 dark:bg-slate-800/40"
                }
              >
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                  {row.dayName}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                  {row.dateLabel}
                </td>
                <td className="px-3 py-2 text-center font-semibold text-slate-900 dark:text-white">
                  {row.score != null ? row.score.toFixed(1) : "--"}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: CROWD_COLORS[row.level],
                      }}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {CROWD_LABELS[row.level]}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  {row.weatherInfo ?? "\u2014"}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <span title={`Sunrise: ${row.sunrise} / Sunset: ${row.sunset}`}>
                    {row.dayLength}h
                  </span>
                  <span className="hidden lg:inline text-slate-400 dark:text-slate-500 ml-1">
                    ({row.sunrise}&ndash;{row.sunset})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-2">
        {rows.map((row, i) => (
          <div
            key={row.dateStr}
            className={`rounded-lg p-3 border border-panel-border ${
              i % 2 === 0
                ? "bg-white/60 dark:bg-slate-800/50"
                : "bg-slate-50/60 dark:bg-slate-800/30"
            }`}
          >
            {/* Top: Day + Date */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {row.dayName}, {row.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: CROWD_COLORS[row.level],
                  }}
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {CROWD_LABELS[row.level]}
                </span>
              </span>
            </div>

            {/* Bottom: Score + Weather + Daylight */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Busyness:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {row.score != null ? row.score.toFixed(1) : "--"}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {" "}
                  / 10
                </span>
              </span>
              <span>{row.weatherInfo ?? "\u2014"}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Sunrise className="w-3 h-3" />
              <span>{row.sunrise}</span>
              <span className="mx-0.5">&ndash;</span>
              <Sunset className="w-3 h-3" />
              <span>{row.sunset}</span>
              <span className="ml-1">({row.dayLength}h)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
