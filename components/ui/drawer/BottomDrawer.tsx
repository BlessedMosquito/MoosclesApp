'use client';

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from 'motion/react';

type DrawerSnap = 'half' | 'full';

type BottomDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  initialSnap?: DrawerSnap;
  halfRatio?: number;
};

type DrawerSheetProps = Omit<BottomDrawerProps, 'open'> & {
  initialSnap: DrawerSnap;
  halfRatio: number;
};

const SPRING = { type: 'spring', stiffness: 380, damping: 40 } as const;
const FLICK_VELOCITY = 500;
const TOP_GAP = 16;

function subscribeNoop() {
  return () => {};
}

function DrawerSheet({
  onClose,
  children,
  title,
  initialSnap,
  halfRatio,
}: DrawerSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );
  const [layoutHeight] = useState(() => window.innerHeight);
  const rootRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<DrawerSnap>(initialSnap);
  const height = useMotionValue(0);
  const keyboardInset = useMotionValue(0);
  const sheetHeight = useTransform(
    [height, keyboardInset],
    ([sheet, inset]: number[]) => sheet + (sheet > 0 ? inset : 0)
  );
  const panStartHeight = useRef(0);
  const isClosing = useRef(false);
  const didPan = useRef(false);

  const fullHeight = viewportHeight - TOP_GAP;
  const halfHeight = Math.min(Math.round(layoutHeight * halfRatio), fullHeight);
  const backdropOpacity = useTransform(height, [0, halfHeight], [0, 1]);

  const close = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    animate(height, 0, SPRING).then(onClose);
  }, [height, onClose]);

  const snapTo = useCallback(
    (next: DrawerSnap) => {
      setSnap(next);
      animate(height, next === 'full' ? fullHeight : halfHeight, SPRING);
    },
    [fullHeight, halfHeight, height]
  );

  useEffect(() => {
    if (isClosing.current) return;
    animate(height, snap === 'full' ? fullHeight : halfHeight, SPRING);
  }, [fullHeight, halfHeight, height, snap]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const updateViewport = () => {
      const visibleHeight = viewport?.height ?? window.innerHeight;
      const inset = Math.max(0, Math.round(window.innerHeight - visibleHeight));
      setViewportHeight(visibleHeight);
      animate(keyboardInset, inset, SPRING);
      if (rootRef.current) {
        rootRef.current.style.top = `${viewport?.offsetTop ?? 0}px`;
        rootRef.current.style.height = `${window.innerHeight}px`;
        rootRef.current.style.setProperty('--keyboard-inset', `${inset}px`);
      }
    };
    const resetPageScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('scroll', resetPageScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      root.style.overflow = previousOverflow;
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('scroll', resetPageScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, keyboardInset]);

  function handlePanStart() {
    didPan.current = true;
    height.stop();
    panStartHeight.current = height.get();
  }

  function handlePan(_: PointerEvent, info: PanInfo) {
    const next = panStartHeight.current - info.offset.y;
    height.set(Math.min(fullHeight, Math.max(0, next)));
  }

  function handlePanEnd(_: PointerEvent, info: PanInfo) {
    const current = height.get();
    const velocity = info.velocity.y;
    const points = [0, halfHeight, fullHeight];

    let target: number;
    if (velocity > FLICK_VELOCITY) {
      target = [...points].reverse().find((point) => point < current - 1) ?? 0;
    } else if (velocity < -FLICK_VELOCITY) {
      target = points.find((point) => point > current + 1) ?? fullHeight;
    } else {
      target = points.reduce((closest, point) =>
        Math.abs(point - current) < Math.abs(closest - current)
          ? point
          : closest
      );
    }

    if (target === 0) {
      close();
      return;
    }

    snapTo(target === fullHeight ? 'full' : 'half');
  }

  return (
    <div ref={rootRef} className="drawer-root">
      <motion.div
        className="drawer-backdrop"
        style={{ opacity: backdropOpacity }}
        onClick={close}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="drawer-sheet"
        style={{ height: sheetHeight }}
      >
        <motion.div
          className="drawer-header"
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          <button
            type="button"
            aria-label={snap === 'full' ? 'Collapse drawer' : 'Expand drawer'}
            onPointerDown={() => {
              didPan.current = false;
            }}
            onClick={() => {
              if (didPan.current) return;
              snapTo(snap === 'full' ? 'half' : 'full');
            }}
            className="drawer-handle"
          >
            <span className="drawer-handle-bar" />
          </button>
          {title && <p className="drawer-title">{title}</p>}
        </motion.div>

        <div className="drawer-content">{children}</div>
      </motion.div>
    </div>
  );
}

export default function BottomDrawer({
  open,
  onClose,
  children,
  title,
  initialSnap = 'half',
  halfRatio = 0.5,
}: BottomDrawerProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="bottom-drawer"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <DrawerSheet
            onClose={onClose}
            title={title}
            initialSnap={initialSnap}
            halfRatio={halfRatio}
          >
            {children}
          </DrawerSheet>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
