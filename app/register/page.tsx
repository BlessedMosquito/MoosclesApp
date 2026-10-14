'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/buttons/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import TextInput from '@/components/ui/inputs/TextInput';
import Link from 'next/link';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import { fontSizes } from '@/theme/typography';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterPage() {
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

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function onBlurEmail() {
    if (email.trim() && !EMAIL_RE.test(email)) {
      setAuthError('Invalid email format.');
    }
  }
  function onBlurPassword(password: string) {
    if (password.trim() && !PASSWORD_RE.test(password)) {
      setAuthError(
        'Invalid password. Password must contain at least:\n• one uppercase letter\n• one number\n• one special character (@$!%*?&)\n• 8 characters'
      );
      setPassword('');
    }
  }

  async function signUp() {
    setAuthError(null);
    const trimmedFirstName = firstName.trim();

    if (!trimmedFirstName) {
      setAuthError('First name is required.');
      return;
    }

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

    if (password !== repeatedPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: trimmedFirstName,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>MOOSCLES</h1>

      <TextInput
        type="text"
        autoComplete="given-name"
        placeholder="First name"
        value={firstName}
        onChange={setFirstName}
        disabled={isLoading}
      />

      <TextInput
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        onBlur={onBlurEmail}
        disabled={isLoading}
      />

      <TextInput
        type="password"
        autoComplete="new-password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        onBlur={() => onBlurPassword(password)}
        disabled={isLoading}
      />

      <TextInput
        type="password"
        autoComplete="new-password"
        placeholder="Repeat Password"
        value={repeatedPassword}
        onChange={setRepeatedPassword}
        onBlur={() => onBlurPassword(repeatedPassword)}
        disabled={isLoading}
      />

      <Button onClick={signUp} disabled={isLoading}>
        {isLoading ? <LoadingCircle size={18} /> : 'Sign up'}
      </Button>
      <p style={{ fontSize: fontSizes.caption, color: '#888' }}>
        Already have an account?{' '}
        <Link
          style={{ color: 'white', textDecoration: 'none' }}
          href="/login"
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
