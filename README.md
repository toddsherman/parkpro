# ParkPro - Yosemite Crowd Calendar

A trip-planning tool that predicts crowd levels at Yosemite National Park throughout the year, helping visitors find the best times to visit.

## What It Does

ParkPro displays an interactive calendar heatmap showing predicted daily crowd levels for Yosemite. Users can select a date range to see zone-by-zone breakdowns, weather forecasts, campsite availability, and park alerts.

### Key Features

- **Calendar heatmap** with color-coded daily crowd predictions (green = quiet, red = busy)
- **10 park zones** with real GPS coordinates (Yosemite Valley, Glacier Point, Tuolumne Meadows, etc.)
- **Date range selection** with detailed trip analysis including zone rankings and daily breakdown
- **Seasonal road closures** — Tioga Road and Glacier Point Road closures reduce affected zone scores and show warnings
- **Firefall detection** — Feb 10–28 crowd boost with contextual alert during Horsetail Fall viewing season
- **Wildfire smoke risk** — Jul–Oct disclosure on calendar and trip tips with AirNow link
- **Waterfall conditions** — historical USGS streamflow data shows Excellent/Good/Low/Dry ratings
- **Sunrise & sunset** — solar model computes day length for each date in the daily breakdown
- **Crowd-level trip tips** — practical advice (arrive early, bring bikes, pack food) that appears when crowds are moderate or high
- **Monthly weather** averages displayed on the calendar (high/low temps)
- **Live weather** from OpenWeatherMap for dates within the 7-day forecast window
- **Park alerts** from the NPS API (closures, warnings, hazards)
- **Campsite availability** via Recreation.gov API
- **Data transparency** with a methodology modal explaining all data sources and assumptions

## Data Sources & Methodology

All crowd predictions are grounded in real NPS data:

- **Monthly baselines** derived from NPS recreation visitor statistics (2015-2024), averaging ~4.8M annual visitors. July is the peak month (~602k visitors), January the quietest (~126k).
- **Zone popularity** calibrated from NPS entrance traffic counts (2024, 2.1M vehicles across 7 entrances) and NPS Visitor Use Studies (2008, 2009). Yosemite Valley receives ~70% of all visitor groups.
- **Day-of-week effects** based on NPS qualitative data showing parking fills by 8am on summer weekends.
- **Holiday & event boosts** for 8 major holidays plus Firefall season (Feb 10–28), which cause 1-2 hour entrance delays.
- **Seasonal road closures** — Tioga Road and Glacier Point Road historical open/close dates suppress affected zone scores during winter months.
- **Waterfall conditions** — USGS gauge 11264500 (Merced River at Happy Isles) monthly streamflow averages as a proxy for waterfall flow.
- **Sunrise & sunset** — solar declination model at 37.75°N, accurate to ±5 minutes.

Each day's score (0-10) is computed as:

```
score = monthBase × dayOfWeek × zonePopularity × holidayMultiplier × roadClosure + variance
```

Sources:
- [NPS IRMA Stats](https://irma.nps.gov/Stats/Reports/Park/YOSE)
- [NPS Yosemite Visitation](https://www.nps.gov/yose/planyourvisit/visitation.htm)
- [NPS Traffic Counts](https://irma.nps.gov/Stats/SSRSReports/Park%20Specific%20Reports/Traffic%20Counts?Park=YOSE)
- [NPS Visitor Use Studies](https://www.nps.gov/yose/learn/nature/upload/Visitor-Use-Summer-2009-Study.pdf)
- [NPS Horsetail Fall](https://www.nps.gov/yose/planyourvisit/horsetailfall.htm)
- [NPS Winter Roads](https://www.nps.gov/yose/planyourvisit/wroads.htm)
- [USGS Water Data](https://waterdata.usgs.gov/nwis/monthly?site_no=11264500)

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling
- **date-fns** for date manipulation
- **lucide-react** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

The app works fully without any API keys (falls back to realistic generated data). To enable live data, create a `.env.local` file:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=     # Map rendering
OPENWEATHERMAP_API_KEY=       # Weather forecasts
NPS_API_KEY=                  # Park alerts
RECREATION_GOV_API_KEY=       # Campsite availability
```

## Project Structure

```
src/
  app/
    page.tsx              # Main calendar heatmap page
    api/                  # Server-side API routes (weather, alerts, availability)
  components/
    Calendar/             # CalendarHeatmap, HeatmapLegend, HeatmapTooltip, YearSelector
    Header/               # Header, AlertsBanner
    RangePanel/           # Trip detail panel (summary, daily table, zone rankings)
    DataMethodology.tsx   # Data sources & methodology modal
  lib/
    constants.ts          # Park zones, NPS data, busyness scores, climate data
    context.tsx           # React Context (AppProvider)
    types.ts              # TypeScript types
    utils/
      scoring.ts          # Busyness calculation engine (holidays, road closures, Firefall)
      daylight.ts         # Solar declination model for sunrise/sunset
      yearScores.ts       # Full-year score computation
    api/                  # Client-side API functions
  __tests__/              # Jest test suite (85 tests)
```

## Testing

```bash
npm test
```

## Deploy

The easiest way to deploy is with [Vercel](https://vercel.com):

```bash
npx vercel
```

No custom domain is required - Vercel provides a free `*.vercel.app` subdomain automatically.
