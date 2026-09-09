'use client';

import Link from 'next/link';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { s, useResponsive } from '@/lib/useResponsive';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { isMobile, scale } = useResponsive();
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBlurred(true);
      setTimeout(() => setBlurred(false), 600);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background:
          'linear-gradient(180deg, rgba(48,209,88,.06) 0%, transparent 40%)',
        padding: s(24, scale),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.h1
        animate={{ filter: blurred ? 'blur(6px)' : 'blur(0px)' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          margin: 0,
          fontSize: s(isMobile ? 60 : 90, scale),
          fontWeight: 800,
          background: colors.text,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          padding: s(10, scale),
        }}
      >
        Mooscles
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: s(12, scale),
          marginTop: s(40, scale),
          width: isMobile ? '100%' : 'auto',
          maxWidth: 280,
        }}
      >
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: s(52, scale),
            padding: `0 ${s(28, scale)}px`,
            borderRadius: s(16, scale),
            border: `1px solid ${colors.border}`,
            background: colors.componentsBg,
            color: colors.text,
            textDecoration: 'none',
            fontSize: s(fontSizes.button, scale),
            fontWeight: 600,
          }}
        >
          Login
        </Link>
        <Link
          href="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: s(52, scale),
            padding: `0 ${s(28, scale)}px`,
            borderRadius: s(16, scale),
            background: colors.limeGreen,
            color: colors.bg,
            textDecoration: 'none',
            fontSize: s(fontSizes.button, scale),
            fontWeight: 700,
          }}
        >
          Register
        </Link>
      </motion.div>
    </main>
  );
}
