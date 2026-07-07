'use client';

import { motion } from 'framer-motion';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type CircularProgressProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
};

export default function CircularProgress({
  title,
  value,
  min,
  max,
  unit = '',
  size,
  strokeWidth,
}: CircularProgressProps) {
  const { scale, isMobile, isTablet } = useResponsive();

  const defaultSize = isMobile ? 90 : isTablet ? 180 : 220;

  const finalSize = s(size ?? defaultSize, scale);
  const finalStrokeWidth = s(strokeWidth ?? 10, scale);

  const radius = (finalSize - finalStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeRange = max - min === 0 ? 1 : max - min;
  const progress = Math.min(Math.max((value - min) / safeRange, 0), 1);

  const dashOffset = circumference * (1 - progress);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(10, scale),
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

      {/* CIRCLE */}
      <div
        style={{
          position: 'relative',
          width: finalSize,
          height: finalSize,
        }}
      >
        <svg
          width={finalSize}
          height={finalSize}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* background ring */}
          <circle
            cx={finalSize / 2}
            cy={finalSize / 2}
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth={finalStrokeWidth}
          />

          {/* progress ring */}
          <motion.circle
            cx={finalSize / 2}
            cy={finalSize / 2}
            r={radius}
            fill="none"
            stroke="#30D158"
            strokeWidth={finalStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
          />
        </svg>

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
            {value}
          </span>

          <span style={{ color: colors.text }}>{unit}</span>
        </div>
      </div>

      {/* RANGE BELOW */}
      <span
        style={{
          color: colors.textMuted,
          fontSize: s(12, scale),
        }}
      >
        {min} – {max} {unit}
      </span>
    </div>
  );
}
