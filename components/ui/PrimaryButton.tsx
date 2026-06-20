'use client';

import { ReactNode } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type ButtonWidth = number | '1/4' | '1/2' | '3/4' | 'full';

type ButtonAlign = 'left' | 'center' | 'right';

const widthMap: Record<ButtonWidth, string> = {
  full: '100%',
  '3/4': '75%',
  '1/2': '50%',
  '1/4': '25%',
};

const alignMap: Record<ButtonAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  width?: ButtonWidth;
  height?: number;
  align?: ButtonAlign;
  type?: 'button' | 'submit' | 'reset';
};

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  width,
  height = 54,
  align,
  type = 'button',
}: PrimaryButtonProps) {
  const { scale } = useResponsive();

  const resolvedWidth =
    width === undefined
      ? 'auto'
      : typeof width === 'number'
        ? `${s(width, scale)}px`
        : widthMap[width];

  const button = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: resolvedWidth,
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

  if (!align) return button;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: alignMap[align],
        width: '100%',
      }}
    >
      {button}
    </div>
  );
}
