'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';
import { fontSizes } from '@/theme/typography';

export default function LoginPage() {
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

  async function signIn() {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <AuthLayout error={authError} onDismissError={() => setAuthError(null)}>
      <h1 style={{ color: 'white', fontSize: fontSizes.heading1 }}>MOOSCLES</h1>

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

      <Button title="Sign In" onClick={signIn}></Button>

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
