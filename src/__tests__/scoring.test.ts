import {
  calculateBusynessScore,
  scoreToCrowdLevel,
  generateWeekCrowdData,
  computeOverallWeekBusyness,
} from "@/lib/utils/scoring";
import type { DailyCrowdData, CrowdLevel } from "@/lib/types";

describe("scoring utilities", () => {
  describe("calculateBusynessScore", () => {
    it("returns a number between 0 and 10", () => {
      const dates = [
        new Date("2026-01-15"), // winter
        new Date("2026-07-04"), // peak summer
        new Date("2026-03-10"), // spring
        new Date("2026-10-15"), // fall
      ];

      for (const date of dates) {
        const score = calculateBusynessScore(date, "yosemite-valley");
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      }
    });

    it("returns higher scores in summer than winter", () => {
      const summer = calculateBusynessScore(
        new Date("2026-07-15"),
        "yosemite-valley"
      );
      const winter = calculateBusynessScore(
        new Date("2026-01-15"),
        "yosemite-valley"
      );
      expect(summer).toBeGreaterThan(winter);
    });

    it("returns higher scores on weekends than weekdays", () => {
      // 2026-06-13 is a Saturday, 2026-06-09 is a Tuesday
      const saturday = calculateBusynessScore(
        new Date("2026-06-13"),
        "yosemite-valley"
      );
      const tuesday = calculateBusynessScore(
        new Date("2026-06-09"),
        "yosemite-valley"
      );
      expect(saturday).toBeGreaterThan(tuesday);
    });

    it("returns higher scores for popular zones", () => {
      const date = new Date("2026-06-15");
      const valley = calculateBusynessScore(date, "yosemite-valley");
      const hetch = calculateBusynessScore(date, "hetch-hetchy");
      expect(valley).toBeGreaterThan(hetch);
    });

    it("is deterministic for the same inputs", () => {
      const date = new Date("2026-05-20");
      const score1 = calculateBusynessScore(date, "glacier-point");
      const score2 = calculateBusynessScore(date, "glacier-point");
      expect(score1).toEqual(score2);
    });

    it("boosts scores on federal holidays", () => {
      // Use a mid-popularity zone so scores don't clamp to 10
      // 2026-09-07 is Labor Day (Monday); 2026-09-14 is a regular Monday
      const laborDay = calculateBusynessScore(
        new Date(2026, 8, 7), // Sep 7, local time
        "tuolumne-meadows"
      );
      const regularMonday = calculateBusynessScore(
        new Date(2026, 8, 14), // Sep 14, local time
        "tuolumne-meadows"
      );
      expect(laborDay).toBeGreaterThan(regularMonday);
    });

    it("produces realistic NPS-calibrated ranges", () => {
      // Winter weekday at remote zone should be low (<3.5)
      const winterQuiet = calculateBusynessScore(
        new Date("2026-01-06"), // Tuesday
        "hetch-hetchy"
      );
      expect(winterQuiet).toBeLessThan(3.5);

      // Peak summer weekend at Valley should be high (>6.5)
      const summerPeak = calculateBusynessScore(
        new Date("2026-07-11"), // Saturday
        "yosemite-valley"
      );
      expect(summerPeak).toBeGreaterThanOrEqual(6.5);
    });
  });

  describe("scoreToCrowdLevel", () => {
    it("returns 'low' for scores under 3.5", () => {
      expect(scoreToCrowdLevel(0)).toBe("low");
      expect(scoreToCrowdLevel(1)).toBe("low");
      expect(scoreToCrowdLevel(3.4)).toBe("low");
    });

    it("returns 'moderate' for scores between 3.5 and 6.5", () => {
      expect(scoreToCrowdLevel(3.5)).toBe("moderate");
      expect(scoreToCrowdLevel(5)).toBe("moderate");
      expect(scoreToCrowdLevel(6.4)).toBe("moderate");
    });

    it("returns 'high' for scores 6.5 and above", () => {
      expect(scoreToCrowdLevel(6.5)).toBe("high");
      expect(scoreToCrowdLevel(8)).toBe("high");
      expect(scoreToCrowdLevel(10)).toBe("high");
    });
  });

  describe("generateWeekCrowdData", () => {
    it("returns 7 days of data", () => {
      const result = generateWeekCrowdData(
        new Date("2026-03-09"),
        "yosemite-valley"
      );
      expect(result).toHaveLength(7);
    });

    it("returns valid crowd levels for each day", () => {
      const result = generateWeekCrowdData(
        new Date("2026-06-15"),
        "mariposa-grove"
      );
      const validLevels: CrowdLevel[] = ["low", "moderate", "high", "unknown"];

      for (const day of result) {
        expect(validLevels).toContain(day.overallLevel);
        expect(validLevels).toContain(day.parkingLevel);
        expect(validLevels).toContain(day.trailLevel);
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day.dayOfWeek).toBeTruthy();
      }
    });

    it("returns consecutive dates", () => {
      const result = generateWeekCrowdData(
        new Date("2026-03-09"),
        "yosemite-valley"
      );
      for (let i = 1; i < result.length; i++) {
        const prev = new Date(result[i - 1].date);
        const curr = new Date(result[i].date);
        const diffMs = curr.getTime() - prev.getTime();
        expect(diffMs).toBe(86400000); // 1 day in ms
      }
    });
  });

  describe("computeOverallWeekBusyness", () => {
    it("returns 'unknown' for empty data", () => {
      expect(computeOverallWeekBusyness([])).toBe("unknown");
    });

    it("returns 'unknown' when all days are unknown", () => {
      const data: DailyCrowdData[] = [
        {
          date: "2026-03-09",
          dayOfWeek: "Monday",
          parkingLevel: "unknown",
          trailLevel: "unknown",
          overallLevel: "unknown",
        },
      ];
      expect(computeOverallWeekBusyness(data)).toBe("unknown");
    });

    it("returns 'low' when all days are low", () => {
      const data: DailyCrowdData[] = Array(7)
        .fill(null)
        .map((_, i) => ({
          date: `2026-01-${10 + i}`,
          dayOfWeek: "Day",
          parkingLevel: "low" as CrowdLevel,
          trailLevel: "low" as CrowdLevel,
          overallLevel: "low" as CrowdLevel,
        }));
      expect(computeOverallWeekBusyness(data)).toBe("low");
    });

    it("returns 'high' when all days are high", () => {
      const data: DailyCrowdData[] = Array(7)
        .fill(null)
        .map((_, i) => ({
          date: `2026-07-${10 + i}`,
          dayOfWeek: "Day",
          parkingLevel: "high" as CrowdLevel,
          trailLevel: "high" as CrowdLevel,
          overallLevel: "high" as CrowdLevel,
        }));
      expect(computeOverallWeekBusyness(data)).toBe("high");
    });
  });
});
