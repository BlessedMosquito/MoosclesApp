'use client';
import { useEffect, useRef } from 'react';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type WheelPickerProps = {
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  visibleRows?: number;
};

export default function WheelPicker({
  max,
  value,
  onChange,
  label,
  visibleRows = 5,
}: WheelPickerProps) {
  const { scale, isMobile, isTablet } = useResponsive();
  const ITEM_H = isMobile ? 35 : isTablet ? 44 : 48;
  const FONT_SIZE = isMobile ? 20 : isTablet ? 22 : 26;
  const WIDTH = isMobile ? 72 : isTablet ? 82 : 106;
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: max }, (_, i) => i);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = value * ITEM_H;
  }, []);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const index = Math.round(container.scrollTop / ITEM_H);
    if (index >= 0 && index < max) {
      onChange(index);
    }
  }

  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(6, scale) }}>
        {label && (
          <p style={{
            margin: 0,
            fontSize: s(13, scale),
            color: colors.textSecondary,
            letterSpacing: '0.02em',
          }}>
            {label}
          </p>
        )}
    
      <div style={{
        position: 'relative',
        height: ITEM_H * visibleRows,
        width: WIDTH,
        borderRadius: s(16, scale),
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        overflow: 'hidden',
      }}>
        {/* highlight */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '50%',
          left: s(6, scale), right: s(6, scale),
          height: ITEM_H,
          transform: 'translateY(-50%)',
          borderRadius: s(10, scale),
          background: colors.glassHover,
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* fade top */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: ITEM_H * Math.floor(visibleRows / 2),
          background: `linear-gradient(to bottom, ${colors.surface} 10%, transparent)`,
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* fade bottom */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: ITEM_H * Math.floor(visibleRows / 2),
          background: `linear-gradient(to top, ${colors.surface} 10%, transparent)`,
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: `${ITEM_H * Math.floor(visibleRows / 2)}px 0`,
            boxSizing: 'border-box',
          }}
        >
          {items.map((item) => (
            <div
              key={item}
              onClick={() => {
                scrollRef.current?.scrollTo({ top: item * ITEM_H, behavior: 'smooth' });
              }}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                fontSize: FONT_SIZE,
                fontWeight: 600,
                color: item === value ? colors.text : colors.textMuted,
                cursor: 'pointer',
              }}
            >
              {String(item).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}