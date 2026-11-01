'use client';

import { useEffect } from 'react';

type PopupWindowProps = {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function PopupWindow({
  onClose,
  children,
  title,
}: PopupWindowProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div onClick={onClose} className="overlay overlay-strong">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="popup-card"
      >
        {title && <p className="popup-title">{title}</p>}
        <div className="popup-body">{children}</div>
      </div>
    </div>
  );
}
