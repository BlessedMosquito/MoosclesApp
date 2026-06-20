'use client';

import { useEffect, useState } from 'react';
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
    <div
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
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes draw-circle {
          from { stroke-dashoffset: ${CIRCUMFERENCE}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fade-scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            transform: 'rotate(-90deg)',
            animation:
              phase === 'spinning' ? 'spin 1s linear infinite' : undefined,
            transition: 'animation 0.3s',
          }}
        >
          {/* track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={colors.border}
            strokeWidth={STROKE}
          />

          {/* progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={phase === 'success' ? colors.success : colors.text}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={phase === 'spinning' ? CIRCUMFERENCE * 0.75 : 0}
            style={{
              transition:
                phase === 'success'
                  ? 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease'
                  : undefined,
              animation:
                phase === 'success'
                  ? 'draw-circle 0.5s ease-out forwards'
                  : undefined,
            }}
          />
        </svg>

        {/* check */}
        {phase === 'success' && (
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              animation: 'fade-scale-in 0.3s ease-out forwards',
            }}
          >
            <polyline
              points={`${SIZE * 0.28},${SIZE * 0.52} ${SIZE * 0.44},${SIZE * 0.68} ${SIZE * 0.72},${SIZE * 0.36}`}
              fill="none"
              stroke={colors.success}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={60}
              strokeDashoffset={60}
              style={{
                animation: 'draw-check 0.35s ease-out 0.1s forwards',
              }}
            />
          </svg>
        )}
      </div>

      {phase === 'success' && (
        <p
          style={{
            margin: 0,
            color: colors.text,
            fontSize: s(16, scale),
            fontWeight: 600,
            animation: 'fade-in 0.4s ease-out forwards',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
