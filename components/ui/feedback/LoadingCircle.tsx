'use client';

import { CSSProperties } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { motion } from 'motion/react';

type LoadingCircleProps = {
  size?: number;
  style?: CSSProperties;
};

export default function LoadingCircle({
  size = 24,
  style,
}: LoadingCircleProps) {
  const { scale } = useResponsive();
  const scaledSize = s(size, scale);
  const scaledStroke = Math.max(s(3, scale), 3);

  return (
    <motion.span
      aria-label="Loading"
      role="status"
      initial={{ rotate: 0, opacity: 1 }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      style={{
        position: 'relative',
        width: scaledSize,
        height: scaledSize,
        display: 'inline-block',
        ...style,
      }}
    >
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${scaledStroke}px solid ${colors.border}`,
        }}
      />
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${scaledStroke}px solid transparent`,
          borderTopColor: colors.limeGreen,
          borderRightColor: colors.limeGreen,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
    </motion.span>
  );
}
