'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { fontSizes } from '@/theme/typography';

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

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => {
          setReady(true);
        });
    }
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
      <AuthLayout>
        <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>
          Reset Password
        </h1>
        <LoadingCircle size={24} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>
        Reset Password
      </h1>

      <input
        type="password"
        autoComplete="new-password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={onBlurPassword}
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
        autoComplete="new-password"
        placeholder="Repeat password"
        value={repeatedPassword}
        onChange={(e) => setRepeatedPassword(e.target.value)}
        disabled={isLoading}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <Button onClick={updatePassword} disabled={isLoading}>
        {isLoading ? <LoadingCircle size={18} /> : 'Reset password'}
      </Button>
    </AuthLayout>
  );
}
