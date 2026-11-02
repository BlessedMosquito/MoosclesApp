'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  IconArrowRight,
  IconBarbell,
  IconChartBar,
  IconTemplate,
} from '@tabler/icons-react';
import Emblem from '@/components/brand/Emblem';
import Logo from '@/components/brand/Logo';

const FEATURES = [
  { icon: IconBarbell, label: 'Log sets' },
  { icon: IconTemplate, label: 'Templates' },
  { icon: IconChartBar, label: 'Progress' },
];

export default function HomePage() {
  return (
    <main className="home">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="home-hero"
      >
        <Emblem size={120} />
        <h1 className="home-title">
          <Logo height={44} />
        </h1>
        <p className="home-tagline">
          A simple workout tracker. Log your training, keep your streak, get
          stronger.
        </p>

        <ul className="home-features">
          {FEATURES.map(({ icon: FeatureIcon, label }) => (
            <li key={label} className="home-feature">
              <span className="home-feature-icon">
                <FeatureIcon size={22} stroke={1.75} />
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="home-actions">
          <Link href="/register" className="home-cta">
            Get started
            <IconArrowRight
              size={20}
              stroke={2.25}
              className="home-cta-arrow"
            />
          </Link>
          <p className="home-login">
            Already have an account?{' '}
            <Link href="/login" className="home-login-link">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>

      <footer className="home-footer">
        © {new Date().getFullYear()} Mooscles
      </footer>
    </main>
  );
}
