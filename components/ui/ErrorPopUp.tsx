import { useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { motion, AnimatePresence } from 'motion/react';
import { s } from '@/lib/useResponsive';
import { useState } from 'react';
import CloseIcon from '../icons/CloseIcon';

type ErrorPopUpProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

export default function ErrorPopUp({ children, onClose }: ErrorPopUpProps) {
  const { scale } = useResponsive();
  const [showContent, setShowContent] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  function handleClose() {
    setIsOpen(false);
    onClose?.();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="alert"
          initial={{
            opacity: 1,
            scaleX: 0,
            scaleY: 0.1,
          }}
          animate={{
            scaleX: 1,
            scaleY: 1,
          }}
          exit={{
            opacity: 0,
            scaleY: 0.1,
            transition: { duration: 0.2, ease: 'easeIn' },
          }}
          transition={{
            scaleX: { duration: 0.3, ease: 'easeOut' },
            scaleY: { duration: 0.2, delay: 0.3, ease: 'easeOut' },
            opacity: { duration: 0.1 },
          }}
          onAnimationComplete={() => {
            setShowContent(true);
          }}
          style={{
            marginTop: s(18, scale),
            padding: s(12, scale),
            borderRadius: s(12, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            fontSize: s(fontSizes.bodySmall, scale),
            transformOrigin: 'center',
            overflow: 'hidden',
            minHeight: s(48, scale),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {showContent && children}
            {showContent && (
              <button
                style={{ marginLeft: 15, cursor: 'pointer' }}
                onClick={handleClose}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
