'use client';

import { motion } from 'framer-motion';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type ProgressBarProps = {
  value: number;
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
  value,
  min = 0,
  max = 100,
  height = 14,
  color = colors.limeGreen,
  trackColor = colors.surface,
  marker,
  showLabels = false,
  labelLeft,
  labelRight,
}: ProgressBarProps) {
  const { scale } = useResponsive();

  const clamped = Math.min(Math.max(value, min), max);
  const progress = (clamped - min) / (max - min);

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
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: color,
            borderRadius: 999,
          }}
        />

        {/* Marker */}
        {marker && (
          <motion.div
            animate={{
              left: `${progress * 100}%`,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
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

      {/* Labels */}
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
          {/* Current value */}
          <div
            style={{
              textAlign: 'center',
              color: colors.text,
              fontWeight: 700,
              fontSize: s(fontSizes.bodySmall, scale),
            }}
          >
            {value} kg
          </div>
          <span>{labelRight}</span>
        </div>
      )}
    </div>
  );
}
