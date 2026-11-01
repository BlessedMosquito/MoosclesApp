'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ProgressBarProps = {
  progress?: number;
  value?: number;
  min?: number;
  max?: number;
  marker?: string;
  showLabels?: boolean;
  labelLeft?: string;
  labelRight?: string;
};

const fillTransition = { duration: 0.8, ease: 'easeOut' } as const;

export default function ProgressBar({
  progress,
  value = 0,
  min = 0,
  max = 100,
  marker,
  showLabels = false,
  labelLeft,
  labelRight,
}: ProgressBarProps) {
  const safeProgress = (() => {
    if (progress !== undefined) return Math.min(Math.max(progress, 0), 1);
    if (max === min) return 0;
    const clamped = Math.min(Math.max(value, min), max);
    const p = (clamped - min) / (max - min);
    return isNaN(p) ? 0 : p;
  })();

  return (
    <div className="w-full">
      <div className={cn('progress-track', marker && 'overflow-visible')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress * 100}%` }}
          transition={fillTransition}
          className="progress-fill"
        />

        {marker && (
          <motion.div
            animate={{ left: `${safeProgress * 100}%` }}
            transition={fillTransition}
            className="progress-marker"
          >
            {marker}
          </motion.div>
        )}
      </div>

      {showLabels && (labelLeft || labelRight) && (
        <div className="progress-labels">
          <span>{labelLeft}</span>
          <span>{value}</span>
          <span>{labelRight}</span>
        </div>
      )}
    </div>
  );
}
