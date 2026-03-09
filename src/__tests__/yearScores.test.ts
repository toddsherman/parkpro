import { computeYearScores } from "@/lib/utils/yearScores";
import { PARK_ZONES } from "@/lib/constants";

describe("computeYearScores", () => {
  const scores = computeYearScores(2026);

  it("returns scores for every day of the year", () => {
    const dayCount = Object.keys(scores.dailyAverages).length;
    expect(dayCount).toBe(365); // 2026 is not a leap year
  });

  it("returns per-zone data for every day", () => {
    const dayCount = Object.keys(scores.dailyByZone).length;
    expect(dayCount).toBe(365);

    // Each day should have scores for all 10 zones
    const firstDay = scores.dailyByZone["2026-01-01"];
    expect(Object.keys(firstDay).length).toBe(PARK_ZONES.length);
  });

  it("returns scores in valid 0-10 range", () => {
    for (const [, score] of Object.entries(scores.dailyAverages)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    }
  });

  it("shows higher scores in summer than winter", () => {
    const janAvg = scores.dailyAverages["2026-01-15"];
    const julAvg = scores.dailyAverages["2026-07-15"];
    expect(julAvg).toBeGreaterThan(janAvg);
  });

  it("correctly formats date keys as YYYY-MM-DD", () => {
    expect(scores.dailyAverages["2026-01-01"]).toBeDefined();
    expect(scores.dailyAverages["2026-12-31"]).toBeDefined();
    expect(scores.dailyAverages["2026-03-09"]).toBeDefined();
  });

  it("handles leap years correctly", () => {
    const leapScores = computeYearScores(2028);
    const dayCount = Object.keys(leapScores.dailyAverages).length;
    expect(dayCount).toBe(366);
    expect(leapScores.dailyAverages["2028-02-29"]).toBeDefined();
  });

  it("Yosemite Valley has higher scores than Hetch Hetchy", () => {
    // Yosemite Valley has popularity 1.5, Hetch Hetchy has 0.5
    const julDay = scores.dailyByZone["2026-07-15"];
    expect(julDay["yosemite-valley"]).toBeGreaterThan(julDay["hetch-hetchy"]);
  });
});
