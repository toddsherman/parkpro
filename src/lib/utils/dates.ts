import { WeekSelection, DateRange } from "../types";
import { format, startOfWeek, endOfWeek, addWeeks, differenceInCalendarDays } from "date-fns";

// ─── Legacy helpers (kept for backward-compat & tests) ──────────────────────

/**
 * Get the week selection for a given date (week starts Monday)
 */
export function getWeekForDate(date: Date): WeekSelection {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
    label: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
  };
}

/**
 * Generate a list of selectable weeks starting from today
 */
export function getSelectableWeeks(count: number = 12): WeekSelection[] {
  const weeks: WeekSelection[] = [];
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

  for (let i = 0; i < count; i++) {
    const weekStart = addWeeks(currentWeekStart, i);
    weeks.push(getWeekForDate(weekStart));
  }

  return weeks;
}

/**
 * Get day names for a week starting from a given Monday
 */
export function getWeekDays(startDateStr: string): Date[] {
  const start = new Date(startDateStr + "T00:00:00");
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

// ─── New date-range helpers ─────────────────────────────────────────────────

/**
 * Get all ISO date strings between start and end (inclusive).
 */
export function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = parseLocalDate(start);
  const endDate = parseLocalDate(end);

  while (current <= endDate) {
    dates.push(formatISO(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Human-readable label for a date range.
 * e.g. "Mar 9 – Mar 15, 2026 (7 days)"
 */
export function formatDateRange(range: DateRange): string {
  const start = parseLocalDate(range.startDate);
  const end = parseLocalDate(range.endDate);
  const days = getDayCount(range);
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")} (${days} day${days !== 1 ? "s" : ""})`;
}

/**
 * Number of days in a date range (inclusive).
 */
export function getDayCount(range: DateRange): number {
  return (
    differenceInCalendarDays(
      parseLocalDate(range.endDate),
      parseLocalDate(range.startDate)
    ) + 1
  );
}

/**
 * Check whether a date string falls within a range (inclusive).
 */
export function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.startDate && date <= range.endDate;
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/** Parse "YYYY-MM-DD" as a local-timezone Date (avoids UTC midnight issues). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date to "YYYY-MM-DD" without timezone shift. */
function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
