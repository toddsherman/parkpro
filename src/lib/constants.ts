import { ParkZone } from "./types";

// Yosemite National Park center coordinates
export const YOSEMITE_CENTER = {
  latitude: 37.8651,
  longitude: -119.5383,
};

export const YOSEMITE_BOUNDS = {
  north: 38.18,
  south: 37.5,
  east: -119.2,
  west: -119.9,
};

export const DEFAULT_ZOOM = 10;

// Major Yosemite zones/POIs with real coordinates
export const PARK_ZONES: ParkZone[] = [
  {
    id: "yosemite-valley",
    name: "Yosemite Valley",
    description:
      "The iconic heart of the park featuring El Capitan, Half Dome views, and Yosemite Falls.",
    latitude: 37.7459,
    longitude: -119.5933,
    type: "valley",
    hasParking: true,
    trails: [
      "Yosemite Falls Trail",
      "Mirror Lake Loop",
      "Valley Loop Trail",
      "Four Mile Trail",
    ],
  },
  {
    id: "mariposa-grove",
    name: "Mariposa Grove",
    description:
      "Home to over 500 mature giant sequoias, including the famous Grizzly Giant.",
    latitude: 37.5145,
    longitude: -119.6006,
    type: "grove",
    hasParking: true,
    trails: [
      "Mariposa Grove Trail",
      "Grizzly Giant Loop",
      "Guardians Loop Trail",
    ],
  },
  {
    id: "glacier-point",
    name: "Glacier Point",
    description:
      "Dramatic viewpoint offering panoramic views of Yosemite Valley, Half Dome, and the High Sierra.",
    latitude: 37.7308,
    longitude: -119.5726,
    type: "viewpoint",
    hasParking: true,
    trails: ["Glacier Point Trail", "Panorama Trail", "Sentinel Dome Trail"],
  },
  {
    id: "tuolumne-meadows",
    name: "Tuolumne Meadows",
    description:
      "High-country subalpine meadow along the Tuolumne River at 8,600 feet elevation.",
    latitude: 37.8735,
    longitude: -119.3593,
    type: "valley",
    hasParking: true,
    trails: [
      "Cathedral Lakes Trail",
      "Lembert Dome Trail",
      "Soda Springs Trail",
    ],
  },
  {
    id: "hetch-hetchy",
    name: "Hetch Hetchy Reservoir",
    description:
      "A stunning reservoir valley with waterfalls, often less crowded than Yosemite Valley.",
    latitude: 37.9497,
    longitude: -119.7862,
    type: "valley",
    hasParking: true,
    trails: [
      "Wapama Falls Trail",
      "Rancheria Falls Trail",
      "Lookout Point Trail",
    ],
  },
  {
    id: "wawona",
    name: "Wawona",
    description:
      "Historic area in the southern part of the park with the Pioneer Yosemite History Center.",
    latitude: 37.5369,
    longitude: -119.6561,
    type: "visitor-center",
    hasParking: true,
    trails: [
      "Wawona Meadow Loop",
      "Chilnualna Falls Trail",
      "Alder Creek Trail",
    ],
  },
  {
    id: "bridalveil-fall",
    name: "Bridalveil Fall",
    description:
      "One of the most prominent waterfalls in the valley, with a short walk to the viewing area.",
    latitude: 37.7166,
    longitude: -119.6465,
    type: "trailhead",
    hasParking: true,
    trails: ["Bridalveil Fall Trail"],
  },
  {
    id: "half-dome-village",
    name: "Half Dome Village (Curry Village)",
    description:
      "Popular base camp area with lodging, dining, and trailhead access near Half Dome.",
    latitude: 37.7387,
    longitude: -119.5719,
    type: "visitor-center",
    hasParking: true,
    trails: [
      "Mist Trail",
      "John Muir Trail (to Vernal Fall)",
      "Half Dome Trail",
    ],
  },
  {
    id: "el-capitan",
    name: "El Capitan Meadow",
    description:
      "Iconic granite monolith viewing area, world-famous for rock climbing.",
    latitude: 37.7339,
    longitude: -119.6382,
    type: "viewpoint",
    hasParking: true,
    trails: ["El Capitan Trail"],
  },
  {
    id: "tioga-pass",
    name: "Tioga Pass Entrance",
    description:
      "The eastern gateway to the park along Highway 120, closed in winter.",
    latitude: 37.9106,
    longitude: -119.2578,
    type: "trailhead",
    hasParking: true,
    trails: ["Gaylor Lakes Trail", "Mt. Dana Trail"],
  },
];

// Recreation.gov facility IDs for Yosemite campgrounds
export const CAMPGROUND_FACILITY_IDS: Record<string, string> = {
  "upper-pines": "232447",
  "lower-pines": "232450",
  "north-pines": "232449",
  "wawona-campground": "232461",
  "hodgdon-meadow": "232445",
  "crane-flat": "232444",
  "bridalveil-creek": "232443",
  "tamarack-flat": "232458",
  "white-wolf": "232462",
  "yosemite-creek": "232463",
  "porcupine-flat": "232453",
  "tuolumne-meadows": "232459",
};

// NPS park code
export const NPS_PARK_CODE = "yose";

// Color mappings for busyness
export const CROWD_COLORS: Record<string, string> = {
  low: "#22c55e", // green-500
  moderate: "#eab308", // yellow-500
  high: "#ef4444", // red-500
  unknown: "#9ca3af", // gray-400
};

export const CROWD_LABELS: Record<string, string> = {
  low: "Low Crowds",
  moderate: "Moderate Crowds",
  high: "High Crowds",
  unknown: "Data Unavailable",
};

// Month-based historical busyness estimates (1-10 scale)
// Based on publicly available NPS visitation statistics
export const MONTHLY_BUSYNESS: Record<number, number> = {
  1: 2, // January
  2: 2, // February
  3: 3, // March
  4: 5, // April
  5: 7, // May
  6: 9, // June
  7: 10, // July
  8: 9, // August
  9: 7, // September
  10: 5, // October
  11: 3, // November
  12: 2, // December
};

// Day-of-week multipliers (relative busyness)
export const DAY_OF_WEEK_MULTIPLIER: Record<number, number> = {
  0: 1.3, // Sunday
  1: 0.6, // Monday
  2: 0.6, // Tuesday
  3: 0.7, // Wednesday
  4: 0.8, // Thursday
  5: 1.1, // Friday
  6: 1.4, // Saturday
};

// Monthly climate averages for Yosemite (approximate historic data)
export const MONTHLY_CLIMATE: Record<
  number,
  { highF: number; lowF: number; conditions: string[]; precipChance: number }
> = {
  1: { highF: 48, lowF: 26, conditions: ["Snow", "Cloudy", "Partly Cloudy", "Rain"], precipChance: 45 },
  2: { highF: 52, lowF: 28, conditions: ["Rain", "Cloudy", "Partly Cloudy", "Snow"], precipChance: 40 },
  3: { highF: 56, lowF: 30, conditions: ["Partly Cloudy", "Rain", "Sunny", "Cloudy"], precipChance: 35 },
  4: { highF: 63, lowF: 35, conditions: ["Sunny", "Partly Cloudy", "Rain", "Cloudy"], precipChance: 25 },
  5: { highF: 72, lowF: 42, conditions: ["Sunny", "Partly Cloudy", "Clear", "Sunny"], precipChance: 15 },
  6: { highF: 82, lowF: 50, conditions: ["Sunny", "Clear", "Sunny", "Partly Cloudy"], precipChance: 5 },
  7: { highF: 90, lowF: 56, conditions: ["Sunny", "Clear", "Sunny", "Clear"], precipChance: 3 },
  8: { highF: 88, lowF: 55, conditions: ["Sunny", "Clear", "Sunny", "Partly Cloudy"], precipChance: 3 },
  9: { highF: 82, lowF: 48, conditions: ["Sunny", "Clear", "Partly Cloudy", "Sunny"], precipChance: 5 },
  10: { highF: 70, lowF: 38, conditions: ["Partly Cloudy", "Sunny", "Cloudy", "Rain"], precipChance: 20 },
  11: { highF: 56, lowF: 30, conditions: ["Cloudy", "Rain", "Partly Cloudy", "Snow"], precipChance: 35 },
  12: { highF: 48, lowF: 26, conditions: ["Snow", "Cloudy", "Rain", "Partly Cloudy"], precipChance: 45 },
};

// Zone-specific busyness multipliers (some areas attract more visitors)
export const ZONE_POPULARITY: Record<string, number> = {
  "yosemite-valley": 1.5,
  "mariposa-grove": 1.2,
  "glacier-point": 1.3,
  "tuolumne-meadows": 0.9,
  "hetch-hetchy": 0.5,
  "wawona": 0.7,
  "bridalveil-fall": 1.4,
  "half-dome-village": 1.4,
  "el-capitan": 1.1,
  "tioga-pass": 0.6,
};
