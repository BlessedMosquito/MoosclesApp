'use client';

import { motion } from 'motion/react';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type CircularProgressProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  displayValue?: string;
  rangeLabel?: string;
  size?: number;
  strokeWidth?: number;
};

export default function CircularProgress({
  title,
  value,
  min,
  max,
  displayValue,
  size,
  strokeWidth,
}: CircularProgressProps) {
  const { scale, isMobile, isTablet } = useResponsive();

  const defaultSize = isMobile ? 100 : isTablet ? 180 : 220;

  const finalSize = s(size ?? defaultSize, scale);
  const finalStrokeWidth = s(strokeWidth ?? 6, scale);

  const cx = finalSize / 2;
  const cy = finalSize / 2;
  const radius = finalSize * 0.42;

  const safeRange = max - min === 0 ? 1 : max - min;
  const progress = Math.min(Math.max((value - min) / safeRange, 0), 1);

  const GAP_DEG = 40;
  const startAngle = 90 + GAP_DEG / 2;
  const endAngle = 90 - GAP_DEG / 2;

  function pointOnCircle(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  const start = pointOnCircle(startAngle, radius);
  const end = pointOnCircle(endAngle, radius);

  const arc = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  const minPoint = pointOnCircle(startAngle, radius + finalStrokeWidth * 2);
  const maxPoint = pointOnCircle(endAngle, radius + finalStrokeWidth * 2);

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    color: colors.text,
    fontSize: s(12, scale),
    fontWeight: 600,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(6, scale),
        width: '100%',
      }}
    >
      {/* TITLE */}
      <p
        style={{
          margin: 0,
          color: colors.text,
          fontWeight: 700,
        }}
      >
        {title}
      </p>

      {/* ARC */}
      <div
        style={{
          position: 'relative',
          width: finalSize,
          height: finalSize,
        }}
      >
        <svg width={finalSize} height={finalSize}>
          {/* background arc */}
          <path
            d={arc}
            fill="none"
            stroke={colors.accentDark}
            strokeWidth={finalStrokeWidth}
            strokeLinecap="round"
            pathLength={1}
          />

          {/* progress arc */}
          <motion.path
            d={arc}
            fill="none"
            stroke={colors.accent}
            strokeWidth={finalStrokeWidth}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 1 - progress }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
          />
        </svg>

        {/* MIN on left end */}
        <span
          style={{
            ...labelStyle,
            left: minPoint.x - s(4, scale),
            top: minPoint.y - s(10, scale),
            textAlign: 'right',
          }}
        >
          {min}
        </span>

        {/* MAX on right end */}
        <span
          style={{
            ...labelStyle,
            left: maxPoint.x + s(4, scale),
            top: maxPoint.y - s(10, scale),
            textAlign: 'left',
          }}
        >
          {max}
        </span>

        {/* CENTER VALUE */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: s(isMobile ? 14 : 34, scale),
              color: colors.text,
              fontWeight: 700,
            }}
          >
            {displayValue ?? value}
          </span>
        </div>
      </div>
    </div>
  );
}
