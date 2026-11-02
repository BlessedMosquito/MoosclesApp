'use client';

import { PROFILE_PROMPT_DISMISSED_KEY } from '@/app/constants/storageConstants';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import Link from 'next/link';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      return;
    }

    window.sessionStorage.removeItem(PROFILE_PROMPT_DISMISSED_KEY);
    router.push('/dashboard');
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your training."
      error={authError}
      onDismissError={() => setAuthError(null)}
      onSubmit={signIn}
      footer={
        <p className="m-0">
          New to Mooscles?{' '}
          <Link className="auth-link" href="/register">
            Create an account
          </Link>
        </p>
      }
    >
      <label className="field">
        <span className="field-label">Email</span>
        <TextInput
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          onBlur={onBlurEmail}
          disabled={isLoading}
        />
      </label>

      <label className="field">
        <span className="auth-label-row">
          <span className="field-label">Password</span>
          <Link
            className="auth-link-muted"
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
          >
            Forgot password?
          </Link>
        </span>
        <TextInput
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
        />
      </label>

      <div className="auth-submit">
        <Button type="submit" width="full" disabled={isLoading}>
          {isLoading ? <LoadingCircle size={18} /> : 'Log in'}
        </Button>
      </div>
    </AuthLayout>
  );
}
