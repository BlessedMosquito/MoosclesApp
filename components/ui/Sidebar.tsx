'use client';
import { useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import SidebarIcon from '../icons/SidebarIcon';
import CloseIcon from '../icons/CloseIcon';

type SidebarProps = {
  children: React.ReactNode;
};

export default function Sidebar({ children }: SidebarProps) {
  const { scale } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const SIDEBAR_WIDTH = s(240, scale);
  const TOGGLE_SIZE = s(44, scale);

  return (
    <>
      {/* toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: 'fixed',
          top: s(16, scale),
          right: s(16, scale),
          zIndex: 300,
          width: TOGGLE_SIZE,
          height: TOGGLE_SIZE,
          borderRadius: s(12, scale),
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s(5, scale),
        }}
      >
        {!isOpen ? <SidebarIcon /> : <CloseIcon />}
      </button>

      {/* overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 198,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* sidebar */}
      <nav
        onClick={(e) => {
          // zamknij tylko jeśli kliknięto przycisk wewnątrz (np. SidebarItem)
          const target = e.target as HTMLElement;
          if (target.closest('button')) {
            setIsOpen(false);
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 199,
          width: SIDEBAR_WIDTH,
          background: colors.surfaceSolid,
          borderLeft: `1px solid ${colors.borderStrong}`,
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: s(16, scale),
          transform: isOpen
            ? 'translateX(0)'
            : `translateX(${SIDEBAR_WIDTH}px)`,
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: s(24, scale),
        }}
      >
        <div style={{ height: TOGGLE_SIZE + s(16, scale) }} />
        {children}
      </nav>
    </>
  );
}
