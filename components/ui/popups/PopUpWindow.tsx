// components/ui/PopupWindow.tsx
'use client';

import { useEffect, useRef } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type PopupWindowProps = {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function PopupWindow({
  onClose,
  children,
  title,
}: PopupWindowProps) {
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
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(24, scale),
      }}
    >
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: s(320, scale),
          borderRadius: s(20, scale),
          border: `1px solid ${colors.border}`,
          background: colors.componentsBg,
          boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          padding: s(16, scale),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {title && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: s(16, scale), // odstęp od children
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: s(fontSizes.body, scale),
                color: colors.text,
                textAlign: 'center',
              }}
            >
              {title}
            </p>
          </div>
        )}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(12, scale),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
