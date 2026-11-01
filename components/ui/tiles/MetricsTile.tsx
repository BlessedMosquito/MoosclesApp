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
};

const statFormat: ChartStatFlowFormat = {
  notation: 'standard',
  maximumFractionDigits: 1,
};

function goalOrFallback(goal: number, value: number) {
  return goal > 0 ? goal : Math.max(value, 1);
}

const INACTIVE_RING_ALPHA = 0.4;
const TILE_PADDING = 14;

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
      <ChartStatFlow
        formatOptions={statFormat}
        label={item.label}
        labelClassName={chartCenterLabelClassName}
        suffix={`\u00A0${item.unit}`}
        value={item.value}
        valueClassName={chartCenterValueClassName}
      />
    </div>
  );
}

MetricsCenter.displayName = 'RingCenter';

function SelectableLegendRow({
  onSelect,
}: {
  onSelect: (index: number) => void;
}) {
  const { index } = useLegendItem();

  return (
    <div onClick={() => onSelect(index)}>
      <LegendItem className="metrics-legend-item">
        <div className="metrics-legend-row">
          <LegendMarker />
          <LegendLabel className="metrics-legend-label" />
          <LegendValue showPercentage />
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
}: MetricsTileProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const data: MetricItem[] = [
    {
      label: 'Distance',
      value: distance,
      maxValue: goalOrFallback(distanceMax, distance),
      color: '#0ea5e9',
      unit: distanceUnit,
    },
    {
      label: 'Duration',
      value: duration,
      maxValue: goalOrFallback(durationMax, duration),
      color: '#a855f7',
      unit: durationUnit,
    },
  ];

  const ringSize = Math.max(
    0,
    Math.min(chartSize, tileHeight - TILE_PADDING * 2)
  );

  function handleSelect(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
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

        <div className="min-w-0 flex-1">
          <Legend items={data} hoveredIndex={activeIndex}>
            <SelectableLegendRow onSelect={handleSelect} />
          </Legend>
        </div>
      </div>
    </Tile>
  );
}
