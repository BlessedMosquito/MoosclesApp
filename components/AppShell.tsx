'use client';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import SidebarItem from '@/components/ui/SidebarItem';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import CalendarIcon from './icons/CalendarIcon';
import HomeIcon from './icons/HomeIcon';
import LogoutIcon from './icons/LogoutIcon';
import AddIcon from './icons/AddIcon';
import ProfileIcon from './icons/ProfileIcon';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoadingCircle from './ui/LoadingCircle';
import ErrorPopUp from './ui/ErrorPopUp';

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

  return (
    <>
      {!hideSidebar && (
        <Sidebar>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: s(4, scale),
            }}
          >
            <SidebarItem
              label="Dashboard"
              icon={<HomeIcon size={iconSize} color="currentColor" />}
              onClick={() => router.push('/dashboard')}
              activePath="/dashboard"
            />
            <SidebarItem
              label="Calendar"
              icon={<CalendarIcon size={iconSize} color="currentColor" />}
              activePath="/calendar"
              onClick={() => router.push('/calendar')}
            />
            <SidebarItem
              label="Add Workout"
              icon={<AddIcon size={iconSize} color="currentColor" />}
              onClick={() => router.push('/add-workout')}
              activePath="/add-workout"
            />
            <SidebarItem
              label="Workouts"
              icon="≡"
              onClick={() => router.push('/workouts')}
              activePath="/workouts"
            />
          </div>

          <SidebarItem
            label="Profile"
            icon={<ProfileIcon size={iconSize} color="currentColor" />}
            onClick={() => ({})}
          />
          <SidebarItem
            label="Log out"
            icon={<LogoutIcon size={iconSize} color="red" />}
            onClick={handleLogout}
            variant="danger"
          />
        </Sidebar>
      )}

      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <LoadingCircle />
        </div>
      )}

      {logoutError && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <ErrorPopUp onClose={() => setLogoutError(null)}>
            {logoutError}
          </ErrorPopUp>
        </div>
      )}

      {children}
    </>
  );
}
