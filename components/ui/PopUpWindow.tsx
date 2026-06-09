// components/ui/PopupWindow.tsx
'use client';

import { useEffect, useRef } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';

type PopupWindowProps = {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function PopupWindow({ onClose, children, title }: PopupWindowProps) {
  const { scale } = useResponsive();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
<div
  onClick={onClose}
  style={{
    position: 'fixed',
    inset: 0,
    zIndex: 99,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(24, scale),
  }}
>
  <div
    ref={popupRef}
    onClick={e => e.stopPropagation()}
    style={{
      width: '100%',
      maxWidth: s(320, scale),
      borderRadius: s(20, scale),
      border: `1px solid ${colors.border}`,
      background: colors.background,
      boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
      padding: s(16, scale),
      display: 'flex',
      flexDirection: 'column',
      gap: s(8, scale),
    }}
  >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: s(4, scale),
        }}>
          {title && (
            <p style={{
              margin: 0,
              fontWeight: 700,
              fontSize: s(14, scale),
              color: colors.text,
            }}>
              {title}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'none',
              color: colors.textMuted,
              fontSize: s(20, scale),
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}