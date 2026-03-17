"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getMonth,
  isToday,
  parseISO,
  addDays,
  isBefore,
  isAfter,
} from "date-fns";
import { scoreToColor, EMPTY_COLOR } from "@/lib/utils/colorScale";
import { getHolidayLabel } from "@/lib/utils/scoring";
import { MONTHLY_CLIMATE, SMOKE_RISK_MONTHS, FIREFALL_WINDOW } from "@/lib/constants";
import type { DateRange, YearScoreData } from "@/lib/types";
import HeatmapTooltip from "./HeatmapTooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarHeatmapProps {
  yearScores: YearScoreData;
  selectedRange: DateRange | null;
  onRangeSelect: (range: DateRange) => void;
  year: number;
}

interface CellData {
  dateStr: string; // YYYY-MM-DD
  date: Date;
  col: number; // week column index
  row: number; // 0 = Mon ... 6 = Sun
  score: number | undefined;
  isHoliday: boolean; // has a holiday/event label
  isFirefall: boolean; // within Firefall viewing window
}

type SelectionPhase = "idle" | "selecting";

const MAX_RANGE_DAYS = 14;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABEL_WIDTH = 36;
const CELL_GAP = 3;
const MIN_CELL_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return ISO day-of-week shifted to 0=Mon ... 6=Sun */
function isoDay(date: Date): number {
  // JS getDay(): 0=Sun,1=Mon...6=Sat  ->  we want 0=Mon...6=Sun
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function clampEndDate(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  const maxEnd = addDays(s, MAX_RANGE_DAYS - 1);
  if (isAfter(e, maxEnd)) return toDateStr(maxEnd);
  return end;
}

function orderRange(a: string, b: string): [string, string] {
  return isBefore(parseISO(a), parseISO(b)) ? [a, b] : [b, a];
}

function isInRange(dateStr: string, range: DateRange | null): boolean {
  if (!range) return false;
  return dateStr >= range.startDate && dateStr <= range.endDate;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarHeatmap({
  yearScores,
  selectedRange,
  onRangeSelect,
  year,
}: CalendarHeatmapProps) {
  // Selection state -----------------------------------------------------------
  const [phase, setPhase] = useState<SelectionPhase>("idle");
  const [selStart, setSelStart] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Tooltip state -------------------------------------------------------------
  const [tooltip, setTooltip] = useState<{
    date: string;
    score: number;
    position: { x: number; y: number };
  } | null>(null);

  // Container width for dynamic cell sizing -----------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Escape to cancel selection ------------------------------------------------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && phase === "selecting") {
        setPhase("idle");
        setSelStart(null);
        setHoverDate(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  // Build grid data -----------------------------------------------------------
  const { cells, totalCols, monthLabels } = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const days = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const cellList: CellData[] = [];
    let col = 0;

    for (const day of days) {
      const row = isoDay(day);
      if (cellList.length > 0 && row === 0) {
        col++;
      }

      const dateStr = toDateStr(day);
      const m = day.getMonth() + 1;
      const d = day.getDate();
      cellList.push({
        dateStr,
        date: day,
        col,
        row,
        score: yearScores.dailyAverages[dateStr],
        isHoliday: getHolidayLabel(day) !== null,
        isFirefall:
          m === FIREFALL_WINDOW.month &&
          d >= FIREFALL_WINDOW.seasonStart &&
          d <= FIREFALL_WINDOW.seasonEnd,
      });
    }

    const maxCol = cellList.length > 0 ? cellList[cellList.length - 1].col : 0;

    // Month labels: find the first Monday of each month
    const labels: { col: number; label: string; month: number }[] = [];
    const seenMonths = new Set<number>();
    for (const cell of cellList) {
      const m = getMonth(cell.date); // 0-indexed
      if (!seenMonths.has(m) && cell.row === 0) {
        seenMonths.add(m);
        labels.push({ col: cell.col, label: format(cell.date, "MMM"), month: m + 1 });
      }
    }

    return { cells: cellList, totalCols: maxCol + 1, monthLabels: labels };
  }, [year, yearScores.dailyAverages]);

  // Dynamic cell sizing -------------------------------------------------------
  const cellSize = useMemo(() => {
    if (containerWidth === 0) return MIN_CELL_SIZE; // initial render – will resize immediately
    const availableWidth = containerWidth - DAY_LABEL_WIDTH;
    const computed = Math.floor(availableWidth / totalCols) - CELL_GAP;
    return Math.max(MIN_CELL_SIZE, computed);
  }, [containerWidth, totalCols]);

  // Preview range while selecting ---------------------------------------------
  const previewRange: DateRange | null = useMemo(() => {
    if (phase !== "selecting" || !selStart || !hoverDate) return null;
    const [s, e] = orderRange(selStart, hoverDate);
    const clamped = clampEndDate(s, e);
    return { startDate: s, endDate: clamped };
  }, [phase, selStart, hoverDate]);

  // Active highlight range (either committed selection or in-progress preview)
  const highlightRange = phase === "selecting" ? previewRange : selectedRange;

  // Handlers ------------------------------------------------------------------
  const handleCellClick = useCallback(
    (dateStr: string) => {
      if (phase === "idle") {
        setPhase("selecting");
        setSelStart(dateStr);
        setHoverDate(dateStr);
      } else if (phase === "selecting" && selStart) {
        const [s, e] = orderRange(selStart, dateStr);
        const clamped = clampEndDate(s, e);
        onRangeSelect({ startDate: s, endDate: clamped });
        setPhase("idle");
        setSelStart(null);
        setHoverDate(null);
      }
    },
    [phase, selStart, onRangeSelect]
  );

  const handleCellHover = useCallback(
    (dateStr: string, score: number | undefined, e: React.MouseEvent) => {
      if (phase === "selecting") {
        setHoverDate(dateStr);
      }
      if (score !== undefined) {
        setTooltip({
          date: dateStr,
          score,
          position: { x: e.clientX, y: e.clientY },
        });
      }
    },
    [phase]
  );

  const handleCellLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Sizing --------------------------------------------------------------------
  const gridWidth = totalCols * (cellSize + CELL_GAP);
  const gridHeight = 7 * (cellSize + CELL_GAP);

  return (
    <div className="w-full" ref={containerRef}>
      {/* Scrollable wrapper (for very narrow screens) */}
      <div className="overflow-x-auto">
        <div
          style={{
            display: "inline-flex",
            minWidth: gridWidth + DAY_LABEL_WIDTH + 8,
          }}
        >
          {/* Day-of-week labels column */}
          <div
            className="flex flex-col shrink-0"
            style={{
              width: DAY_LABEL_WIDTH,
              paddingTop: cellSize + CELL_GAP + 20, // offset for month labels + temps row
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex items-center text-xs text-slate-500 dark:text-slate-400"
                style={{ height: cellSize + CELL_GAP }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="flex-1">
            {/* Month labels row (month name + temp + smoke risk) */}
            <div className="relative" style={{ height: cellSize + CELL_GAP + 20 }}>
              {monthLabels.map(({ col, label, month }) => {
                const climate = MONTHLY_CLIMATE[month];
                const isSmokeMonth = (SMOKE_RISK_MONTHS as readonly number[]).includes(month);
                return (
                  <div
                    key={label}
                    className="absolute flex flex-col"
                    style={{ left: col * (cellSize + CELL_GAP) }}
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                    {climate && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {climate.highF}°/{climate.lowF}°
                        {isSmokeMonth && (
                          <span className="text-orange-400 dark:text-orange-500 ml-0.5" title="Wildfire smoke risk season">
                            *
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cell grid (positioned absolutely within a relative container) */}
            <div
              className="relative"
              style={{ width: gridWidth, height: gridHeight }}
            >
              {cells.map((cell) => {
                const hasScore = cell.score !== undefined;
                const color = hasScore
                  ? scoreToColor(cell.score!)
                  : EMPTY_COLOR;
                const today = isToday(cell.date);
                const inHighlight = isInRange(cell.dateStr, highlightRange);
                const hasSelection = highlightRange !== null;

                return (
                  <div
                    key={cell.dateStr}
                    role="button"
                    tabIndex={0}
                    aria-label={`${format(cell.date, "MMM d, yyyy")}${hasScore ? ` — score ${cell.score!.toFixed(1)}` : ""}`}
                    className={[
                      "absolute cursor-pointer rounded-sm transition-opacity flex items-center justify-center",
                      today
                        ? "ring-2 ring-slate-800 dark:ring-slate-200"
                        : "",
                      inHighlight
                        ? "ring-2 ring-blue-500 dark:ring-blue-400"
                        : "",
                      hasSelection && !inHighlight ? "opacity-40" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      left: cell.col * (cellSize + CELL_GAP),
                      top: cell.row * (cellSize + CELL_GAP),
                      backgroundColor: color,
                    }}
                    onClick={() => handleCellClick(cell.dateStr)}
                    onMouseEnter={(e) =>
                      handleCellHover(cell.dateStr, cell.score, e)
                    }
                    onMouseMove={(e) => {
                      if (tooltip) {
                        setTooltip((prev) =>
                          prev
                            ? {
                                ...prev,
                                position: { x: e.clientX, y: e.clientY },
                              }
                            : null
                        );
                      }
                    }}
                    onMouseLeave={handleCellLeave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCellClick(cell.dateStr);
                      }
                    }}
                  >
                    {cell.isFirefall ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="black"
                        className="select-none"
                        style={{
                          width: Math.max(7, cellSize * 0.55),
                          height: Math.max(7, cellSize * 0.55),
                        }}
                      >
                        <path d="M12 23c-3.9 0-7-2.9-7-6.8 0-3.2 2.1-6.2 4.3-8.4.3-.3.8-.1.8.4 0 1.2.5 2.3 1.3 3 .1.1.3 0 .3-.2-.2-2.5.7-5.1 2.6-7 .3-.3.8-.1.8.3.3 3.1 2.5 5.5 4.2 7.6 1.1 1.3 1.7 3 1.7 4.6C21 20.1 17.9 23 12 23z" />
                      </svg>
                    ) : cell.isHoliday ? (
                      <span
                        className="leading-none text-white select-none"
                        style={{
                          fontSize: Math.max(5, cellSize * 0.35),
                          textShadow: "0 0 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        ●
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <HeatmapTooltip
          date={tooltip.date}
          score={tooltip.score}
          position={tooltip.position}
        />
      )}
    </div>
  );
}
