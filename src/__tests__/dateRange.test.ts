import {
  getDatesBetween,
  formatDateRange,
  getDayCount,
  isDateInRange,
} from "@/lib/utils/dates";

describe("getDatesBetween", () => {
  it("returns all dates between start and end inclusive", () => {
    const dates = getDatesBetween("2026-03-09", "2026-03-15");
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe("2026-03-09");
    expect(dates[6]).toBe("2026-03-15");
  });

  it("returns a single date when start equals end", () => {
    const dates = getDatesBetween("2026-06-15", "2026-06-15");
    expect(dates).toHaveLength(1);
    expect(dates[0]).toBe("2026-06-15");
  });

  it("returns consecutive dates", () => {
    const dates = getDatesBetween("2026-01-01", "2026-01-05");
    expect(dates).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
      "2026-01-05",
    ]);
  });

  it("handles month boundary", () => {
    const dates = getDatesBetween("2026-01-30", "2026-02-02");
    expect(dates).toHaveLength(4);
    expect(dates).toContain("2026-01-31");
    expect(dates).toContain("2026-02-01");
  });
});

describe("formatDateRange", () => {
  it("formats a multi-day range with day count", () => {
    const label = formatDateRange({
      startDate: "2026-03-09",
      endDate: "2026-03-15",
    });
    expect(label).toContain("Mar 9");
    expect(label).toContain("Mar 15");
    expect(label).toContain("7 days");
  });

  it("formats a single day range", () => {
    const label = formatDateRange({
      startDate: "2026-06-15",
      endDate: "2026-06-15",
    });
    expect(label).toContain("1 day");
  });
});

describe("getDayCount", () => {
  it("counts days inclusively", () => {
    expect(
      getDayCount({ startDate: "2026-03-09", endDate: "2026-03-15" })
    ).toBe(7);
  });

  it("returns 1 for a single day", () => {
    expect(
      getDayCount({ startDate: "2026-06-15", endDate: "2026-06-15" })
    ).toBe(1);
  });

  it("handles 14-day range", () => {
    expect(
      getDayCount({ startDate: "2026-07-01", endDate: "2026-07-14" })
    ).toBe(14);
  });
});

describe("isDateInRange", () => {
  const range = { startDate: "2026-03-09", endDate: "2026-03-15" };

  it("returns true for dates within range", () => {
    expect(isDateInRange("2026-03-09", range)).toBe(true);
    expect(isDateInRange("2026-03-12", range)).toBe(true);
    expect(isDateInRange("2026-03-15", range)).toBe(true);
  });

  it("returns false for dates outside range", () => {
    expect(isDateInRange("2026-03-08", range)).toBe(false);
    expect(isDateInRange("2026-03-16", range)).toBe(false);
    expect(isDateInRange("2026-01-01", range)).toBe(false);
  });
});
