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

// ---------------------------------------------------------------------------
// NPS Visitation Data
// Source: NPS Stats REST API (irmaservices.nps.gov/Stats/v1)
// Data: Monthly recreation visits for Yosemite NP (YOSE), 2015–2019 & 2022–2024
//       (2020–2021 excluded due to COVID-19 closures/reservation systems)
//       2023-Mar excluded (anomalous closure, only 25k visitors)
// See: https://www.nps.gov/yose/planyourvisit/visitation.htm
//      https://irma.nps.gov/Stats/Reports/Park/YOSE
// ---------------------------------------------------------------------------

/** Average monthly recreation visitors (rounded), computed from NPS data. */
export const NPS_MONTHLY_VISITORS: Record<number, number> = {
  1: 125800, // Jan avg: 128k,140k,120k,129k,117k,137k,107k,128k
  2: 138695, // Feb avg: 135k,202k,119k,143k,112k,170k,107k,121k
  3: 190354, // Mar avg: 195k,287k,167k,171k,174k,193k,147k (excl 2023)
  4: 273771, // Apr avg: 281k,305k,303k,278k,297k,286k,206k,234k
  5: 403614, // May avg: 408k,457k,472k,386k,393k,381k,322k,410k
  6: 547330, // Jun avg: 545k,704k,566k,544k,497k,470k,488k,566k
  7: 601655, // Jul avg: 626k,781k,633k,504k,717k,397k,580k,574k (peak)
  8: 593663, // Aug avg: 637k,692k,616k,442k,703k,518k,593k,547k
  9: 540289, // Sep avg: 527k,598k,566k,524k,585k,424k,559k,537k
  10: 426580, // Oct avg: 357k,483k,430k,361k,449k,382k,489k,462k
  11: 214323, // Nov avg: 169k,219k,218k,216k,231k,179k,252k,231k
  12: 168934, // Dec avg: 140k,161k,127k,311k,149k,131k,168k,164k
};

/**
 * Monthly busyness scores (0-10 scale) derived from NPS visitor counts.
 * Computed as: (monthAvg / peakMonthAvg) × 10, where July is the peak.
 */
export const MONTHLY_BUSYNESS: Record<number, number> = {
  1: 2.1, // Jan – 125,800 visitors (quietest month)
  2: 2.3, // Feb – 138,695 visitors
  3: 3.2, // Mar – 190,354 visitors (spring begins)
  4: 4.5, // Apr – 273,771 visitors
  5: 6.7, // May – 403,614 visitors (peak season starts)
  6: 9.1, // Jun – 547,330 visitors
  7: 10.0, // Jul – 601,655 visitors (peak month)
  8: 9.9, // Aug – 593,663 visitors (near-peak)
  9: 9.0, // Sep – 540,289 visitors (fall crowds)
  10: 7.1, // Oct – 426,580 visitors (fall foliage)
  11: 3.6, // Nov – 214,323 visitors
  12: 2.8, // Dec – 168,934 visitors
};

// Day-of-week multipliers (relative busyness)
// Based on NPS qualitative data: weekends see significantly higher visitation
// with parking typically full by 8am on summer weekends; weekdays maintain
// available parking and stable traffic flow.
// Source: https://www.nps.gov/yose/planyourvisit/traffic.htm
export const DAY_OF_WEEK_MULTIPLIER: Record<number, number> = {
  0: 1.3, // Sunday (weekend departure day, still busy)
  1: 0.6, // Monday (quietest weekday)
  2: 0.6, // Tuesday
  3: 0.7, // Wednesday
  4: 0.8, // Thursday (some early arrivals)
  5: 1.1, // Friday (weekend arrivals begin)
  6: 1.4, // Saturday (busiest day of week)
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

// Zone-specific busyness multipliers (relative crowding factor, 1.0 = average)
// Calibrated from NPS Visitor Studies:
//   - Summer 2009 study: 70% of visitor groups visited Yosemite Valley
//   - Winter 2008 study: Valley 59%, Glacier Pt 55%, Wawona 43%,
//     Mariposa Grove 19%, High Sierra 11%, Tuolumne 7%, Hetch Hetchy 5%
// Sources:
//   https://www.nps.gov/yose/learn/nature/upload/Visitor-Use-Summer-2009-Study.pdf
//   https://www.nps.gov/yose/learn/nature/upload/vswinter2008.pdf
//   https://www.nps.gov/yose/planyourvisit/traffic.htm (entrance delays)
export const ZONE_POPULARITY: Record<string, number> = {
  "yosemite-valley": 1.5, // ~70% of summer visitors; South Entrance 2hr waits
  "bridalveil-fall": 1.4, // Valley entrance attraction; first stop for most visitors
  "half-dome-village": 1.4, // Major Valley hub; Mist Trail/Half Dome access
  "glacier-point": 1.3, // 55% in winter; summer road access makes it very popular
  "el-capitan": 1.1, // Valley viewpoint; popular but spread-out viewing area
  "mariposa-grove": 1.0, // ~19–30% of visitors; shuttle system manages flow
  "tuolumne-meadows": 0.8, // ~7% winter (closed), ~15–20% summer; seasonal access
  "wawona": 0.7, // ~43% in winter (base camp), ~15–20% summer
  "tioga-pass": 0.5, // Remote eastern entrance; seasonal closure Nov–May
  "hetch-hetchy": 0.4, // ~5% of visitors; most remote, limited hours
};
