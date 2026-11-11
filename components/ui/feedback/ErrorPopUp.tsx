import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import CloseIcon from '@/components/icons/CloseIcon';
import { spring } from '@/lib/motion';

const DURATION_MS = 10000;

type ErrorPopUpProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

export default function ErrorPopUp({ children, onClose }: ErrorPopUpProps) {
  const [isOpen, setIsOpen] = useState(true);

  function handleClose() {
    setIsOpen(false);
  }

  useEffect(() => {
    const timeout = setTimeout(handleClose, DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => onClose?.()}>
      {isOpen && (
        <motion.div
          role="alert"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={spring}
          className="error-toast"
        >
          <div className="error-toast-header">
            <span className="error-toast-title">Error</span>
            <button
              type="button"
              aria-label="Close"
              className="error-toast-close"
              onClick={handleClose}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="error-toast-body">{children}</div>

          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: DURATION_MS / 1000, ease: 'linear' }}
            className="error-toast-timer"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
