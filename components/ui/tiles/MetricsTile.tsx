'use client';

import { useState } from 'react';
import Ring from '@/components/charts/ring';
import RingChart from '@/components/charts/ring-chart';
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
  useLegendItem,
} from '@/components/charts/legend';
import {
  ChartStatFlow,
  type ChartStatFlowFormat,
} from '@/components/charts/chart-stat-flow';
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from '@/components/charts/chart-center-typography';
import { useRingStable } from '@/components/charts/ring-context';
import { cn } from '@/lib/utils';
import Tile from './Tile';

type MetricItem = {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  unit: string;
  format: (value: number) => string;
};

type MetricsTileProps = {
  distance: number;
  duration: number;
  distanceMax: number;
  durationMax: number;
  tileWidth: number;
  tileHeight: number;
  chartSize: number;
  distanceUnit?: string;
  durationUnit?: string;
  title?: string;
};

const statFormat: ChartStatFlowFormat = {
  notation: 'standard',
  maximumFractionDigits: 1,
};

const distanceFormat = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
});

function formatHours(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function goalOrFallback(goal: number, value: number) {
  return goal > 0 ? goal : Math.max(value, 1);
}

const INACTIVE_RING_ALPHA = 0.4;
const TILE_PADDING = 14;

const monthFormat = new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
});

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function MetricsCenter({
  items,
  activeIndex,
}: {
  items: MetricItem[];
  activeIndex: number | null;
}) {
  const { baseInnerRadius } = useRingStable();
  const item = activeIndex === null ? null : items[activeIndex];

  if (!item) {
    return null;
  }

  const centerSize = baseInnerRadius * 2 - 16;

  return (
    <div
      className={cn(chartCenterContainerClassName, 'metrics-center')}
      style={{ width: centerSize, height: centerSize }}
    >
      {item.unit === 'h' ? (
        <>
          <span
            className={cn(
              'text-foreground tabular-nums',
              chartCenterValueClassName
            )}
          >
            {item.format(item.value)}
          </span>
          <span className={chartCenterLabelClassName}>{item.label}</span>
        </>
      ) : (
        <ChartStatFlow
          formatOptions={statFormat}
          label={item.label}
          labelClassName={chartCenterLabelClassName}
          suffix={`\u00A0${item.unit}`}
          value={item.value}
          valueClassName={chartCenterValueClassName}
        />
      )}
    </div>
  );
}

MetricsCenter.displayName = 'RingCenter';

function SelectableLegendRow({
  items,
  onSelect,
}: {
  items: MetricItem[];
  onSelect: (index: number) => void;
}) {
  const { index } = useLegendItem();

  return (
    <div onClick={() => onSelect(index)}>
      <LegendItem className="metrics-legend-item">
        <div className="metrics-legend-row">
          <LegendMarker />
          <LegendLabel className="metrics-legend-label" />
          <LegendValue showPercentage formatValue={items[index].format} />
        </div>
        <LegendProgress />
      </LegendItem>
    </div>
  );
}

export default function MetricsTile({
  distance,
  duration,
  distanceMax,
  durationMax,
  tileWidth,
  tileHeight,
  chartSize,
  distanceUnit = 'km',
  durationUnit = 'h',
  title = 'Monthly progress',
}: MetricsTileProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data: MetricItem[] = [
    {
      label: 'Distance',
      value: distance,
      maxValue: goalOrFallback(distanceMax, distance),
      color: '#0ea5e9',
      unit: distanceUnit,
      format: (value) => `${distanceFormat.format(value)} ${distanceUnit}`,
    },
    {
      label: 'Duration',
      value: duration,
      maxValue: goalOrFallback(durationMax, duration),
      color: '#a855f7',
      unit: durationUnit,
      format: formatHours,
    },
  ];

  const ringSize = Math.max(
    0,
    Math.min(chartSize, tileHeight - TILE_PADDING * 2)
  );

  function handleSelect(index: number) {
    setActiveIndex(index);
  }

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div className="metrics-content">
        <RingChart
          data={data}
          size={ringSize}
          ringGap={8}
          strokeWidth={18}
          hoveredIndex={activeIndex}
        >
          {data.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <Ring
                key={item.label}
                index={index}
                color={
                  isActive
                    ? item.color
                    : withAlpha(item.color, INACTIVE_RING_ALPHA)
                }
                showGlow={isActive}
                fadeOpacity={1}
              />
            );
          })}
          <MetricsCenter activeIndex={activeIndex} items={data} />
        </RingChart>

        <div className="metrics-side">
          <div className="metrics-heading">
            <span className="metrics-title">{title}</span>
            <span className="metrics-subtitle">
              {monthFormat.format(new Date())}
            </span>
          </div>
          <Legend items={data} hoveredIndex={activeIndex}>
            <SelectableLegendRow items={data} onSelect={handleSelect} />
          </Legend>
        </div>
      </div>
    </Tile>
  );
}
