'use client';

import { ReactNode } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type TopBarItem = ReactNode;

type TopBarProps = {
  left?: TopBarItem;
  center?: TopBarItem;
  right?: TopBarItem;
  width?: number;
  sticky?: boolean;
};

export default function TopBar({
  left,
  center,
  right,
  width,
  sticky = true,
}: TopBarProps) {
  const { isMobile, scale } = useResponsive();

  const baseStyle: React.CSSProperties = {
    position: sticky ? 'sticky' : 'fixed',
    top: 0,
    zIndex: 10,
    width: isMobile ? '100%' : (width ?? '100%'),
    margin: isMobile ? 0 : '0 auto',
    padding: `${s(12, scale)}px ${s(16, scale)}px`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background: colors.componentsBg,
    borderRadius: s(18, scale),
    border: `1px solid ${colors.accent}`,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(8, scale),
    boxSizing: 'border-box',
  };

  function renderSlot(slot: TopBarItem, align: 'left' | 'right') {
    if (slot === undefined || slot === null) return null;

    const hasText =
      typeof slot === 'string' || typeof slot === 'number';

    return (
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          fontSize: s(
            isMobile ? fontSizes.bodySmall : fontSizes.body,
            scale
          ),
          fontWeight: 600,
          color: colors.text,
          whiteSpace: 'nowrap',
        }}
      >
        {hasText ? <p style={{ margin: 0 }}>{slot}</p> : slot}
      </div>
    );
  }

  return (
    <nav style={baseStyle}>
      {renderSlot(left, 'left')}
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 0,
        }}
      >
        {center}
      </div>
      {renderSlot(right, 'right')}
    </nav>
  );
}