'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <AuthLayout>
      <h1 style={{ color: colors.text, fontSize: fontSizes.heading1 }}>
        MOOSCLES
      </h1>

      <div
        style={{
          padding: 18,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: colors.text,
            fontSize: fontSizes.heading2,
          }}
        >
          Check your email
        </h2>

        <p
          style={{
            margin: '12px 0 0',
            color: colors.textSecondary,
            fontSize: fontSizes.bodySmall,
            lineHeight: 1.5,
          }}
        >
          We sent a confirmation link to{' '}
          <span style={{ color: colors.text }}>
            {email || 'your email address'}
          </span>
          .
        </p>
      </div>

      <p style={{ fontSize: fontSizes.caption, color: colors.textSecondary }}>
        Already confirmed?{' '}
        <Link
          style={{ color: colors.text, textDecoration: 'none' }}
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
