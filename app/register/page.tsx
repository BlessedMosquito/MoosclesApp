'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';
import { fontSizes } from '@/theme/typography';

export default function RegisterPage() {
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

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  async function signUp() {
    setAuthError(null);
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setAuthError('Username is required.');
      return;
    }

    if (password !== repeatedPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
  }
  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>MOOSCLES</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <input
        type="password"
        placeholder="Repeat Password"
        value={repeatedPassword}
        onChange={(e) => setRepeatedPassword(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          color: 'white',
          fontSize: fontSizes.input,
        }}
      />

      <Button title="Sign Up" onClick={signUp}></Button>
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
