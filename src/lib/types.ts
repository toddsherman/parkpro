export interface ParkZone {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: "valley" | "grove" | "trailhead" | "viewpoint" | "visitor-center";
  hasParking: boolean;
  trails: string[];
}

export interface DailyForecast {
  date: string; // ISO date string YYYY-MM-DD
  dayOfWeek: string;
  tempHighF: number;
  tempLowF: number;
  condition: string; // e.g., "Sunny", "Partly Cloudy", "Rain"
  precipChance: number; // 0-100
  icon: string;
}

export interface DailyCrowdData {
  date: string;
  dayOfWeek: string;
  parkingLevel: CrowdLevel;
  trailLevel: CrowdLevel;
  overallLevel: CrowdLevel;
}

export type CrowdLevel = "low" | "moderate" | "high" | "unknown";

export interface ParkAlert {
  id: string;
  title: string;
  description: string;
  category: "danger" | "caution" | "information";
  url?: string;
}

export interface CampsiteAvailability {
  date: string;
  totalSites: number;
  availableSites: number;
  percentBooked: number;
}

// --- Calendar redesign types ---

export interface DateRange {
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
}

export interface YearScoreData {
  /** date → averaged busyness score across all zones (0-10) */
  dailyAverages: Record<string, number>;
  /** date → per-zone scores: { "yosemite-valley": 7.2, ... } */
  dailyByZone: Record<string, Record<string, number>>;
}

export interface AppState {
  selectedRange: DateRange | null;
  zones: ParkZone[];
  yearScores: YearScoreData | null;
  rangeWeather: DailyForecast[];
  rangeCampsites: CampsiteAvailability[];
  alerts: ParkAlert[];
  isLoading: boolean;
  error: string | null;
  currentYear: number;
}

// --- Legacy types (kept for API route compatibility) ---

export interface ZoneWeekData {
  zone: ParkZone;
  dailyWeather: DailyForecast[];
  dailyCrowds: DailyCrowdData[];
  campsiteAvailability: CampsiteAvailability[];
  overallBusyness: CrowdLevel;
}

export interface WeekSelection {
  startDate: string;
  endDate: string;
  label: string;
}

// API response types
export interface WeatherAPIResponse {
  daily: Array<{
    dt: number;
    temp: { min: number; max: number };
    weather: Array<{ main: string; description: string; icon: string }>;
    pop: number;
  }>;
}

export interface NPSAlertResponse {
  data: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    url: string;
  }>;
}

export interface RecreationAvailabilityResponse {
  campsites: Record<
    string,
    {
      availabilities: Record<string, string>;
      campsite_type: string;
    }
  >;
}
