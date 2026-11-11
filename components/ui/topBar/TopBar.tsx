'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
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
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scroller = navRef.current?.closest('.app-main');
    if (!scroller) return;
    const update = () => setIsScrolled(scroller.scrollTop > 4);
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, []);

  return (
    <nav
      ref={navRef}
      className={cn(
        'top-bar',
        variant === 'brand' && 'top-bar-brand',
        isScrolled && 'top-bar-scrolled'
      )}
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
