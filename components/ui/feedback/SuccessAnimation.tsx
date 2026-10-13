'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';

type SuccessAnimationProps = {
  message?: string;
  onDone?: () => void;
  doneDelay?: number;
};

export default function SuccessAnimation({
  message = 'Saved!',
  onDone,
  doneDelay = 2000,
}: SuccessAnimationProps) {
  const { scale } = useResponsive();
  const [phase, setPhase] = useState<'spinning' | 'success'>('spinning');

  useEffect(() => {
    const spinTimer = setTimeout(() => setPhase('success'), 800);
    return () => clearTimeout(spinTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'success' || !onDone) return;
    const doneTimer = setTimeout(onDone, doneDelay);
    return () => clearTimeout(doneTimer);
  }, [phase, onDone, doneDelay]);

  const SIZE = s(80, scale);
  const STROKE = 5;
  const RADIUS = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s(16, scale),
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        style={{ position: 'relative', width: SIZE, height: SIZE }}
        animate={{ rotate: phase === 'spinning' ? 360 : 0 }}
        transition={
          phase === 'spinning'
            ? { rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }
            : { duration: 0.3, ease: 'easeOut' }
        }
      >
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}
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
            stroke={phase === 'success' ? colors.accent : colors.text}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE * 0.75 }}
            animate={{
              strokeDashoffset: phase === 'spinning' ? CIRCUMFERENCE * 0.75 : 0,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        <AnimatePresence>
          {phase === 'success' && (
            <motion.svg
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              <motion.polyline
                points={`${SIZE * 0.28},${SIZE * 0.52} ${SIZE * 0.44},${SIZE * 0.68} ${SIZE * 0.72},${SIZE * 0.36}`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={60}
                initial={{ strokeDashoffset: 60 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {phase === 'success' && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              margin: 0,
              color: colors.text,
              fontSize: s(16, scale),
              fontWeight: 600,
            }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}