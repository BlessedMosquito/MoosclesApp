'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  BAR_SPRING,
  ITEM_ACTIVE_WIDTH,
  ITEM_COLLAPSED_WIDTH,
  useBottomBar,
} from './BottomBar';

type BottomBarItemProps = {
  onClick: () => void;
  icon: React.ReactNode;
  activePath: string;
  label: string;
};

const labelEnter = {
  duration: 0.28,
  delay: 0.1,
  ease: [0.22, 1, 0.36, 1],
} as const;

const labelExit = { duration: 0.12, ease: 'easeOut' } as const;

export default function BottomBarItem({
  onClick,
  icon,
  activePath,
  label,
}: BottomBarItemProps) {
  const pathname = usePathname();
  const setActiveEl = useBottomBar();
  const ref = useRef<HTMLButtonElement>(null);

  const isActive =
    pathname === activePath || pathname.startsWith(`${activePath}/`);

  useLayoutEffect(() => {
    if (!isActive || !setActiveEl) return;
    setActiveEl(ref.current);
    return () => setActiveEl(null);
  }, [isActive, setActiveEl]);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      initial={false}
      animate={{ width: isActive ? ITEM_ACTIVE_WIDTH : ITEM_COLLAPSED_WIDTH }}
      whileTap={{ scale: 0.92 }}
      transition={BAR_SPRING}
      className={cn('bottom-bar-item', isActive && 'bottom-bar-item-active')}
    >
      <span className="bottom-bar-icon">{icon}</span>

      <motion.span
        aria-hidden
        initial={false}
        animate={
          isActive
            ? { opacity: 1, x: 0, filter: 'blur(0px)' }
            : { opacity: 0, x: -8, filter: 'blur(4px)' }
        }
        transition={isActive ? labelEnter : labelExit}
        className="bottom-bar-label"
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
