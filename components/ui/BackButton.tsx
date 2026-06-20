'use client';

import { KeyboardEvent, useRef, useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type ButtonRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type BackButtonProps = {
  onClick: () => void;
  title?: string;
};

export default function BackButton({
  onClick,
  title = 'Back',
}: BackButtonProps) {
  const { scale } = useResponsive();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const [overlayRect, setOverlayRect] = useState<ButtonRect | null>(null);

  function handleOpen() {
    if (isExpanding) {
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

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

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: s(14, scale),
          background: colors.surface,
          color: colors.text,
          padding: `${s(10, scale)}px ${s(14, scale)}px`,
          fontSize: s(fontSizes.bodySmall, scale),
          cursor: 'pointer',
          opacity: isExpanding ? 0 : 1,
          transition: 'opacity 120ms ease',
        }}
      >
        {title}
      </button>

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
              borderRadius: isOverlayExpanded ? 0 : s(14, scale),
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
