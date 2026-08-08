'use client';
import { useEffect, useRef, useState } from 'react';
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

  const items: string[] = itemsProp
    ? itemsProp
    : Array.from({ length: max ?? 0 }, (_, i) => String(i).padStart(2, '0'));
  const length = items.length;

  function mod(n: number, m: number) {
    return ((n % m) + m) % m;
  }

  // offset to ciągła pozycja (może być ujemna / dowolnie duża) — value = mod(round(offset), length)
  const offsetRef = useRef(value);
  const [renderOffset, setRenderOffset] = useState(value);

  // jeśli value zostanie zmienione z zewnątrz (np. reset formularza), zsynchronizuj
  const lastExternalValue = useRef(value);
  useEffect(() => {
    if (
      value !== lastExternalValue.current &&
      Math.round(mod(offsetRef.current, length)) !== value
    ) {
      offsetRef.current = value;
      setRenderOffset(value);
    }
    lastExternalValue.current = value;
  }, [value, length]);

  // drag state
  const dragging = useRef(false);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef(0);

  function commitOffset(offset: number, fireChange: boolean) {
    offsetRef.current = offset;
    setRenderOffset(offset);
    if (fireChange) {
      const idx = mod(Math.round(offset), length);
      if (idx !== lastExternalValue.current) {
        lastExternalValue.current = idx;
        onChange(idx);
      }
    }
  }

  function animateSnap(target: number) {
    cancelAnimationFrame(rafId.current);
    const start = offsetRef.current;
    const diff = target - start;
    if (Math.abs(diff) < 0.001) {
      commitOffset(target, true);
      return;
    }
    const duration = 200;
    const startTime = performance.now();

    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      commitOffset(start + diff * ease, false);
      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        commitOffset(target, true);
      }
    }
    rafId.current = requestAnimationFrame(tick);
  }

  function coast(initialVelocity: number) {
    cancelAnimationFrame(rafId.current);
    let v = initialVelocity;
    const friction = 0.92;

    function tick() {
      v *= friction;
      if (Math.abs(v) < 0.002) {
        const nearest = Math.round(offsetRef.current);
        animateSnap(nearest);
        return;
      }
      commitOffset(offsetRef.current + v, false);
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: React.PointerEvent) {
    cancelAnimationFrame(rafId.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    startY.current = e.clientY;
    startOffset.current = offsetRef.current;
    lastY.current = e.clientY;
    lastT.current = performance.now();
    velocity.current = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const now = performance.now();
    const dt = now - lastT.current;
    const dyStep = (lastY.current - e.clientY) / ITEM_H;

    if (dt > 0) {
      const raw = dyStep / dt;
      // exponential moving average dla stabilnej prędkości
      velocity.current = velocity.current * 0.4 + raw * 0.6;
    }

    lastY.current = e.clientY;
    lastT.current = now;

    const totalDy = (startY.current - e.clientY) / ITEM_H;
    commitOffset(startOffset.current + totalDy, false);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;

    // przelicz velocity na "kroki / klatkę" (60fps ~ 16.6ms)
    const v = velocity.current * 16;

    if (Math.abs(v) < 0.05) {
      // brak rzutu — od razu snap do najbliższego, precyzyjnie
      const nearest = Math.round(offsetRef.current);
      animateSnap(nearest);
    } else {
      coast(v);
    }
  }

  // wheel — jeden krok na tick, też przez offset
  const wheelLock = useRef(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      animateSnap(Math.round(offsetRef.current) + direction);
      setTimeout(() => {
        wheelLock.current = false;
      }, 130);
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [length]);

  const displayValue = mod(Math.round(renderOffset), length);
  const fraction = renderOffset - Math.round(renderOffset); // -0.5..0.5 dla płynnego highlightu pozycji

  // zbuduj okno widocznych elementów (center ± visibleRows) niezależnie od length — daje pętlę
  const halfVisible = Math.ceil(visibleRows / 2) + 1;
  const centerIndexFloat = renderOffset;
  const renderItems: { idx: number; label: string; relPos: number }[] = [];
  for (let k = -halfVisible; k <= halfVisible; k++) {
    const targetOffset = Math.round(centerIndexFloat) + k;
    const relPos = targetOffset - centerIndexFloat; // pozycja względem środka, ciągła
    const idx = mod(targetOffset, length);
    renderItems.push({ idx, label: items[idx], relPos });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(6, scale),
        background: colors.transparent,
      }}
    >
      {label && (
        <p
          style={{
            margin: 0,
            fontSize: s(13, scale),
            color: colors.text,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </p>
      )}

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'relative',
          height: ITEM_H * visibleRows,
          width: width
            ? typeof width === 'number'
              ? s(width, scale)
              : width
            : itemsProp
              ? 'auto'
              : WIDTH,
          minWidth: width ? undefined : WIDTH,
          borderRadius: s(16, scale),
          border: `1px solid ${colors.border}`,
          background: colors.componentsBg,
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'none',
          cursor: dragging.current ? 'grabbing' : 'grab',
        }}
      >
        {/* highlight */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: s(6, scale),
            right: s(6, scale),
            height: ITEM_H,
            transform: 'translateY(-50%)',
            borderRadius: s(10, scale),
            background: colors.componentsBg,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* fade top */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: ITEM_H * Math.floor(visibleRows / 2),
            background: `linear-gradient(to bottom, ${colors.componentsBg} 10%, transparent)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* fade bottom */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: ITEM_H * Math.floor(visibleRows / 2),
            background: `linear-gradient(to top, ${colors.componentsBg} 10%, transparent)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* lista — pozycjonowana przez relPos * ITEM_H względem środka */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
          }}
        >
          {renderItems.map((it, i) => {
            const centerY = (ITEM_H * visibleRows) / 2;
            const top = centerY + it.relPos * ITEM_H - ITEM_H / 2;
            const distFromCenter = Math.abs(it.relPos);
            const isActive = distFromCenter < 0.5;

            return (
              <div
                key={`${it.idx}-${i}`}
                onClick={() => {
                  if (Math.abs(it.relPos) < 0.01) return;
                  animateSnap(Math.round(renderOffset) + Math.round(it.relPos));
                }}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: ITEM_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: FONT_SIZE,
                  fontWeight: 600,
                  color: isActive ? colors.text : colors.text,
                  cursor: 'pointer',
                  paddingLeft: s(12, scale),
                  paddingRight: s(12, scale),
                  whiteSpace: 'nowrap',
                  opacity: Math.max(0, 1 - distFromCenter * 0.35),
                }}
              >
                {it.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
