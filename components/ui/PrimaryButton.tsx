'use client';

import { ReactNode } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  height?: number;
  type?: 'button' | 'submit' | 'reset';
};

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  height = 54,
  type = 'button',
}: PrimaryButtonProps) {
  const { scale } = useResponsive();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: s(height, scale),
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: s(18, scale),
        background: colors.text,
        color: colors.background,
        padding: `0 ${s(18, scale)}px`,
        fontSize: s(fontSizes.button, scale),
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'opacity 160ms ease, transform 160ms ease',
      }}
    >
      {children}
    </button>
  );
}
