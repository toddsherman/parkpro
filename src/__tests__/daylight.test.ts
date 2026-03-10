import { computeDaylight } from "@/lib/utils/daylight";

describe("computeDaylight", () => {
  it("returns sunrise, sunset, and dayLengthHours", () => {
    const result = computeDaylight("2026-06-21");
    expect(result).toHaveProperty("sunrise");
    expect(result).toHaveProperty("sunset");
    expect(result).toHaveProperty("dayLengthHours");
  });

  it("has longest day near summer solstice (~14.5–15h)", () => {
    const { dayLengthHours } = computeDaylight("2026-06-21");
    expect(dayLengthHours).toBeGreaterThanOrEqual(14.0);
    expect(dayLengthHours).toBeLessThanOrEqual(15.5);
  });

  it("has shortest day near winter solstice (~9.5–10h)", () => {
    const { dayLengthHours } = computeDaylight("2026-12-21");
    expect(dayLengthHours).toBeGreaterThanOrEqual(9.0);
    expect(dayLengthHours).toBeLessThanOrEqual(10.5);
  });

  it("has ~12 hours near equinox", () => {
    const { dayLengthHours } = computeDaylight("2026-03-20");
    expect(dayLengthHours).toBeGreaterThanOrEqual(11.5);
    expect(dayLengthHours).toBeLessThanOrEqual(12.8);
  });

  it("summer days are longer than winter days", () => {
    const summer = computeDaylight("2026-07-15");
    const winter = computeDaylight("2026-01-15");
    expect(summer.dayLengthHours).toBeGreaterThan(winter.dayLengthHours);
  });

  it("formats sunrise as AM time", () => {
    const { sunrise } = computeDaylight("2026-06-15");
    expect(sunrise).toMatch(/^\d{1,2}:\d{2} AM$/);
  });

  it("formats sunset as PM time", () => {
    const { sunset } = computeDaylight("2026-06-15");
    expect(sunset).toMatch(/^\d{1,2}:\d{2} PM$/);
  });

  it("is deterministic", () => {
    const a = computeDaylight("2026-08-10");
    const b = computeDaylight("2026-08-10");
    expect(a).toEqual(b);
  });

  it("sunrise is earlier in summer than winter", () => {
    const summer = computeDaylight("2026-06-21");
    const winter = computeDaylight("2026-12-21");
    // Parse the hour from sunrise string
    const summerHour = parseInt(summer.sunrise.split(":")[0], 10);
    const winterHour = parseInt(winter.sunrise.split(":")[0], 10);
    expect(summerHour).toBeLessThanOrEqual(winterHour);
  });
});
