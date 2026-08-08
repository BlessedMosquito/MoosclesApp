'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import { s, useResponsive } from '@/lib/useResponsive';

const highlights = [
  {
    title: 'Workouts',
    text: 'Log distance, time, and reps in one place.',
  },
  {
    title: 'Progress',
    text: 'See weekly movement and weight trends at a glance.',
  },
  {
    title: 'Streaks',
    text: 'Keep a simple weekly rhythm without extra noise.',
  },
];

export default function HomePage() {
  const { isMobile, isTablet, scale } = useResponsive();

  const contentMaxWidth = isMobile ? 420 : isTablet ? 920 : 1200;

  const gridColumns = isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)';

  const ctaStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: s(52, scale),
    padding: `0 ${s(20, scale)}px`,
    borderRadius: s(18, scale),
    border: `1px solid ${colors.border}`,
    textDecoration: 'none',
    fontSize: s(fontSizes.button, scale),
    fontWeight: 700,
    transition: 'transform .2s ease',
  };

  return (
    <>
      <main
        style={{
          minHeight: '100dvh',
          backgroundImage:
            'linear-gradient(180deg, rgba(48,209,88,.08), rgba(11,12,12,0) 35%)',
          backgroundColor: 'transparent',
          padding: s(isMobile ? 20 : 40, scale),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <section
          style={{
            width: '100%',
            maxWidth: contentMaxWidth,
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: s(isMobile ? 32 : 64, scale),
            alignItems: 'center',
          }}
        >
          {/* LEFT */}
          <div>
            <p
              style={{
                margin: 0,
                color: colors.limeGreen,
                fontSize: s(fontSizes.caption, scale),
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              Mooscles
            </p>

            <h1
              style={{
                marginTop: s(12, scale),
                marginBottom: 0,
                color: colors.text,
                fontSize: s(
                  isMobile ? fontSizes.heading1 : fontSizes.display,
                  scale
                ),
                fontWeight: 800,
                lineHeight: 1.05,
                maxWidth: 550,
              }}
            >
              Track your training without the clutter.
            </h1>

            <p
              style={{
                marginTop: s(20, scale),
                color: colors.textMuted,
                fontSize: s(
                  isMobile ? fontSizes.bodySmall : fontSizes.body,
                  scale
                ),
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              Mooscles keeps your workouts, weekly movement and progress in one
              clean place. Spend less time tracking and more time training.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: s(14, scale),
                marginTop: s(28, scale),
              }}
            >
              <Link
                href="/register"
                style={{
                  ...ctaStyle,
                  background: colors.limeGreen,
                  color: colors.bg,
                }}
              >
                Create account
              </Link>

              <Link
                href="/login"
                style={{
                  ...ctaStyle,
                  color: colors.text,
                  background: 'transparent',
                }}
              >
                Sign in
              </Link>
            </div>

            <div
              style={{
                marginTop: s(42, scale),
                display: 'grid',
                gap: s(18, scale),
                maxWidth: 520,
              }}
            >
              {highlights.map((item) => (
                <div
                  key={item.title}
                  style={{
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: s(14, scale),
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: colors.text,
                      fontWeight: 700,
                      fontSize: s(fontSizes.bodySmall, scale),
                    }}
                  >
                    {item.title}
                  </p>

                  <p
                    style={{
                      margin: `${s(4, scale)}px 0 0`,
                      color: colors.textMuted,
                      lineHeight: 1.5,
                      fontSize: s(fontSizes.caption, scale),
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              src="/moosclesVector.png"
              alt="Mooscles"
              width={700}
              height={700}
              priority
              style={{
                width: '100%',
                maxWidth: isMobile ? 320 : isTablet ? 500 : 650,
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 30px 70px rgba(48,209,88,.25))',
                animation: 'float 5s ease-in-out infinite',
              }}
            />
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-14px);
          }
        }
      `}</style>
    </>
  );
}
