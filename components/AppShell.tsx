'use client';

import { useRouter } from 'next/navigation';
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    router.push('/login');
  }

  const { scale, isMobile, isTablet } = useResponsive();
    const iconSize = isMobile ? 16 : isTablet ? 18 : 20;


  return (
    <>
      <Sidebar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: s(4, scale) }}>
          <SidebarItem 
                label="Dashboard"   
                icon={<HomeIcon size={iconSize} color='currentColor'/>} 
                onClick={() => router.push('/dashboard')}   
                activePath="/dashboard" 
            />
          <SidebarItem
                label="Calendar"
                icon={<CalendarIcon size={iconSize} color='currentColor' />}
                activePath="/calendar"
                onClick={() => router.push('/calendar')}
            />
          <SidebarItem 
                label="Add Workout" 
                icon={<AddIcon size={iconSize} color='currentColor'/>}
                onClick={() => router.push('/add-workout')} 
                activePath="/add-workout" 
            />
          <SidebarItem label="Workouts"    icon="≡" onClick={() => router.push('/workouts')}    activePath="/workouts" />
        </div>

        <div style={{
          padding: s(12, scale),
          borderRadius: s(12, scale),
          border: `1px solid ${colors.border}`,
          background: colors.glass,
          marginBottom: s(8, scale),
        }}>
        <SidebarItem 
            label="Profile" 
            icon={<ProfileIcon size={iconSize} color='currentColor'/>}
            onClick={() =>({})} 
         />
        </div>

        <SidebarItem 
            label="Log out" 
            icon={<LogoutIcon size={iconSize} color='red'/>}
            onClick={handleLogout} 
            variant="danger" />
        </Sidebar>

      {children}
    </>
  );
}