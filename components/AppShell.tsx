'use client';
import { createClient } from '@/lib/supabase/client';
import { useResponsive } from '@/lib/useResponsive';
import { usePathname, useRouter } from 'next/navigation';
import { CSSProperties, useState } from 'react';
import AddIcon from './icons/AddIcon';
import CalendarIcon from './icons/CalendarIcon';
import HomeIcon from './icons/HomeIcon';
import BottomBar from './ui/BottomBar';
import BottomBarItem from './ui/BottomBarItem';
import ErrorPopUp from './ui/ErrorPopUp';
import LoadingCircle from './ui/LoadingCircle';

const HIDDEN_SIDEBAR_PATHS = ['/login', '/register', '/confirm-email'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError(error.message);
      setIsLoading(false);
      return;
    }

    router.push('/login');
    setIsLoading(false);
  }

  const { scale, isMobile, isTablet } = useResponsive();
  const iconSize = isMobile ? 16 : isTablet ? 18 : 20;
  const hideSidebar = HIDDEN_SIDEBAR_PATHS.includes(pathname);
  const BOTTOM_BAR_HEIGHT = 90;
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 250,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  };

  return (
    <>
      {/* MAIN CONTENT */}
      <div
        style={{
          minHeight: '100dvh',
          paddingBottom: BOTTOM_BAR_HEIGHT,
        }}
      >
        {children}
      </div>

      {/* BOTTOM BAR */}
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
        </BottomBar>
      )}

      {/* OVERLAYS */}
      {isLoading && (
        <div style={overlayStyle}>
          <LoadingCircle />
        </div>
      )}

      {logoutError && (
        <div style={overlayStyle}>
          <ErrorPopUp onClose={() => setLogoutError(null)}>
            {logoutError}
          </ErrorPopUp>
        </div>
      )}
    </>
  );
}
