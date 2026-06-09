'use client';
import { useEffect, useRef } from 'react';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type WheelPickerProps = {
  max?: number;
  items?: string[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
  visibleRows?: number;
  width?: number | string;
};

export default function WheelPicker({
  max,
  items: itemsProp,
  value,
  onChange,
  label,
  visibleRows = 5,
  width,
}: WheelPickerProps) {
  const { scale, isMobile, isTablet } = useResponsive();
  const ITEM_H = isMobile ? 35 : isTablet ? 44 : 48;
  const FONT_SIZE = isMobile ? 20 : isTablet ? 22 : 26;
  const WIDTH = isMobile ? 72 : isTablet ? 82 : 106;
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const touchLock = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const items: string[] = itemsProp
    ? itemsProp
    : Array.from({ length: max ?? 0 }, (_, i) => String(i).padStart(2, '0'));

  function clamp(v: number) {
    return Math.max(0, Math.min(items.length - 1, v));
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      onChange(clamp(valueRef.current + direction));
      setTimeout(() => { wheelLock.current = false; }, 120);
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [items.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
      touchLock.current = false;
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (touchLock.current || touchStartY.current === null) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(dy) < ITEM_H / 2) return;
      touchLock.current = true;
      const direction = dy > 0 ? 1 : -1;
      onChange(clamp(valueRef.current + direction));
      touchStartY.current = e.touches[0].clientY;
      setTimeout(() => { touchLock.current = false; }, 120);
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [items.length]);

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

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: ITEM_H * visibleRows,
          width: width
          ? (typeof width === 'number' ? s(width, scale) : width)
          : itemsProp ? 'auto' : WIDTH,
          minWidth: width ? undefined : WIDTH,
          borderRadius: s(16, scale),
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
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

        {/* lista */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${(Math.floor(visibleRows / 2) - value) * ITEM_H}px)`,
          transition: 'transform 150ms ease-out',
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onChange(index)}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FONT_SIZE,
                fontWeight: 600,
                color: index === value ? colors.text : colors.textMuted,
                cursor: 'pointer',
                paddingLeft: s(12, scale),
                paddingRight: s(12, scale),
                whiteSpace: 'nowrap',
                transition: 'color 150ms ease',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}