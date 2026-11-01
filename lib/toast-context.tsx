'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'error' | 'success';

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

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

  const show = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);

      const timer = setTimeout(() => dismiss(id), 4000);
      timerRef.current.set(id, timer);
    },
    [dismiss]
  );

  const contextValue: ToastContextValue = {
    showError: (msg) => show(msg, 'error'),
    showSuccess: (msg) => show(msg, 'success'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
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

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const isError = toast.variant === 'error';

  return (
    <div
      role="alert"
      className={cn('toast', isError ? 'toast-error' : 'toast-success')}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="toast-close"
      >
        x
      </button>
    </div>
  );
}
