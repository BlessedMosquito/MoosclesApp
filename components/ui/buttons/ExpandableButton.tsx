'use client';

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { IconX } from '@tabler/icons-react';
import { fade, spring } from '@/lib/motion';
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

type ExpandableLayerProps = {
  anchor: AnchorRect;
  opensUp: boolean;
  options: ExpandableButtonOption[];
  onClose: () => void;
  onSelect: (option: ExpandableButtonOption) => void;
};

const PILL_GAP = 12;
const EXIT = { duration: 0.16, ease: 'easeIn' } as const;
const DIMMED_CHROME_COLOR = '#0d0d0d';

function subscribeNoop() {
  return () => {};
}

function ExpandableLayer({
  anchor,
  opensUp,
  options,
  onClose,
  onSelect,
}: ExpandableLayerProps) {
  const isPresent = useIsPresent();
  const offset = opensUp ? 18 : -18;

  return (
    <div
      className={cn('expandable-layer', !isPresent && 'pointer-events-none')}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: EXIT }}
        transition={fade}
        className="expandable-backdrop"
        onClick={onClose}
      />

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: EXIT }}
        transition={fade}
        className="expandable-edges"
      >
        <span className="expandable-edge expandable-edge-top" />
        <span className="expandable-edge expandable-edge-bottom" />
      </motion.div>

      <motion.button
        type="button"
        aria-label="Close"
        exit={{ opacity: 0, transition: EXIT }}
        whileTap={{ scale: 0.96 }}
        onClick={onClose}
        style={{
          top: anchor.top,
          left: anchor.left,
          width: anchor.width,
          height: anchor.height,
        }}
        className="expandable-trigger expandable-trigger-open"
      >
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={fade}
          className="expandable-trigger-fill"
        />
        <motion.span
          initial={{ rotate: -90, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={spring}
          className="relative flex"
        >
          <IconX size={20} stroke={2.25} />
        </motion.span>
        <span className="relative">Close</span>
      </motion.button>

      <div
        role="menu"
        style={{
          left: anchor.left + anchor.width / 2,
          ...(opensUp
            ? { bottom: window.innerHeight - anchor.top + PILL_GAP }
            : { top: anchor.top + anchor.height + PILL_GAP }),
        }}
        className={cn('expandable-pills', opensUp && 'expandable-pills-up')}
      >
        {options.map((option, index) => (
          <motion.button
            key={option.label}
            type="button"
            role="menuitem"
            initial={{ opacity: 0, y: offset, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: offset / 2, scale: 0.95, transition: EXIT }}
            whileTap={{ scale: 0.95 }}
            transition={{ ...spring, delay: 0.04 + index * 0.05 }}
            onClick={() => onSelect(option)}
            className="expandable-pill"
          >
            <span className="expandable-pill-icon">{option.icon}</span>
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

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

    const root = document.documentElement;
    const themeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    const previousTheme = themeMeta?.content;
    const previousBackground = root.style.backgroundColor;

    themeMeta?.setAttribute('content', DIMMED_CHROME_COLOR);
    root.style.backgroundColor = DIMMED_CHROME_COLOR;

    return () => {
      if (themeMeta && previousTheme) {
        themeMeta.setAttribute('content', previousTheme);
      }
      root.style.backgroundColor = previousBackground;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClose() {
      setAnchor(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
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

  function close() {
    setAnchor(null);
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
        className={cn('expandable-trigger', className)}
      >
        {icon}
        {label}
      </motion.button>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {anchor && (
              <ExpandableLayer
                key="expandable-layer"
                anchor={anchor}
                opensUp={opensUp}
                options={options}
                onClose={close}
                onSelect={selectOption}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
