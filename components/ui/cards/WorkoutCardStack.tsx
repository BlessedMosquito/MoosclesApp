'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type DeckProps = {
  backTile: ReactNode;
  frontTile: ReactNode;
};

const CARD_W = 350;
const CARD_H = 180;

export default function WorkoutCardStack({ backTile, frontTile }: DeckProps) {
  const { scale } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const maxIndex = 1;

  function goToNext() {
    setIndex((prev) => Math.min(prev + 1, maxIndex));
  }

  function goToPrev() {
    setIndex((prev) => Math.max(prev - 1, 0));
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.deltaX > 0 || e.deltaY > 0) goToNext();
      else if (e.deltaX < 0 || e.deltaY < 0) goToPrev();
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      style={{
        width: CARD_W,
        margin: '0 auto',
      }}
    >
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          width: CARD_W,
          height: CARD_H,
          borderRadius: s(18, scale),
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -CARD_W * maxIndex, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            const delta = info.offset.x;
            if (delta < -25) goToNext();
            else if (delta > 25) goToPrev();
          }}
          animate={{ x: -CARD_W * index }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          style={{
            display: 'flex',
            width: CARD_W * (maxIndex + 1),
            cursor: 'grab',
            touchAction: 'pan-y',
          }}
        >
          <div style={{ flexShrink: 0, width: CARD_W, pointerEvents: 'none' }}>
            {backTile}
          </div>
          <div style={{ flexShrink: 0, width: CARD_W, pointerEvents: 'none' }}>
            {frontTile}
          </div>
        </motion.div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: s(6, scale),
          marginTop: s(6, scale),
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: index === i ? s(16, scale) : s(6, scale),
              height: s(6, scale),
              borderRadius: 999,
              background: index === i ? colors.limeGreen : colors.border,
              transition: 'width 0.25s ease, background 0.25s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}