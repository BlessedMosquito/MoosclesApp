import { useResponsive, s } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import CloseIcon from '@/components/icons/CloseIcon';

const DURATION_MS = 10000;

type ErrorPopUpProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

export default function ErrorPopUp({ children, onClose }: ErrorPopUpProps) {
  const { isMobile, scale } = useResponsive();
  const [isOpen, setIsOpen] = useState(true);

  function handleClose() {
    setIsOpen(false);
  }

  useEffect(() => {
    const timeout = setTimeout(handleClose, DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        onClose?.();
      }}
    >
      {isOpen && (
        <motion.div
          role="alert"
          initial={{ y: -s(80, scale), opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -s(80, scale), opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: s(24, scale),
            left: 0,
            right: 0,
            marginInline: 'auto',
            zIndex: 999,
            width: isMobile
              ? 'calc(100% - 32px)'
              : 'min(460px, calc(100% - 80px))',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: s(12, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            boxShadow: `0 ${s(16, scale)}px ${s(32, scale)}px ${colors.shadow}`,
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              boxSizing: 'border-box',
              padding: `${s(10, scale)}px ${s(40, scale)}px`,
              borderBottom: `1px solid ${colors.errorBorder}`,
            }}
          >
            <span
              style={{
                fontSize: s(fontSizes.heading2, scale),
                color: colors.errorMuted,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Error
            </span>

            <button
              style={{
                position: 'absolute',
                right: s(10, scale),
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={handleClose}
            >
              <CloseIcon />
            </button>
          </div>

          <div
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: s(12, scale),
              fontSize: s(fontSizes.body, scale),
              whiteSpace: 'pre-line',
              textAlign: 'left',
            }}
          >
            {children}
          </div>

          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
            style={{
              height: s(3, scale),
              flexShrink: 0,
              background: colors.text,
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
