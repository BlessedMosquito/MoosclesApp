'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { fontSizes } from '@/theme/typography';
import { colors } from '@/theme/colors';

function ForgotPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
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
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>
        Forgot Password
      </h1>

      {success ? (
        <p
          style={{ fontSize: fontSizes.body, color: '#888', textAlign: 'left' }}
        >
          We sent a password reset link to <b>{email}</b>. Check your inbox.
        </p>
      ) : (
        <>
          <p
            style={{
              fontSize: fontSizes.body,
              color: '#888',
              textAlign: 'left',
            }}
          >
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>

          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={{
              padding: 12,
              borderRadius: 10,
              color: colors.text,
              fontSize: fontSizes.input,
            }}
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
