'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { colors } from '@/theme/colors';

type SuccessAnimationProps = {
  message?: string;
  onDone?: () => void;
  doneDelay?: number;
};

const SIZE = 80;
const STROKE = 5;
const RADIUS = (SIZE - STROKE * 2) / 2;
const DRAW_DURATION_MS = 950;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function SuccessAnimation({
  message = 'Saved!',
  onDone,
  doneDelay = 2000,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const hideTimer = setTimeout(
      () => setIsVisible(false),
      DRAW_DURATION_MS + doneDelay
    );
    return () => clearTimeout(hideTimer);
  }, [doneDelay]);

  return (
    <AnimatePresence onExitComplete={() => onDoneRef.current?.()}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="success-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="success-ring"
          >
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="-rotate-90"
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={colors.border}
                strokeWidth={STROKE}
              />
              <motion.circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={colors.accent}
                strokeWidth={STROKE}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              />
            </svg>

            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="absolute top-0 left-0"
            >
              <motion.polyline
                points={`${SIZE * 0.3},${SIZE * 0.52} ${SIZE * 0.45},${SIZE * 0.66} ${SIZE * 0.71},${SIZE * 0.38}`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 0.4, ease: EASE, delay: 0.55 },
                  opacity: { duration: 0.01, delay: 0.55 },
                }}
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.7 }}
            className="success-message"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
