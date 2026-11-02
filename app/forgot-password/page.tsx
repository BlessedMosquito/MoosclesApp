'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import Link from 'next/link';

function ForgotPasswordForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function sendReset() {
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('Email is required.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  }

  return (
    <AuthLayout
      title={success ? 'Check your inbox' : 'Forgot password?'}
      subtitle={
        success ? (
          <>
            We sent a password reset link to <b>{email}</b>.
          </>
        ) : (
          "Enter your email and we'll send you a link to reset your password."
        )
      }
      error={authError}
      onDismissError={() => setAuthError(null)}
      onSubmit={success ? undefined : sendReset}
      footer={
        <Link className="auth-link" href="/login">
          Back to log in
        </Link>
      }
    >
      {!success && (
        <>
          <label className="field">
            <span className="field-label">Email</span>
            <TextInput
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              disabled={isLoading}
            />
          </label>

          <div className="auth-submit">
            <Button type="submit" width="full" disabled={isLoading}>
              {isLoading ? <LoadingCircle size={18} /> : 'Send reset link'}
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingCircle size={24} />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
