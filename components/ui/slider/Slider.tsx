'use client';

import { type JSX, useRef, useState } from 'react';
import { colors } from '@/theme/colors';
import { s, useResponsive } from '@/lib/useResponsive';

type SliderProps = {
  label?: string | JSX.Element;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  scale?: number;
  disabled?: boolean;
  width?: number | string;
};

export default function Slider({
  label,
  value,
  min = 0,
  max,
  onChange,
  scale,
  disabled,
  width = '100%',
}: SliderProps) {
  const { scale: resScale } = useResponsive();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const range = max - min;
  const sections =
    scale && scale > 0
      ? scale
      : Number.isInteger(range) && range > 0 && range <= 20
        ? range
        : 0;
  const step = sections > 0 ? range / sections : range;

  const values = Array.from({ length: sections + 1 }, (_, i) => min + i * step);
  const index = sections > 0 ? Math.round((value - min) / step) : 0;
  const ratio =
    sections > 0 ? index / sections : range === 0 ? 0 : (value - min) / range;

  const THUMB = s(26, resScale);
  const TRACK_H = s(14, resScale);
  const PAD = THUMB / 2;

  function updateFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xRaw = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    let next: number;

    if (sections > 0) {
      const idx = Math.round((xRaw / rect.width) * sections);
      next = Math.min(Math.max(min + idx * step, min), max);
      if (Number.isInteger(step)) next = Math.round(next);
    } else {
      next = min + (xRaw / rect.width) * range;
    }

    onChange(next);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    updateFromClientX(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || disabled) return;
    updateFromClientX(e.clientX);
  }

  function handlePointerUp() {
    draggingRef.current = false;
    setIsDragging(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(10, resScale),
        width,
      }}
    >
      {label && (
        <span
          style={{
            color: colors.text,
            fontSize: s(14, resScale),
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      )}

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          width: '100%',
          height: THUMB,
          cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* tor tła */}
        <div
          style={{
            position: 'absolute',
            left: PAD,
            right: PAD,
            top: '50%',
            transform: 'translateY(-50%)',
            height: TRACK_H,
            borderRadius: 999,
            background: colors.componentsBg,
            border: `1px solid ${colors.border}`,
          }}
        />

        {/* wypełnienie */}
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: '50%',
            transform: 'translateY(-50%)',
            width: `calc(${ratio * 100}% - ${PAD}px)`,
            minWidth: 0,
            height: TRACK_H,
            borderRadius: 999,
            background: colors.limeGreen,
            transition: isDragging ? 'none' : 'width 0.1s ease',
          }}
        />

        {/* kciuk — wypełniony */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${PAD}px + (100% - ${PAD * 2}px) * ${ratio})`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: THUMB,
            height: THUMB,
            borderRadius: '50%',
            background: colors.limeGreen,
            border: `3px solid grey`,
            boxShadow: `0 2px 8px black`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* liczby podziałki pod slajderem */}
      {sections > 0 && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: s(16, resScale),
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          {values.map((number, i) => {
            const pos = (i / sections) * 100;
            return (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `calc(${PAD}px + (100% - ${PAD * 2}px) * ${pos / 100})`,
                  transform: 'translateX(-50%)',
                  fontSize: s(11, resScale),
                  color: colors.text,
                }}
              >
                {Number.isInteger(number) ? number : number.toFixed(1)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
