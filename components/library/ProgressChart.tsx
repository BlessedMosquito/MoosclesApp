'use client';

import { PointerEvent, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { colors } from '@/theme/colors';

export type ProgressPoint = {
  date: string;
  value: number;
};

type ProgressChartProps = {
  points: ProgressPoint[];
  formatValue: (value: number) => string;
  height?: number;
};

const PADDING = { top: 16, right: 12, bottom: 24, left: 40 };
const GRID_LINES = 3;

function formatShortDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function niceRange(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const pad = max === 0 ? 1 : Math.abs(max) * 0.1;
    return { min: Math.max(0, min - pad), max: max + pad };
  }
  const pad = (max - min) * 0.15;
  return { min: Math.max(0, min - pad), max: max + pad };
}

export default function ProgressChart({
  points,
  formatValue,
  height = 220,
}: ProgressChartProps) {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const selectedIndex = activeIndex ?? points.length - 1;
  const innerWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const range = niceRange(points.map((point) => point.value));

  const x = (index: number) =>
    PADDING.left +
    (points.length === 1
      ? innerWidth / 2
      : (index / (points.length - 1)) * innerWidth);
  const y = (value: number) =>
    PADDING.top +
    innerHeight -
    ((value - range.min) / (range.max - range.min)) * innerHeight;

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.value)}`
    )
    .join(' ');
  const areaPath =
    points.length > 1
      ? `${linePath} L${x(points.length - 1)},${PADDING.top + innerHeight} L${x(0)},${PADDING.top + innerHeight} Z`
      : '';

  const gridValues = Array.from(
    { length: GRID_LINES },
    (_, index) =>
      range.min + ((range.max - range.min) * index) / (GRID_LINES - 1)
  );

  function handlePointer(event: PointerEvent<SVGSVGElement>) {
    if (points.length === 0 || innerWidth === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = event.clientX - rect.left - PADDING.left;
    const ratio = Math.min(1, Math.max(0, relative / innerWidth));
    setActiveIndex(Math.round(ratio * (points.length - 1)));
  }

  const selected = points[selectedIndex];
  const dataKey = points.map((point) => point.value).join(',');

  return (
    <div ref={containerRef} className="progress-chart">
      {selected && (
        <div className="progress-chart-readout">
          <span className="progress-chart-value">
            {formatValue(selected.value)}
          </span>
          <span className="progress-chart-date">
            {formatShortDate(selected.date)}
          </span>
        </div>
      )}

      {width > 0 && (
        <svg
          width={width}
          height={height}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          className="progress-chart-svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y(value)}
                y2={y(value)}
                className="progress-chart-grid"
              />
              <text
                x={PADDING.left - 8}
                y={y(value)}
                textAnchor="end"
                dominantBaseline="middle"
                className="progress-chart-axis"
              >
                {Math.round(value)}
              </text>
            </g>
          ))}

          {areaPath && (
            <motion.path
              key={`area-${dataKey}`}
              d={areaPath}
              fill={`url(#${gradientId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          )}

          {points.length > 1 && (
            <motion.path
              key={`line-${dataKey}`}
              d={linePath}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {selected && (
            <line
              x1={x(selectedIndex)}
              x2={x(selectedIndex)}
              y1={PADDING.top}
              y2={PADDING.top + innerHeight}
              className="progress-chart-crosshair"
            />
          )}

          {points.map((point, index) => (
            <circle
              key={`${point.date}-${index}`}
              cx={x(index)}
              cy={y(point.value)}
              r={index === selectedIndex ? 5.5 : 3}
              fill={
                index === selectedIndex ? colors.accent : colors.componentsBg
              }
              stroke={colors.accent}
              strokeWidth={2}
            />
          ))}

          {points.length > 0 && (
            <>
              <text
                x={x(0)}
                y={height - 6}
                textAnchor={points.length === 1 ? 'middle' : 'start'}
                className="progress-chart-axis"
              >
                {formatShortDate(points[0].date)}
              </text>
              {points.length > 1 && (
                <text
                  x={x(points.length - 1)}
                  y={height - 6}
                  textAnchor="end"
                  className="progress-chart-axis"
                >
                  {formatShortDate(points[points.length - 1].date)}
                </text>
              )}
            </>
          )}
        </svg>
      )}
    </div>
  );
}
