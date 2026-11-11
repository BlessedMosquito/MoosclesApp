'use client';
import { useResponsive } from '@/lib/useResponsive';
import { MotionConfig } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import CalendarIcon from './icons/CalendarIcon';
import HomeIcon from './icons/HomeIcon';
import LayersIcon from './icons/LayersIcon';
import SettingsIcon from './icons/SettingsIcon';
import BottomBar from './ui/bottomBar/BottomBar';
import BottomBarItem from './ui/bottomBar/BottomBarItem';
import { cn } from '@/lib/utils';

const AUTHENTICATED_PATHS = ['/dashboard', '/calendar', '/library', '/profile'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();

  const iconSize = isMobile ? 16 : isTablet ? 18 : 20;

  const hideSidebar = !AUTHENTICATED_PATHS.some((p) => pathname.startsWith(p));

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <main className={cn('app-main', !hideSidebar && 'app-main-with-bar')}>
          {children}
        </main>

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
    </MotionConfig>
  );
}
