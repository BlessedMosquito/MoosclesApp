'use client';

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type ExpandableButtonOption = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type ExpandDirection = 'up' | 'down' | 'auto';

type ExpandableButtonProps = {
  label: string;
  icon?: ReactNode;
  options: ExpandableButtonOption[];
  height?: number;
  direction?: ExpandDirection;
  className?: string;
};

type AnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const PILL_GAP = 12;

function subscribeNoop() {
  return () => {};
}
const EASE = [0.22, 1, 0.36, 1] as const;

export default function ExpandableButton({
  label,
  icon,
  options,
  height,
  direction = 'auto',
  className,
}: ExpandableButtonProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const isOpen = anchor !== null;

  const opensUp =
    direction === 'up' ||
    (direction === 'auto' &&
      anchor !== null &&
      anchor.top + anchor.height / 2 > window.innerHeight / 2);

  useEffect(() => {
    if (!isOpen) return;

    function close() {
      setAnchor(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  function open() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  function selectOption(option: ExpandableButtonOption) {
    setAnchor(null);
    option.onClick();
  }

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        whileTap={{ scale: 0.96 }}
        onClick={open}
        style={{ height }}
        className={cn('expandable-trigger', isOpen && 'invisible', className)}
      >
        {icon}
        {label}
      </motion.button>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {anchor && (
              <motion.div
                key="expandable-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="expandable-layer"
              >
                <div
                  className="expandable-backdrop"
                  onClick={() => setAnchor(null)}
                />

                <motion.button
                  type="button"
                  aria-label="Close"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAnchor(null)}
                  style={{
                    top: anchor.top,
                    left: anchor.left,
                    width: anchor.width,
                    height: anchor.height,
                  }}
                  className="expandable-trigger expandable-trigger-open"
                >
                  <motion.span
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex"
                  >
                    <IconX size={20} stroke={2.25} />
                  </motion.span>
                  Close
                </motion.button>

                <div
                  role="menu"
                  style={{
                    left: anchor.left + anchor.width / 2,
                    ...(opensUp
                      ? { bottom: window.innerHeight - anchor.top + PILL_GAP }
                      : { top: anchor.top + anchor.height + PILL_GAP }),
                  }}
                  className={cn(
                    'expandable-pills',
                    opensUp && 'expandable-pills-up'
                  )}
                >
                  {options.map((option, index) => {
                    const order = opensUp ? options.length - 1 - index : index;
                    return (
                      <motion.button
                        key={option.label}
                        type="button"
                        role="menuitem"
                        initial={{
                          opacity: 0,
                          scale: 0.7,
                          y: opensUp ? 24 : -24,
                        }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          y: opensUp ? 16 : -16,
                        }}
                        whileTap={{ scale: 0.94 }}
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 28,
                          delay: order * 0.05,
                        }}
                        onClick={() => selectOption(option)}
                        className="expandable-pill"
                      >
                        {option.icon}
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
