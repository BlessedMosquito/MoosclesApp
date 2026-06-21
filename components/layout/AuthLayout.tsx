import { Children, ReactNode } from 'react';
import { useDevice } from '@/lib/useDevice';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import ErrorPopUp from '../ui/ErrorPopUp';

type AuthLayoutProps = {
  children: ReactNode;
  error?: string | null;
  onDismissError?: () => void;
};

export default function AuthLayout({
  children,
  error,
  onDismissError,
}: AuthLayoutProps) {
  const { isMobile } = useDevice();
  const childItems = Children.toArray(children);
  const [title, ...content] = childItems;
  const errorMessage = error && (
    <ErrorPopUp onClose={() => onDismissError}>{error}</ErrorPopUp>
  );

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',

        justifyContent: isMobile ? 'flex-start' : 'center',
        alignItems: isMobile ? 'stretch' : 'center',

        background: colors.background,
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

          border: isMobile ? 'none' : `3px solid ${colors.border}`,

          background: isMobile ? 'transparent' : colors.glass,

          backdropFilter: isMobile ? 'none' : 'blur(20px)',

          WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',

          boxShadow: isMobile ? 'none' : `0 20px 60px ${colors.shadow}`,

          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          textAlign: 'center',
        }}
      >
        {title}
        {errorMessage}
        {content}
      </div>
    </main>
  );
}
