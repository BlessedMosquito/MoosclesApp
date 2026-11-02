'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

function ConfirmEmailForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResent, setIsResent] = useState(false);

  async function verifyCode() {
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('Email is required.');
      return;
    }

    if (!code.trim()) {
      setAuthError('Enter the code from the email.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'signup',
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  async function resendCode() {
    setAuthError(null);
    setIsResent(false);

    if (!email.trim()) {
      setAuthError('Email is required.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin + '/confirm-email',
      },
    });

    setIsLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setIsResent(true);
  }

  return (
    <AuthLayout
      title="Check your email"
      subtitle={
        initialEmail ? (
          <>
            We sent a confirmation code to <b>{initialEmail}</b>.
          </>
        ) : (
          'We sent a confirmation code to your email.'
        )
      }
      error={authError}
      onDismissError={() => setAuthError(null)}
      onSubmit={verifyCode}
      footer={
        <p className="m-0">
          Didn&apos;t get the code?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={resendCode}
            disabled={isLoading}
          >
            Resend
          </button>
        </p>
      }
    >
      {isResent && <p className="auth-notice">A new code is on its way.</p>}

      {!initialEmail && (
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
      )}

      <label className="field">
        <span className="field-label">Confirmation code</span>
        <TextInput
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          onChange={setCode}
          disabled={isLoading}
          className="input-code"
        />
      </label>

      <div className="auth-submit">
        <Button type="submit" width="full" disabled={isLoading}>
          {isLoading ? <LoadingCircle size={18} /> : 'Confirm email'}
        </Button>
      </div>
    </AuthLayout>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="page-center">
          <LoadingCircle />
        </div>
      }
    >
      <ConfirmEmailForm />
    </Suspense>
  );
}
