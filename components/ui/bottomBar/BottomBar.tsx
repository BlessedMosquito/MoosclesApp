'use client';

import { motion } from 'motion/react';
import { spring } from '@/lib/motion';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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

export const ITEM_COLLAPSED_WIDTH = 48;
export const ITEM_ACTIVE_WIDTH = 132;
export const ITEM_HEIGHT = 48;
export const BAR_SPRING = spring;

const NAV_PADDING = 8;
const NAV_GAP = 6;

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
      const items = Array.from(nav.querySelectorAll(':scope > button'));
      const index = items.indexOf(activeEl);
      if (index === -1) {
        setRect(null);
        return;
      }
      setRect({
        left: NAV_PADDING + index * (ITEM_COLLAPSED_WIDTH + NAV_GAP),
        top: NAV_PADDING,
        width: ITEM_ACTIVE_WIDTH,
        height: ITEM_HEIGHT,
      });
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeEl]);

  return (
    <>
      <div className="bottom-bar-fade" />
      <div className="bottom-bar">
        <BottomBarContext.Provider value={setActiveEl}>
          <nav ref={navRef} className="bottom-bar-nav">
            {rect && (
              <motion.div
                initial={false}
                animate={{
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height,
                }}
                transition={BAR_SPRING}
                className="bottom-bar-indicator"
              />
            )}

            {children}
          </nav>
        </BottomBarContext.Provider>
      </div>
    </>
  );
}
