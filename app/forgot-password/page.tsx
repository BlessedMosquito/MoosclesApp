'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

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
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 className="auth-title">Forgot Password</h1>

      {success ? (
        <p className="auth-text">
          We sent a password reset link to <b>{email}</b>. Check your inbox.
        </p>
      ) : (
        <>
          <p className="auth-text">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>

          <TextInput
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
            disabled={isLoading}
          />

          <Button onClick={sendReset} disabled={isLoading}>
            {isLoading ? <LoadingCircle size={18} /> : 'Send reset link'}
          </Button>
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
