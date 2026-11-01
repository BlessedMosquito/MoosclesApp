'use client';

import { type CSSProperties, type JSX, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type SliderProps = {
  label?: string | JSX.Element;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  scale?: number;
  disabled?: boolean;
  blockSlider?: boolean;
};

export default function Slider({
  label,
  value,
  min = 0,
  max,
  onChange,
  scale,
  disabled,
  blockSlider = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const isBlocked = disabled || blockSlider;

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

  function updateFromClientX(clientX: number) {
    if (blockSlider) return;
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
    if (isBlocked) return;
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
    <div className="slider">
      {label && <span className="slider-label">{label}</span>}

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          'slider-track',
          isBlocked
            ? 'cursor-not-allowed'
            : isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab',
          disabled && 'opacity-50'
        )}
        style={{ '--ratio': ratio } as CSSProperties}
      >
        <div className="slider-rail" />
        <div className={cn('slider-fill', isDragging && 'transition-none')} />
        <div className="slider-thumb" />
      </div>

      {sections > 0 && (
        <div className="slider-ticks">
          {values.map((number, i) => (
            <span
              key={number}
              className="slider-tick"
              style={{ '--ratio': i / sections } as CSSProperties}
            >
              {Number.isInteger(number) ? number : number.toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
