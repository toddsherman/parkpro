import { YearScoreData } from "../types";
import { PARK_ZONES } from "../constants";
import { calculateBusynessScore } from "./scoring";

/**
 * Precompute busyness scores for every day of a given year
 * across all park zones. Returns averaged daily scores and
 * per-zone breakdowns.
 *
 * ~3,650 calculations (365 days × 10 zones). Runs in <5ms.
 */
export function computeYearScores(year: number): YearScoreData {
  const dailyAverages: Record<string, number> = {};
  const dailyByZone: Record<string, Record<string, number>> = {};

  // Determine if leap year
  const daysInYear = isLeapYear(year) ? 366 : 365;

  for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
    const date = new Date(year, 0, 1 + dayIndex);
    const dateStr = formatDateISO(date);

    const zoneScores: Record<string, number> = {};
    let total = 0;

    for (const zone of PARK_ZONES) {
      const score = calculateBusynessScore(date, zone.id);
      zoneScores[zone.id] = Math.round(score * 10) / 10; // 1 decimal
      total += score;
    }

    dailyByZone[dateStr] = zoneScores;
    dailyAverages[dateStr] =
      Math.round((total / PARK_ZONES.length) * 10) / 10;
  }

  return { dailyAverages, dailyByZone };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
