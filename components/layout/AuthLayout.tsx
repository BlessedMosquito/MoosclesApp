'use client';

import { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import Emblem from '@/components/brand/Emblem';
import ErrorPopUp from '../ui/feedback/ErrorPopUp';
import { spring } from '@/lib/motion';

type AuthLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  error?: string | null;
  onDismissError?: () => void;
  onSubmit?: () => void;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  error,
  onDismissError,
  onSubmit,
}: AuthLayoutProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.();
  }

  return (
    <main className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="auth-card"
      >
        <Link href="/" aria-label="Mooscles home" className="auth-brand">
          <Emblem size={64} />
        </Link>

        <header className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>

        {error && (
          <ErrorPopUp onClose={() => onDismissError?.()}>{error}</ErrorPopUp>
        )}

        {onSubmit ? (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {children}
          </form>
        ) : (
          children && <div className="auth-form">{children}</div>
        )}

        {footer && <div className="auth-footer">{footer}</div>}
      </motion.div>
    </main>
  );
}
