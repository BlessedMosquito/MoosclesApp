'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { useBottomBar } from './BottomBar';

type BottomBarItemProps = {
  onClick: () => void;
  icon: React.ReactNode;
  activePath: string;
  label: string;
};

const COLLAPSED_WIDTH = 48;
const ACTIVE_WIDTH = 132;

const spring = { type: 'spring', stiffness: 500, damping: 40 } as const;

export default function BottomBarItem({
  onClick,
  icon,
  activePath,
  label,
}: BottomBarItemProps) {
  const pathname = usePathname();
  const setActiveEl = useBottomBar();
  const ref = useRef<HTMLButtonElement>(null);

  const isActive = pathname === activePath;

  useLayoutEffect(() => {
    if (isActive && setActiveEl) {
      setActiveEl(ref.current);
    }
  }, [isActive, setActiveEl]);

  return (
    <motion.button
      ref={ref}
      layout
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={spring}
      style={{
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 48,
        width: isActive ? ACTIVE_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        padding: '0 14px',
        borderRadius: 24,
        border: 'none',
        background: colors.transparent,
        color: isActive ? colors.text : colors.textMuted,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <motion.span
        layout
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </motion.span>

      <motion.span
        layout
        animate={{
          clipPath: isActive ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        style={{
          display: 'inline-block',
          marginLeft: 8,
          whiteSpace: 'nowrap',
          fontSize: fontSizes.bodySmall,
          fontWeight: 600,
        }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
