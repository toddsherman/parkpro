"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearSelectorProps {
  year: number;
  onYearChange: (year: number) => void;
}

export default function YearSelector({ year, onYearChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 1;
  const maxYear = currentYear + 2;

  const canGoBack = year > minYear;
  const canGoForward = year < maxYear;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => canGoBack && onYearChange(year - 1)}
        disabled={!canGoBack}
        className="rounded-md p-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="Previous year"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="min-w-[4rem] text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
        {year}
      </span>

      <button
        onClick={() => canGoForward && onYearChange(year + 1)}
        disabled={!canGoForward}
        className="rounded-md p-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="Next year"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
