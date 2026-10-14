'use client';
import { useResponsive } from '@/lib/useResponsive';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CalendarIcon from './icons/CalendarIcon';
import HomeIcon from './icons/HomeIcon';
import LayersIcon from './icons/LayersIcon';
import SettingsIcon from './icons/SettingsIcon';
import BottomBar from './ui/bottomBar/BottomBar';
import BottomBarItem from './ui/bottomBar/BottomBarItem';
import LoadingCircle from './ui/feedback/LoadingCircle';

const AUTHENTICATED_PATHS = ['/dashboard', '/calendar', '/profile'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();

  const [isNavigating, setIsNavigating] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    showTimer.current = setTimeout(() => setIsNavigating(true), 180);
    hideTimer.current = setTimeout(() => setIsNavigating(false), 700);

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  const iconSize = isMobile ? 16 : isTablet ? 18 : 20;

  const hideSidebar = !AUTHENTICATED_PATHS.some((p) => pathname.startsWith(p));

  const BOTTOM_BAR_HEIGHT = 90;

  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--background)',
      }}
    >
      <main
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: hideSidebar ? 0 : BOTTOM_BAR_HEIGHT,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </main>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--background)',
              pointerEvents: 'none',
            }}
          >
            <LoadingCircle size={44} />
          </motion.div>
        )}
      </AnimatePresence>

      {!hideSidebar && (
        <BottomBar>
          <BottomBarItem
            activePath="/dashboard"
            onClick={() => router.push('/dashboard')}
            icon={<HomeIcon size={iconSize} />}
          />

          <BottomBarItem
            activePath="/calendar"
            onClick={() => router.push('/calendar')}
            icon={<CalendarIcon size={iconSize} />}
          />

          <BottomBarItem
            activePath="/workouts-list"
            onClick={() => router.push('/workouts-list')}
            icon={<LayersIcon size={iconSize} />}
          />

          <BottomBarItem
            activePath="/profile"
            onClick={() => router.push('/profile')}
            icon={<SettingsIcon size={iconSize} />}
          />
        </BottomBar>
      )}
    </div>
  );
}
