'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBlurred(true);
      setTimeout(() => setBlurred(false), 600);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="home">
      <motion.h1
        animate={{ filter: blurred ? 'blur(6px)' : 'blur(0px)' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="home-title"
      >
        Mooscles
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="home-actions"
      >
        <Link href="/login" className="home-link">
          Login
        </Link>
        <Link href="/register" className="home-link home-link-primary">
          Register
        </Link>
      </motion.div>
    </main>
  );
}
