'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { colors } from '@/theme/colors';

type BottomBarItemProps = {
  onClick: () => void;
  icon: React.ReactNode;
  activePath: string;
};

export default function BottomBarItem({
  onClick,
  icon,
  activePath,
}: BottomBarItemProps) {
  const pathname = usePathname();

  const isActive = pathname === activePath;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'relative',
        width: 56,
        height: 56,
        borderRadius: 999,
        border: 'none',
        background: colors.transparent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            layoutId="bottomBarIndicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,

              background: colors.componentsBg,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',

              border: `1px solid ${colors.limeGreen}`,
              boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    </motion.button>
  );
}
