import {
  CrowdLevel,
  DailyCrowdData,
} from "../types";
import {
  MONTHLY_BUSYNESS,
  DAY_OF_WEEK_MULTIPLIER,
  ZONE_POPULARITY,
  SEASONAL_ROAD_CLOSURES,
} from "../constants";

// ---------------------------------------------------------------------------
// US Federal Holiday & Event Detection
// Major holidays and events cause significant visitation spikes.
// Source: NPS reports note Memorial Day, July 4th, Labor Day, and Columbus Day
// weekends as peak periods with 2-3 hour entrance delays.
// ---------------------------------------------------------------------------

/**
 * Returns a holiday/event multiplier for the given date.
 * Uses Math.max across all applicable rules so overlapping events
 * (e.g. Firefall + Presidents' Day) take the higher multiplier.
 */
function getHolidayMultiplier(date: Date): number {
  const month = date.getMonth() + 1; // 1-indexed
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun

  let m = 1.0;

  // Firefall / Horsetail Fall (Feb 10–28)
  // Sunset illuminates Horsetail Fall on El Capitan.
  // Source: NPS — nps.gov/yose/planyourvisit/horsetailfall.htm
  if (month === 2) {
    if (dayOfMonth >= 16 && dayOfMonth <= 24) m = Math.max(m, 1.4);
    else if (dayOfMonth >= 10 && dayOfMonth <= 28) m = Math.max(m, 1.2);
  }

  // MLK Day (3rd Monday of January)
  if (month === 1 && dayOfWeek === 1 && dayOfMonth >= 15 && dayOfMonth <= 21) m = Math.max(m, 1.2);
  if (month === 1 && dayOfMonth >= 13 && dayOfMonth <= 20) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.15);
  }

  // Presidents' Day (3rd Monday of February)
  if (month === 2 && dayOfWeek === 1 && dayOfMonth >= 15 && dayOfMonth <= 21) m = Math.max(m, 1.25);
  if (month === 2 && dayOfMonth >= 13 && dayOfMonth <= 20) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.2);
  }

  // Memorial Day (last Monday of May) — major peak weekend
  if (month === 5 && dayOfWeek === 1 && dayOfMonth >= 25) m = Math.max(m, 1.4);
  if (month === 5 && dayOfMonth >= 23) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.35);
    if (dayOfWeek === 5 && dayOfMonth >= 24) m = Math.max(m, 1.2);
  }

  // Independence Day (July 4th) — peak holiday
  if (month === 7 && dayOfMonth === 4) m = Math.max(m, 1.4);
  if (month === 7 && dayOfMonth >= 2 && dayOfMonth <= 6) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.35);
  }

  // Labor Day (1st Monday of September) — major peak weekend
  if (month === 9 && dayOfWeek === 1 && dayOfMonth <= 7) m = Math.max(m, 1.4);
  if (month === 9 && dayOfMonth <= 7) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.35);
    if (dayOfWeek === 5 && dayOfMonth <= 6) m = Math.max(m, 1.2);
  }

  // Columbus Day / Indigenous Peoples' Day (2nd Monday of October)
  if (month === 10 && dayOfWeek === 1 && dayOfMonth >= 8 && dayOfMonth <= 14) m = Math.max(m, 1.25);
  if (month === 10 && dayOfMonth >= 6 && dayOfMonth <= 13) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.2);
  }

  // Thanksgiving (4th Thursday of November) — moderate bump
  if (month === 11 && dayOfWeek === 4 && dayOfMonth >= 22 && dayOfMonth <= 28) m = Math.max(m, 1.2);
  if (month === 11 && dayOfWeek === 5 && dayOfMonth >= 23 && dayOfMonth <= 29) m = Math.max(m, 1.15);
  if (month === 11 && dayOfMonth >= 22 && dayOfMonth <= 29) {
    if (dayOfWeek === 0 || dayOfWeek === 6) m = Math.max(m, 1.15);
  }

  // Christmas & New Year's — winter holiday week
  if (month === 12 && dayOfMonth >= 23) m = Math.max(m, 1.2);
  if (month === 1 && dayOfMonth <= 2) m = Math.max(m, 1.2);

  // Spring break effect (mid-March to mid-April, slight boost)
  if ((month === 3 && dayOfMonth >= 15) || (month === 4 && dayOfMonth <= 15)) {
    m = Math.max(m, 1.05);
  }

  return m;
}

// ---------------------------------------------------------------------------
// Seasonal Road Closure Detection
// Returns a multiplier that dramatically reduces zone scores when the access
// road is typically closed due to snow.
// ---------------------------------------------------------------------------

function getRoadClosureMultiplier(date: Date, zoneId: string): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const road of SEASONAL_ROAD_CLOSURES) {
    if (!road.affectedZones.includes(zoneId)) continue;

    const { typicalOpen, typicalClose } = road;

    // Closed period spans across year boundary: after close OR before open
    const afterClose =
      month > typicalClose.month ||
      (month === typicalClose.month && day > typicalClose.day);
    const beforeOpen =
      month < typicalOpen.month ||
      (month === typicalOpen.month && day < typicalOpen.day);

    if (afterClose || beforeOpen) {
      return road.closedMultiplier;
    }
  }

  return 1.0;
}

// ---------------------------------------------------------------------------
// Monthly Baseline Interpolation
// NPS data is monthly totals — we don't know the within-month distribution.
// Treating each month's value as anchored at the 15th and linearly
// interpolating between adjacent midpoints creates smooth transitions
// instead of artificial cliffs at month boundaries.
// ---------------------------------------------------------------------------

function getInterpolatedMonthBase(month: number, dayOfMonth: number): number {
  const current = MONTHLY_BUSYNESS[month] ?? 5;
  const midpoint = 15;

  if (dayOfMonth <= midpoint) {
    // First half of month: blend with previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prev = MONTHLY_BUSYNESS[prevMonth] ?? 5;
    const t = (dayOfMonth - 1) / (midpoint - 1); // 0 at day 1, 1 at day 15
    const boundary = (prev + current) / 2;
    return boundary + (current - boundary) * t;
  } else {
    // Second half of month: blend with next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const next = MONTHLY_BUSYNESS[nextMonth] ?? 5;
    const daysInMonth = new Date(2026, month, 0).getDate();
    const t = (dayOfMonth - midpoint) / (daysInMonth - midpoint); // 0 at day 15, 1 at last day
    const boundary = (current + next) / 2;
    return current + (boundary - current) * t;
  }
}

/**
 * Calculate a busyness score (0-10) for a specific date and zone.
 *
 * The score combines five factors:
 * 1. Monthly baseline — from NPS visitation data (2015–2024)
 * 2. Day-of-week effect — weekends are significantly busier
 * 3. Zone popularity — some areas attract far more visitors
 * 4. Holiday/event multiplier — federal holidays & Firefall cause spikes
 * 5. Road closure — seasonal closures dramatically reduce access
 *
 * Plus a small deterministic variance for visual texture.
 */
export function calculateBusynessScore(
  date: Date,
  zoneId: string
): number {
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  const monthBase = getInterpolatedMonthBase(month, date.getDate());
  const dayMultiplier = DAY_OF_WEEK_MULTIPLIER[dayOfWeek] ?? 1;
  const zoneMultiplier = ZONE_POPULARITY[zoneId] ?? 1;
  const holidayMultiplier = getHolidayMultiplier(date);
  const roadClosureMultiplier = getRoadClosureMultiplier(date, zoneId);

  // Add some deterministic variance based on the day of month
  const dayOfMonth = date.getDate();
  const variance = ((dayOfMonth * 7 + month * 3) % 10) / 20 - 0.25; // -0.25 to +0.25

  const raw = monthBase * dayMultiplier * zoneMultiplier * holidayMultiplier * roadClosureMultiplier + variance;
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
