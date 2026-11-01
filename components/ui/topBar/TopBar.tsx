'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TopBarItem = ReactNode;

type TopBarProps = {
  left?: TopBarItem;
  center?: TopBarItem;
  right?: TopBarItem;
  width?: number;
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

export default function TopBar({ left, center, right, width }: TopBarProps) {
  return (
    <nav className="top-bar" style={{ maxWidth: width }}>
      <Slot slot={left} align="left" />
      <div className="top-bar-center">{center}</div>
      <Slot slot={right} align="right" />
    </nav>
  );
}
