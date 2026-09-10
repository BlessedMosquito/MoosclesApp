'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { fontSizes } from '@/theme/typography';
import { colors } from '@/theme/colors';

export default function ConfirmEmailPage() {
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
    }
  }

  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>MOOSCLES</h1>

      <p style={{ margin: 0, fontSize: fontSizes.caption, color: '#888' }}>
        We sent a confirmation code to your email.
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
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Confirmation code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={isLoading}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
          letterSpacing: 4,
          textAlign: 'center',
        }}
      />

      <Button onClick={verifyCode} disabled={isLoading}>
        {isLoading ? <LoadingCircle size={18} /> : 'Confirm email'}
      </Button>

      <p style={{ fontSize: fontSizes.caption, color: '#888' }}>
        Didn&apos;t get the code?{' '}
        <Link
          style={{ color: colors.limeGreen, textDecoration: 'none' }}
          href=""
          onClick={(e) => {
            e.preventDefault();
            resendCode();
          }}
        >
          Resend
        </Link>
      </p>
    </AuthLayout>
  );
}