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
import { s, useResponsive } from '@/lib/useResponsive';
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
  tileWidth: number;
  tileHeight: number;
  chartSize: number;
  distanceUnit?: string;
  durationUnit?: string;
};

const statFormat: ChartStatFlowFormat = {
  notation: 'standard',
  maximumFractionDigits: 0,
};

const INACTIVE_RING_ALPHA = 0.4;

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
      className={cn(
        chartCenterContainerClassName,
        'flex flex-col items-center justify-center text-center'
      )}
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
      <LegendItem className="flex flex-col gap-1.5 px-2 py-1.5">
        <div className="flex items-center gap-2">
          <LegendMarker />
          <LegendLabel className="flex-1 truncate text-sm font-medium" />
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
  tileWidth,
  tileHeight,
  chartSize,
  distanceUnit = 'km',
  durationUnit = 'h',
}: MetricsTileProps) {
  const { scale } = useResponsive();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const data: MetricItem[] = [
    {
      label: 'Distance',
      value: distance,
      maxValue: 5000,
      color: '#0ea5e9',
      unit: distanceUnit,
    },
    {
      label: 'Duration',
      value: duration,
      maxValue: 5000,
      color: '#a855f7',
      unit: durationUnit,
    },
  ];

  const padding = s(14, scale);
  const ringSize = Math.max(0, Math.min(chartSize, tileHeight - padding * 2));

  function handleSelect(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  return (
    <Tile width={tileWidth} height={tileHeight}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: s(24, scale),
          width: '100%',
          height: '100%',
          minWidth: 0,
        }}
      >
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <Legend items={data} hoveredIndex={activeIndex}>
            <SelectableLegendRow onSelect={handleSelect} />
          </Legend>
        </div>
      </div>
    </Tile>
  );
}
