'use client';

import { CSSProperties } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';

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

  return (
    <span
      aria-label="Loading"
      role="status"
      style={{
        width: scaledSize,
        height: scaledSize,
        borderRadius: '50%',
        border: `${Math.max(s(2, scale), 2)}px solid ${colors.limeGreen}`,
        borderTopColor: colors.text,
        display: 'inline-block',
        animation: 'loading-circle-spin 700ms linear infinite',
        ...style,
      }}
    />
  );
}
