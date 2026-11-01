'use client';

import { useCallback, useMemo } from 'react';
import {
  getHeatmapDayLabels,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapTooltip,
  useHeatmap,
  type HeatmapColumn,
} from '@/components/charts/heatmap';
import { colors } from '@/theme/colors';
import Tile from './Tile';
import { getFormatedDate, parseDateKey, toDateKey } from '@/lib/helpers';

const WEEKDAYS = 7;
const SUMMARY_WIDTH = 92;
const CONTENT_GAP = 12;
const CHART_MARGIN = { top: 10, right: 10, bottom: 30, left: 50 };
const CELL_GAP = 4;
const INACTIVE_CELL = 'rgba(255, 255, 255, 0.08)';

const LEVEL_COLORS = [
  INACTIVE_CELL,
  colors.accent,
  colors.accent,
  colors.accent,
  colors.accent,
] as const;

const WEEKDAY_LABELS = getHeatmapDayLabels(1);

type WorkoutActivityTileProps = {
  tileWidth: number;
  tileHeight: number;
  workouts: { workout_date: string; name: string }[];
  weeklyWorkouts: number;
};

type MonthGrid = {
  columns: HeatmapColumn[];
  start: Date;
  end: Date;
  namesByDate: Record<string, string[]>;
};

function buildMonthGrid(
  workouts: { workout_date: string; name: string }[]
): MonthGrid {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const weekCount = Math.ceil((leadingDays + daysInMonth) / 7);

  const namesByDate: Record<string, string[]> = {};
  for (const workout of workouts) {
    const key = toDateKey(parseDateKey(workout.workout_date));
    const names = namesByDate[key] ?? [];
    names.push(workout.name);
    namesByDate[key] = names;
  }

  const columns = Array.from({ length: WEEKDAYS }, (_, weekday) => ({
    bin: weekday,
    bins: Array.from({ length: weekCount }, (_, week) => {
      const date = new Date(year, month, week * 7 + weekday - leadingDays + 1);
      const inMonth = date.getMonth() === month;
      const count = inMonth ? (namesByDate[toDateKey(date)]?.length ?? 0) : 0;

      return {
        bin: week,
        count,
        date,
      };
    }),
  }));

  return {
    columns,
    start: new Date(year, month, 1),
    end: new Date(year, month, daysInMonth),
    namesByDate,
  };
}

function HeatmapCalendarLabels() {
  const { data, margin, xScale, yScale, binWidth, binHeight, gap } =
    useHeatmap();
  const weekCount = data[0]?.bins.length ?? 0;

  return (
    <g className="pointer-events-none">
      {WEEKDAY_LABELS.map((label, column) => (
        <text
          key={`weekday-${column}`}
          x={xScale(column) + (binWidth - gap) / 2}
          y={-margin.top / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--chart-label)"
          fontSize={11}
        >
          {label.charAt(0)}
        </text>
      ))}
      {Array.from({ length: weekCount }, (_, week) => (
        <text
          key={`week-${week}`}
          x={-margin.left / 2}
          y={yScale(week) + gap + (binHeight - gap) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--chart-label)"
          fontSize={11}
        >
          {week + 1}
        </text>
      ))}
    </g>
  );
}

export default function WorkoutActivityTile({
  tileWidth,
  tileHeight,
  workouts,
  weeklyWorkouts,
}: WorkoutActivityTileProps) {
  const { columns, start, end, namesByDate } = useMemo(
    () => buildMonthGrid(workouts),
    [workouts]
  );

  const today = useMemo(() => new Date(), []);
  const dayMonthLabel = getFormatedDate({
    date: today,
    showYear: false,
    nameMonth: true,
  });
  const yearLabel = today.getFullYear().toString();

  const weekCount = columns[0]?.bins.length ?? 1;

  const bin = Math.max(
    Math.floor(
      Math.min(
        (tileWidth -
          SUMMARY_WIDTH -
          CONTENT_GAP -
          CHART_MARGIN.left -
          CHART_MARGIN.right) /
          WEEKDAYS,
        (tileHeight - CHART_MARGIN.top - CHART_MARGIN.bottom) / weekCount
      )
    ),
    4
  );

  const chartWidth = CHART_MARGIN.left + WEEKDAYS * bin + CHART_MARGIN.right;
  const chartHeight = CHART_MARGIN.top + weekCount * bin + CHART_MARGIN.bottom;

  const formatLabel = useCallback(
    (_count: number, date: Date) => {
      const names = namesByDate[toDateKey(date)] ?? [];
      return names.length > 0 ? names.join(', ') : 'No workouts';
    },
    [namesByDate]
  );

  return (
    <div className="activity-tile">
      <Tile width={tileWidth} height={tileHeight}>
        <div className="activity-content">
          <div className="activity-summary">
            <p className="activity-date">{dayMonthLabel}</p>
            <span className="activity-muted">{yearLabel}</span>
            <span className="activity-label">Workouts done:</span>
            <span className="activity-count">{weeklyWorkouts}</span>
          </div>

          <div style={{ width: chartWidth, height: chartHeight }}>
            <HeatmapInteractionProvider>
              <HeatmapInteractionBoundary>
                <HeatmapChart
                  data={columns}
                  gap={CELL_GAP}
                  layout="fill"
                  levelColors={LEVEL_COLORS}
                  margin={CHART_MARGIN}
                >
                  <HeatmapCells
                    cornerRadius={4}
                    displayRange={{ start, end }}
                    inactiveOpacity={0.7}
                    inactiveScale={0.92}
                  />
                  <HeatmapCalendarLabels />
                  <HeatmapTooltip formatLabel={formatLabel} />
                </HeatmapChart>
              </HeatmapInteractionBoundary>
            </HeatmapInteractionProvider>
          </div>
        </div>
      </Tile>
    </div>
  );
}
