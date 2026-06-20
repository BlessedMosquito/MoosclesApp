'use client';

import { KeyboardEvent, ReactNode, useRef, useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { fontSizes } from '@/theme/typography';
import { colors } from '@/theme/colors';

type TileProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
};

type TileRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export default function Tile({
  title,
  subtitle,
  children,
  onClick,
}: TileProps) {
  const { scale } = useResponsive();
  const [isExpanding, setIsExpanding] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const [overlayRect, setOverlayRect] = useState<TileRect | null>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (!onClick || isExpanding) {
      return;
    }

    const rect = tileRef.current?.getBoundingClientRect();

    if (!rect) {
      onClick();
      return;
    }

    setOverlayRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setIsExpanding(true);
    window.requestAnimationFrame(() => {
      setIsOverlayExpanded(true);
    });
    window.setTimeout(onClick, 520);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  }

  return (
    <>
      <div
        ref={tileRef}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          minHeight: 0,
          padding: s(14, scale),
          borderRadius: s(16, scale),
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 ${s(8, scale)}px ${s(24, scale)}px ${colors.shadow}`,
          color: colors.text,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          opacity: isExpanding ? 0 : 1,
          transition: 'opacity 120ms ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(8, scale),
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: Math.max(s(fontSizes.body, scale), fontSizes.bodySmall),
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                margin: 0,
                color: colors.textSecondary,
                fontSize: Math.max(s(fontSizes.caption, scale), 11),
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: s(10, scale),
          }}
        >
          {children}
        </div>
      </div>

      {overlayRect && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: colors.background,
              opacity: isOverlayExpanded ? 1 : 0,
              zIndex: 999,
              pointerEvents: 'none',
              transition: 'opacity 220ms ease',
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: isOverlayExpanded ? 0 : overlayRect.top,
              left: isOverlayExpanded ? 0 : overlayRect.left,
              width: isOverlayExpanded ? '100vw' : overlayRect.width,
              height: isOverlayExpanded ? '100dvh' : overlayRect.height,
              borderRadius: isOverlayExpanded ? 0 : s(16, scale),
              background: isOverlayExpanded
                ? colors.background
                : colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 ${s(8, scale)}px ${s(24, scale)}px ${colors.shadow}`,
              zIndex: 1000,
              pointerEvents: 'none',
              transition:
                'top 500ms cubic-bezier(0.22, 1, 0.36, 1), left 500ms cubic-bezier(0.22, 1, 0.36, 1), width 500ms cubic-bezier(0.22, 1, 0.36, 1), height 500ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 500ms cubic-bezier(0.22, 1, 0.36, 1), background 220ms ease',
            }}
          />
        </>
      )}
    </>
  );
}
