import { ReactNode } from 'react';
import { useDevice } from '@/lib/useDevice';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isMobile } = useDevice();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',

        justifyContent: isMobile ? 'flex-start' : 'center',
        alignItems: isMobile ? 'stretch' : 'center',

        background: '#0B0B0F',
        padding: isMobile ? 0 : 24,
      }}
    >
      <div
        style={{
          width: '100%',
          height: isMobile ? '100%' : 'auto',

          maxWidth: isMobile ? '100%' : 420,

          padding: isMobile ? 24 : 32,

          borderRadius: isMobile ? 0 : 28,

          border: isMobile
            ? 'none'
            : '3px solid rgba(255,255,255,0.08)',

          background: isMobile
            ? 'transparent'
            : 'rgba(255,255,255,0.04)',

          backdropFilter: isMobile ? 'none' : 'blur(20px)',

          WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',

          boxShadow: isMobile
            ? 'none'
            : '0 20px 60px rgba(0,0,0,0.5)',

          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          textAlign: 'center'
        }}
      >
        {children}
      </div>
    </main>
  );
}