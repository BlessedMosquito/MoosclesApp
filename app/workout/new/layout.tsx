'use client';

import ArrowIcon from '@/components/icons/ArrowIcon';
import TopBar from '@/components/ui/topBar/TopBar';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const BackRouteContext = createContext<(route: string) => void>(() => {});

export function useSetBackRoute() {
  return useContext(BackRouteContext);
}

const TextContext = createContext<(text: string) => void>(() => {});

export function useSetText() {
  return useContext(TextContext);
}

const LeaveContext = createContext<() => void>(() => {});

export function useStartLeave() {
  return useContext(LeaveContext);
}

export default function NewWorkoutLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isMobile, scale } = useResponsive();
  const router = useRouter();
  const pathname = usePathname();
  const [currentBackRoute, setCurrentBackRoute] = useState('/dashboard');
  const [text, setText] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);

  const step = pathname.endsWith('/name')
    ? 2
    : pathname.endsWith('/type')
      ? 3
      : 1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLeaving(false);
  }, [pathname]);

  const startLeave = () => setIsLeaving(true);

  return (
    <BackRouteContext.Provider value={setCurrentBackRoute}>
      <TextContext.Provider value={setText}>
        <LeaveContext.Provider value={startLeave}>
          <main
            style={{
              minHeight: '100dvh',
              background: 'transparent',
              padding: s(isMobile ? 24 : 32, scale),
              color: colors.text,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <motion.div
              style={{ width: isMobile ? '100%' : '50%' }}
              initial={{ x: 0, opacity: 1 }}
              animate={
                isLeaving && isMobile
                  ? { x: '-110%', opacity: 0 }
                  : { x: 0, opacity: 1 }
              }
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                style={{
                  width: '100%',
                }}
              >
                <TopBar
                  left={
                    <button
                      style={{
                        rotate: '-90deg',
                      }}
                      onClick={() => router.push(currentBackRoute)}
                    >
                      <ArrowIcon />
                    </button>
                  }
                  center={`Step ${step} of 3`}
                />
              </div>
              {text ? (
                <p
                  style={{
                    margin: `${s(32, scale)}px 0`,
                    color: colors.text,
                    fontSize: s(isMobile ? 22 : 32, scale),
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {text}
                </p>
              ) : null}

              {children}
            </motion.div>
          </main>
        </LeaveContext.Provider>
      </TextContext.Provider>
    </BackRouteContext.Provider>
  );
}
