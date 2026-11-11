'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import Link from 'next/link';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.substring(1));
    const urlError =
      url.searchParams.get('error_description') ??
      hashParams.get('error_description');
    const hasRecoveryLink =
      url.searchParams.has('code') || hashParams.get('type') === 'recovery';

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!cancelled && session && event === 'PASSWORD_RECOVERY') {
          setReady(true);
        }
      }
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (cancelled) return;

        if (urlError) {
          setLinkError(urlError);
        } else if (session && hasRecoveryLink) {
          setReady(true);
        } else {
          setLinkError('This reset link is invalid or has expired.');
        }
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  function onBlurPassword() {
    if (password.trim() && !PASSWORD_RE.test(password)) {
      setAuthError(
        'Invalid password. Password must contain at least:\n• one uppercase letter\n• one number\n• one special character (@$!%*?&)\n• 8 characters'
      );
    }
  }

  async function updatePassword() {
    setAuthError(null);

    if (!password) {
      setAuthError('Password is required.');
      return;
    }

    if (!PASSWORD_RE.test(password)) {
      setAuthError(
        'Invalid password. Password must contain at least:\n• one uppercase letter\n• one number\n• one special character (@$!%*?&)\n• 8 characters'
      );
      return;
    }

    if (password !== repeatedPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  if (!ready) {
    return (
      <AuthLayout
        title="Reset password"
        subtitle={linkError ?? 'Checking your reset link…'}
        footer={
          linkError ? (
            <Link href="/forgot-password" className="auth-link">
              Request a new link
            </Link>
          ) : undefined
        }
      >
        {!linkError && (
          <div className="flex justify-center">
            <LoadingCircle size={24} />
          </div>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      error={authError}
      onDismissError={() => setAuthError(null)}
      onSubmit={updatePassword}
    >
      <label className="field">
        <span className="field-label">New password</span>
        <TextInput
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={setPassword}
          onBlur={onBlurPassword}
          disabled={isLoading}
        />
        <span className="field-hint">
          At least 8 characters, an uppercase letter, a number and a special
          character.
        </span>
      </label>

      <label className="field">
        <span className="field-label">Repeat password</span>
        <TextInput
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={repeatedPassword}
          onChange={setRepeatedPassword}
          disabled={isLoading}
        />
      </label>

      <div className="auth-submit">
        <Button type="submit" width="full" disabled={isLoading}>
          {isLoading ? <LoadingCircle size={18} /> : 'Save new password'}
        </Button>
      </div>
    </AuthLayout>
  );
}
