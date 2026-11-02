'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TopBarItem = ReactNode;

type TopBarProps = {
  left?: TopBarItem;
  center?: TopBarItem;
  right?: TopBarItem;
  width?: number;
  variant?: 'page' | 'brand';
};

function Slot({ slot, align }: { slot: TopBarItem; align: 'left' | 'right' }) {
  if (slot === undefined || slot === null) return null;

  const hasText = typeof slot === 'string' || typeof slot === 'number';

  return (
    <div className={cn('top-bar-slot', align === 'right' && 'justify-end')}>
      {hasText ? <p>{slot}</p> : slot}
    </div>
  );
}

export default function TopBar({
  left,
  center,
  right,
  width,
  variant = 'page',
}: TopBarProps) {
  return (
    <nav
      className={cn('top-bar', variant === 'brand' && 'top-bar-brand')}
      style={{ maxWidth: width }}
    >
      <Slot slot={left} align="left" />
      <div className="top-bar-center">
        {typeof center === 'string' ? (
          <span className="top-bar-title">{center}</span>
        ) : (
          center
        )}
      </div>
      <Slot slot={right} align="right" />
    </nav>
  );
}
