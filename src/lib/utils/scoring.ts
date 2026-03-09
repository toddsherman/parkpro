import {
  CrowdLevel,
  DailyCrowdData,
} from "../types";
import {
  MONTHLY_BUSYNESS,
  DAY_OF_WEEK_MULTIPLIER,
  ZONE_POPULARITY,
} from "../constants";

// ---------------------------------------------------------------------------
// US Federal Holiday Detection
// Major holidays cause significant visitation spikes at national parks.
// Source: NPS reports note Memorial Day, July 4th, Labor Day, and Columbus Day
// weekends as peak periods with 2-3 hour entrance delays.
// ---------------------------------------------------------------------------

/**
 * Returns a holiday multiplier for the given date.
 * Returns 1.0 for non-holiday dates, higher values for holidays and their
 * adjacent days (long weekends).
 */
function getHolidayMultiplier(date: Date): number {
  const month = date.getMonth() + 1; // 1-indexed
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun

  // MLK Day (3rd Monday of January)
  if (month === 1 && dayOfWeek === 1 && dayOfMonth >= 15 && dayOfMonth <= 21) return 1.2;
  // MLK weekend (Sat-Sun before)
  if (month === 1 && dayOfMonth >= 13 && dayOfMonth <= 20) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.15;
  }

  // Presidents' Day (3rd Monday of February)
  if (month === 2 && dayOfWeek === 1 && dayOfMonth >= 15 && dayOfMonth <= 21) return 1.25;
  if (month === 2 && dayOfMonth >= 13 && dayOfMonth <= 20) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.2;
  }

  // Memorial Day (last Monday of May) — major peak weekend
  if (month === 5 && dayOfWeek === 1 && dayOfMonth >= 25) return 1.4;
  if (month === 5 && dayOfMonth >= 23) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.35;
    if (dayOfWeek === 5 && dayOfMonth >= 24) return 1.2; // Friday before
  }

  // Independence Day (July 4th) — peak holiday
  if (month === 7 && dayOfMonth === 4) return 1.4;
  if (month === 7 && dayOfMonth >= 2 && dayOfMonth <= 6) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.35;
  }

  // Labor Day (1st Monday of September) — major peak weekend
  if (month === 9 && dayOfWeek === 1 && dayOfMonth <= 7) return 1.4;
  if (month === 9 && dayOfMonth <= 7) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.35;
    if (dayOfWeek === 5 && dayOfMonth <= 6) return 1.2;
  }

  // Columbus Day / Indigenous Peoples' Day (2nd Monday of October)
  if (month === 10 && dayOfWeek === 1 && dayOfMonth >= 8 && dayOfMonth <= 14) return 1.25;
  if (month === 10 && dayOfMonth >= 6 && dayOfMonth <= 13) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.2;
  }

  // Thanksgiving (4th Thursday of November) — moderate bump
  if (month === 11 && dayOfWeek === 4 && dayOfMonth >= 22 && dayOfMonth <= 28) return 1.2;
  // Black Friday
  if (month === 11 && dayOfWeek === 5 && dayOfMonth >= 23 && dayOfMonth <= 29) return 1.15;
  // Thanksgiving weekend
  if (month === 11 && dayOfMonth >= 22 && dayOfMonth <= 29) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 1.15;
  }

  // Christmas & New Year's — winter holiday week
  if (month === 12 && dayOfMonth >= 23) return 1.2;
  if (month === 1 && dayOfMonth <= 2) return 1.2;

  // Spring break effect (mid-March to mid-April, slight boost on weekdays)
  if ((month === 3 && dayOfMonth >= 15) || (month === 4 && dayOfMonth <= 15)) {
    return 1.05;
  }

  return 1.0;
}

/**
 * Calculate a busyness score (0-10) for a specific date and zone.
 *
 * The score combines four factors:
 * 1. Monthly baseline — from NPS visitation data (2015–2024)
 * 2. Day-of-week effect — weekends are significantly busier
 * 3. Zone popularity — some areas attract far more visitors
 * 4. Holiday multiplier — federal holidays cause major spikes
 *
 * Plus a small deterministic variance for visual texture.
 */
export function calculateBusynessScore(
  date: Date,
  zoneId: string
): number {
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  const monthBase = MONTHLY_BUSYNESS[month] ?? 5;
  const dayMultiplier = DAY_OF_WEEK_MULTIPLIER[dayOfWeek] ?? 1;
  const zoneMultiplier = ZONE_POPULARITY[zoneId] ?? 1;
  const holidayMultiplier = getHolidayMultiplier(date);

  // Add some deterministic variance based on the day of month
  const dayOfMonth = date.getDate();
  const variance = ((dayOfMonth * 7 + month * 3) % 10) / 20 - 0.25; // -0.25 to +0.25

  const raw = monthBase * dayMultiplier * zoneMultiplier * holidayMultiplier + variance;
  return Math.max(0, Math.min(10, raw));
}

/**
 * Convert a numeric busyness score to a crowd level
 */
export function scoreToCrowdLevel(score: number): CrowdLevel {
  if (score < 3.5) return "low";
  if (score < 6.5) return "moderate";
  return "high";
}

/**
 * Generate daily crowd data for a zone across a week
 */
export function generateWeekCrowdData(
  startDate: Date,
  zoneId: string
): DailyCrowdData[] {
  const days: DailyCrowdData[] = [];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const score = calculateBusynessScore(date, zoneId);
    const level = scoreToCrowdLevel(score);

    // Parking is generally slightly busier than trails
    const parkingScore = Math.min(10, score * 1.1);
    // Trail level is slightly lower
    const trailScore = score * 0.9;

    days.push({
      date: date.toISOString().split("T")[0],
      dayOfWeek: dayNames[date.getDay()],
      parkingLevel: scoreToCrowdLevel(parkingScore),
      trailLevel: scoreToCrowdLevel(trailScore),
      overallLevel: level,
    });
  }

  return days;
}

/**
 * Compute overall busyness for a zone across an entire week
 */
export function computeOverallWeekBusyness(
  dailyCrowds: DailyCrowdData[]
): CrowdLevel {
  const levelValues: Record<CrowdLevel, number> = {
    low: 1,
    moderate: 2,
    high: 3,
    unknown: 0,
  };

  const known = dailyCrowds.filter((d) => d.overallLevel !== "unknown");
  if (known.length === 0) return "unknown";

  const avg =
    known.reduce((sum, d) => sum + levelValues[d.overallLevel], 0) /
    known.length;

  if (avg < 1.5) return "low";
  if (avg < 2.5) return "moderate";
  return "high";
}
