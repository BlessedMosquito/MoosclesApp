'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';

export default function LoginPage() {
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
    }, []);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error.message);
      return;
    }

    router.push('/dashboard');
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log(error.message);
      return;
    }

    router.push('/confirm-email');
  }
  return (
    <AuthLayout>
      <h1 style={{ color: 'white', fontSize: 28 }}>
        MOOSCLES
      </h1>

      <p style={{ color: '#888' }}>
        Sign in to continue
      </p>

      <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            color: 'white'
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
            color: 'white'
          }}
        />

        <Button title='Sign In' onClick={() => signIn}></Button>

        <p style={{fontSize: 12, color: '#888'}}>New to MOOSCLES? <Link style={{color: 'white'}} href='/register'>Create an account</Link></p>
    </AuthLayout>
  );
}