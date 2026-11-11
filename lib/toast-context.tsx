'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconAlertCircle, IconCircleCheck, IconX } from '@tabler/icons-react';
import { fade, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ToastVariant = 'error' | 'success' | 'info';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastOptions = {
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
};

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => number;
  dismissToast: (id: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = useCallback((id: number) => {
    const timer = timerRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId++;
      const toast: Toast = {
        id,
        message,
        variant: options.variant ?? 'info',
        action: options.action,
      };
      setToasts((prev) => [...prev.slice(-2), toast]);

      const timer = setTimeout(
        () => dismiss(id),
        options.duration ?? DEFAULT_DURATION
      );
      timerRef.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast: dismiss,
      showError: (message) => showToast(message, { variant: 'error' }),
      showSuccess: (message) => showToast(message, { variant: 'success' }),
    }),
    [dismiss, showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const Icon = toast.variant === 'error' ? IconAlertCircle : IconCircleCheck;

  return (
    <motion.div
      layout
      role={toast.variant === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96, transition: fade }}
      transition={spring}
      className={cn('toast', `toast-${toast.variant}`)}
    >
      {toast.variant !== 'info' && (
        <Icon size={18} stroke={2} className="toast-icon" />
      )}
      <span className="toast-message">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="toast-action"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="toast-close"
      >
        <IconX size={16} stroke={2} />
      </button>
    </motion.div>
  );
}
