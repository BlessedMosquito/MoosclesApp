'use client';
import { useResponsive } from '@/lib/useResponsive';
import { usePathname, useRouter } from 'next/navigation';
import AddIcon from './icons/AddIcon';
import CalendarIcon from './icons/CalendarIcon';
import HomeIcon from './icons/HomeIcon';
import BottomBar from './ui/bottomBar/BottomBar';
import BottomBarItem from './ui/bottomBar/BottomBarItem';
import ProfileIcon from './icons/ProfileIcon';

const AUTHENTICATED_PATHS = [
  '/dashboard',
  '/calendar',
  '/add-workout',
  '/add-workout-data',
  '/profile',
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isMobile, isTablet } = useResponsive();

  const iconSize = isMobile ? 16 : isTablet ? 18 : 20;

  const hideSidebar = !AUTHENTICATED_PATHS.some((p) =>
    pathname.startsWith(p)
  );

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
            activePath="/add-workout"
            onClick={() => router.push('/add-workout')}
            icon={<AddIcon size={iconSize} />}
          />

          <BottomBarItem
            activePath="/profile"
            onClick={() => router.push('/profile')}
            icon={<ProfileIcon size={iconSize} />}
          />
        </BottomBar>
      )}
    </div>
  );
}
