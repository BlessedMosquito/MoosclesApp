'use client';

import { motion } from 'motion/react';

type LoadingCircleProps = {
  size?: number;
};

const spin = { repeat: Infinity, duration: 0.8, ease: 'linear' } as const;

export default function LoadingCircle({ size = 24 }: LoadingCircleProps) {
  return (
    <motion.span
      aria-label="Loading"
      role="status"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={spin}
      className="spinner"
      style={{ width: size, height: size }}
    >
      <span className="spinner-track" />
      <motion.span
        className="spinner-arc"
        animate={{ rotate: 360 }}
        transition={spin}
      />
    </motion.span>
  );
}
