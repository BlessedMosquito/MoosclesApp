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
import { s, useResponsive } from '@/lib/useResponsive';
import Tile from './Tile';
import { getFormatedDate } from '@/lib/helpers';

const WEEKDAYS = 7;
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

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

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
    const key = toDateKey(new Date(workout.workout_date));
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
    <g style={{ pointerEvents: 'none' }}>
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
  const { scale } = useResponsive();
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

  const margin = useMemo(
    () => ({
      top: s(10, scale),
      right: s(10, scale),
      bottom: s(30, scale),
      left: s(50, scale),
    }),
    [scale]
  );

  const labelWidth = s(92, scale);
  const tileGap = s(12, scale);
  const weekCount = columns[0]?.bins.length ?? 1;

  const bin = Math.max(
    Math.floor(
      Math.min(
        (tileWidth - labelWidth - tileGap - margin.left - margin.right) /
          WEEKDAYS,
        (tileHeight - margin.top - margin.bottom) / weekCount
      )
    ),
    4
  );

  const chartWidth = margin.left + WEEKDAYS * bin + margin.right;
  const chartHeight = margin.top + weekCount * bin + margin.bottom;

  const formatLabel = useCallback(
    (_count: number, date: Date) => {
      const names = namesByDate[toDateKey(date)] ?? [];
      return names.length > 0 ? names.join(', ') : 'No workouts';
    },
    [namesByDate]
  );

  return (
    <div
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <Tile width={tileWidth} height={tileHeight}>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: tileGap,
            minHeight: 0,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(6, scale),
              width: labelWidth,
              flexShrink: 0,
            }}
          >
            <p
              style={{
                color: colors.text,
                fontSize: s(16, scale),
                fontWeight: 700,
              }}
            >
              {dayMonthLabel}
            </p>
            <span
              style={{
                color: colors.textMuted,
                fontSize: s(12, scale),
                lineHeight: 1.3,
              }}
            >
              {yearLabel}
            </span>
            <span
              style={{
                color: colors.textMuted,
                fontSize: s(11, scale),
                lineHeight: 1.3,
                marginTop: s(5, scale),
              }}
            >
              Workouts done:
            </span>
            <span
              style={{
                color: colors.text,
                fontSize: s(22, scale),
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {weeklyWorkouts}
            </span>
          </div>

          <div
            style={{
              width: chartWidth,
              height: chartHeight,
            }}
          >
            <HeatmapInteractionProvider>
              <HeatmapInteractionBoundary>
                <HeatmapChart
                  data={columns}
                  gap={CELL_GAP}
                  layout="fill"
                  levelColors={LEVEL_COLORS}
                  margin={margin}
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
