'use client';

import Link from 'next/link';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { s, useResponsive } from '@/lib/useResponsive';
import { motion } from 'motion/react';

const features = [
  {
    icon: '01',
    title: 'Track Workouts',
    text: 'Log distance, time, reps and weight. Everything in one clean view.',
  },
  {
    icon: '02',
    title: 'Weekly Goals',
    text: 'Set distance and duration goals. See your progress at a glance.',
  },
  {
    icon: '03',
    title: 'Level Up',
    text: 'Earn XP with every session. Watch your level grow over time.',
  },
];

export default function HomePage() {
  const { isMobile, isTablet, scale } = useResponsive();

  const contentMaxWidth = isMobile ? 420 : isTablet ? 720 : 960;

  return (
    <main
      style={{
        minHeight: '100dvh',
        background:
          'linear-gradient(180deg, rgba(48,209,88,.06) 0%, transparent 40%)',
        padding: s(isMobile ? 24 : 48, scale),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: contentMaxWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            margin: 0,
            color: colors.limeGreen,
            fontSize: s(fontSizes.caption, scale),
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}
        >
          Mooscles
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            marginTop: s(16, scale),
            marginBottom: 0,
            color: colors.text,
            fontSize: s(
              isMobile ? fontSizes.display : 52,
              scale
            ),
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 640,
          }}
        >
          Train hard.{' '}
          <span style={{ color: colors.limeGreen }}>Track smart.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            marginTop: s(20, scale),
            color: colors.textMuted,
            fontSize: s(
              isMobile ? fontSizes.bodySmall : fontSizes.body,
              scale
            ),
            lineHeight: 1.6,
            maxWidth: 480,
          }}
        >
          Workouts, weekly movement, and progress — all in one place.
          Less clutter, more training.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: s(12, scale),
            marginTop: s(32, scale),
            justifyContent: 'center',
          }}
        >
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
            Get started
          </Link>
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
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            Sign in
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{
            marginTop: s(isMobile ? 48 : 64, scale),
            width: '100%',
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(3, 1fr)',
            gap: s(14, scale),
          }}
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              style={{
                padding: s(20, scale),
                borderRadius: s(18, scale),
                border: `1px solid ${colors.border}`,
                background: colors.componentsBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  color: colors.limeGreen,
                  fontSize: s(fontSizes.caption, scale),
                  fontWeight: 800,
                  marginBottom: s(10, scale),
                }}
              >
                {feat.icon}
              </span>
              <p
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: s(fontSizes.body, scale),
                  fontWeight: 700,
                }}
              >
                {feat.title}
              </p>
              <p
                style={{
                  margin: `${s(6, scale)}px 0 0`,
                  color: colors.textMuted,
                  fontSize: s(fontSizes.bodySmall, scale),
                  lineHeight: 1.5,
                }}
              >
                {feat.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
