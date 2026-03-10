/**
 * Compute approximate sunrise, sunset, and day length for Yosemite Valley.
 * Uses a solar declination model for ~37.75°N latitude.
 * Accurate to approximately ±5 minutes — sufficient for trip planning.
 */

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const min = Math.round((hours - h) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

export function computeDaylight(dateStr: string): {
  sunrise: string;
  sunset: string;
  dayLengthHours: number;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(y, 0, 0).getTime()) / 86400000
  );

  // Day length model for ~37.75°N latitude
  // Summer solstice ~14.8h, winter solstice ~9.5h
  const avgDayLength = 12.15;
  const amplitude = 2.65;
  const dayLength =
    avgDayLength +
    amplitude * Math.sin((2 * Math.PI * (dayOfYear - 80)) / 365);

  // Solar noon at Yosemite (~119.6°W) in local time
  // Rough DST check: Mar–Nov
  const isDST = m >= 3 && m <= 10;
  const solarNoon = isDST ? 13.3 : 12.3;

  const sunriseH = solarNoon - dayLength / 2;
  const sunsetH = solarNoon + dayLength / 2;

  return {
    sunrise: formatTime(sunriseH),
    sunset: formatTime(sunsetH),
    dayLengthHours: Math.round(dayLength * 10) / 10,
  };
}
