'use client';

import { motion } from 'framer-motion';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type ProgressBarProps = {
  progress?: number;
  value?: number;
  min?: number;
  max?: number;
  height?: number;
  color?: string;
  trackColor?: string;
  marker?: string;
  showLabels?: boolean;
  labelLeft?: string;
  labelRight?: string;
};

export default function ProgressBar({
  progress,
  value = 0,
  min = 0,
  max = 100,
  height = 14,
  color = colors.limeGreen,
  trackColor = colors.border,
  marker,
  showLabels = false,
  labelLeft,
  labelRight,
}: ProgressBarProps) {
  const { scale } = useResponsive();

  const safeProgress = (() => {
    if (progress !== undefined) return Math.min(Math.max(progress, 0), 1);
    if (max === min) return 0;
    const clamped = Math.min(Math.max(value, min), max);
    const p = (clamped - min) / (max - min);
    return isNaN(p) ? 0 : p;
  })();

  const barHeight = s(height, scale);
  const markerOffset = s(6, scale);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          height: barHeight,
          background: trackColor,
          borderRadius: 999,
          overflow: marker ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: color,
            borderRadius: 999,
          }}
        />

        {marker && (
          <motion.div
            animate={{ left: `${safeProgress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: -markerOffset,
              transform: 'translateX(-50%)',
              fontSize: s(fontSizes.body, scale),
              lineHeight: 1,
            }}
          >
            {marker}
          </motion.div>
        )}
      </div>

      {showLabels && (labelLeft || labelRight) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: s(6, scale),
            fontSize: s(fontSizes.bodySmall, scale),
            fontWeight: 700,
            color: colors.text,
          }}
        >
          <span>{labelLeft}</span>
          <div
            style={{ textAlign: 'center', color: colors.text, fontWeight: 700 }}
          >
            {value}
          </div>
          <span>{labelRight}</span>
        </div>
      )}
    </div>
  );
}
