'use client';

import BackButton from '@/components/ui/buttons/BackButton';
import TopBar from '@/components/ui/topBar/TopBar';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { useResponsive } from '@/lib/useResponsive';
import { AnimatePresence, motion } from 'motion/react';
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
  const { isMobile } = useResponsive();
  const router = useRouter();
  const pathname = usePathname();
  const [currentBackRoute, setCurrentBackRoute] = useState('/dashboard');
  const [text, setText] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);

  const step = pathname.endsWith('/name')
    ? 2
    : pathname.endsWith('/type')
      ? 3
      : pathname.endsWith('/preview')
        ? 4
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
          <main className="wizard">
            <motion.div
              className="wizard-content"
              initial={{ x: 0, opacity: 1 }}
              animate={
                isLeaving && isMobile
                  ? { x: '-110%', opacity: 0 }
                  : { x: 0, opacity: 1 }
              }
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <TopBar
                left={
                  <BackButton onClick={() => router.push(currentBackRoute)} />
                }
                center={`Step ${step} of 4`}
              />
              {text ? <p className="wizard-heading">{text}</p> : null}

              {children}
            </motion.div>

            <AnimatePresence>
              {isLeaving && isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="wizard-leave-loader"
                >
                  <LoadingCircle size={44} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </LeaveContext.Provider>
      </TextContext.Provider>
    </BackRouteContext.Provider>
  );
}
