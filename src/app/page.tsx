"use client";

import React, { useEffect, useMemo } from "react";
import { useApp } from "@/lib/context";
import Header from "@/components/Header/Header";
import CalendarHeatmap from "@/components/Calendar/CalendarHeatmap";
import HeatmapLegend from "@/components/Calendar/HeatmapLegend";
import YearSelector from "@/components/Calendar/YearSelector";
import RangePanel from "@/components/RangePanel/RangePanel";
import { computeYearScores } from "@/lib/utils/yearScores";
import { fetchParkAlerts } from "@/lib/api/nps";
import { fetchWeekWeather } from "@/lib/api/weather";
import { YOSEMITE_CENTER } from "@/lib/constants";
import { DateRange } from "@/lib/types";
import { Mountain, TreePine } from "lucide-react";

export default function Home() {
  const {
    state,
    setRange,
    setYearScores,
    setRangeWeather,
    setYear,
    setAlerts,
    setError,
  } = useApp();

  const { selectedRange, yearScores, currentYear, rangeWeather, rangeCampsites } =
    state;

  // Compute year scores on mount and when year changes
  useEffect(() => {
    const scores = computeYearScores(currentYear);
    setYearScores(scores);
  }, [currentYear, setYearScores]);

  // Fetch alerts on mount
  useEffect(() => {
    let cancelled = false;
    async function loadAlerts() {
      try {
        const alerts = await fetchParkAlerts();
        if (!cancelled) setAlerts(alerts);
      } catch (err) {
        console.error("Failed to fetch park alerts:", err);
      }
    }
    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, [setAlerts]);

  // Fetch weather when range is selected (if range is within forecast window)
  useEffect(() => {
    if (!selectedRange) return;

    let cancelled = false;

    async function loadWeather() {
      try {
        const weather = await fetchWeekWeather(
          YOSEMITE_CENTER.latitude,
          YOSEMITE_CENTER.longitude,
          selectedRange!.startDate
        );
        if (!cancelled) setRangeWeather(weather);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [selectedRange, setRangeWeather]);

  const handleRangeSelect = useMemo(
    () => (range: DateRange) => {
      setRange(range);
    },
    [setRange]
  );

  const handleYearChange = useMemo(
    () => (year: number) => {
      setYear(year);
    },
    [setYear]
  );

  // Don't render the heatmap until scores are computed
  if (!yearScores) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-14">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Computing park data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col pt-14">
        <div className="flex flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Year selector */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                Yosemite Crowd Calendar
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Click two dates to select your visit window
              </p>
            </div>
            <YearSelector year={currentYear} onYearChange={handleYearChange} />
          </div>

          {/* Heatmap */}
          <CalendarHeatmap
            yearScores={yearScores}
            selectedRange={selectedRange}
            onRangeSelect={handleRangeSelect}
            year={currentYear}
          />

          {/* Legend */}
          <div className="mt-4">
            <HeatmapLegend />
          </div>

          {/* Range detail section (below calendar) */}
          {selectedRange && yearScores && (
            <RangePanel
              selectedRange={selectedRange}
              yearScores={yearScores}
              weather={rangeWeather}
              campsites={rangeCampsites}
              onClose={() => setRange(null)}
            />
          )}

          {/* Welcome message when no range selected */}
          {!selectedRange && (
            <div className="flex flex-col items-center gap-4 mt-12 mb-8 fade-in">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Mountain className="w-8 h-8" />
                <TreePine className="w-6 h-6" />
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Plan Your Yosemite Visit
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  The calendar above shows predicted crowd levels throughout the
                  year. Green days are quieter, red days are busier. Click a
                  start date and an end date to see detailed zone-by-zone
                  breakdown and trip recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Error banner */}
      {state.error && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 fade-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 shadow-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Something went wrong
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 truncate">
                {state.error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
