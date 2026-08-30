'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { fontSizes } from '@/theme/typography';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

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
  }, [router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  function onBlurEmail() {
    if (email.trim() && !EMAIL_RE.test(email)) {
      setAuthError('Invalid email format.');
    }
  }

  async function signIn() {
    setAuthError(null);

    if (!email.trim()) {
      setAuthError('Email is required.');
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setAuthError('Invalid email format.');
      return;
    }

    if (!password) {
      setAuthError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      setFailedAttempts((prev) => prev + 1);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>MOOSCLES</h1>

      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={onBlurEmail}
        disabled={isLoading}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <Button onClick={signIn} disabled={isLoading}>
        {isLoading ? <LoadingCircle size={18} /> : 'Sign in'}
      </Button>

      {failedAttempts >= 3 && (
        <p style={{ fontSize: fontSizes.caption, color: '#888' }}>
          Forgot your password?{' '}
          <Link
            style={{ color: 'white', textDecoration: 'none' }}
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Reset it
          </Link>
        </p>
      )}

      <p style={{ fontSize: fontSizes.caption, color: '#888' }}>
        New to MOOSCLES?{' '}
        <Link
          style={{ color: 'white', textDecoration: 'none' }}
          href="/register"
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
