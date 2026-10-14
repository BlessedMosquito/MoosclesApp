'use client';

import { motion } from 'motion/react';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { colors } from '@/theme/colors';

type SetActiveEl = (el: HTMLElement | null) => void;

const BottomBarContext = createContext<SetActiveEl | null>(null);

export function useBottomBar() {
  return useContext(BottomBarContext);
}

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const spring = { type: 'spring', stiffness: 500, damping: 40 } as const;

export default function BottomBar({ children }: { children: React.ReactNode }) {
  const navRef = useRef<HTMLElement | null>(null);
  const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const nav = navRef.current;
      if (!nav || !activeEl) {
        setRect(null);
        return;
      }
      setRect({
        left: activeEl.offsetLeft,
        top: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
      });
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeEl]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <BottomBarContext.Provider value={setActiveEl}>
        <nav
          ref={navRef}
          style={{
            position: 'relative',
            display: 'flex',
            gap: 6,
            padding: 8,
            borderRadius: 24,
            background: 'rgba(33, 33, 33, 0.65)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${colors.textMuted}`,
            pointerEvents: 'auto',
          }}
        >
          {rect && (
            <motion.div
              initial={false}
              animate={{
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
              }}
              transition={spring}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                borderRadius: 24,

                background: colors.componentsBg,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',

                border: `1px solid ${colors.accent}`,
                boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
                zIndex: 0,
              }}
            />
          )}

          {children}
        </nav>
      </BottomBarContext.Provider>
    </div>
  );
}
