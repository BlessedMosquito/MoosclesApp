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
import { cn } from '@/lib/utils';

const AUTHENTICATED_PATHS = ['/dashboard', '/calendar', '/library', '/profile'];

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

  return (
    <div className="app-shell">
      <main className={cn('app-main', !hideSidebar && 'app-main-with-bar')}>
        {children}
      </main>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="route-loader"
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
            label="Dashboard"
          />

          <BottomBarItem
            activePath="/calendar"
            onClick={() => router.push('/calendar')}
            icon={<CalendarIcon size={iconSize} />}
            label="Calendar"
          />

          <BottomBarItem
            activePath="/library"
            onClick={() => router.push('/library')}
            icon={<LayersIcon size={iconSize} />}
            label="Library"
          />

          <BottomBarItem
            activePath="/profile"
            onClick={() => router.push('/profile')}
            icon={<SettingsIcon size={iconSize} />}
            label="Profile"
          />
        </BottomBar>
      )}
    </div>
  );
}
