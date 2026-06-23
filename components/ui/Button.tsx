import { ReactNode } from 'react';
import { motion } from 'motion/react';

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

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  width?: ButtonWidth;
  height?: number;
  align?: ButtonAlign;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({
  children,
  onClick,
  disabled = false,
  width,
  height = 56,
  align,
  type = 'button',
}: ButtonProps) {
  const { scale } = useResponsive();

  const resolvedWidth =
    width === undefined
      ? 'auto'
      : typeof width === 'number'
        ? `${s(width, scale)}px`
        : widthMap[width];

  const button = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.02,
              borderColor: 'rgba(255,255,255,0.5)',
              boxShadow: '0 8px 30px rgba(255,255,255,0.08)',
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.97,
            }
      }
      transition={{
        duration: 0.18,
        ease: 'easeOut',
      }}
      style={{
        width: resolvedWidth,
        height: s(height, scale),
        paddingLeft: s(24, scale),
        paddingRight: s(24, scale),
        borderRadius: s(20, scale),
        background: colors.accentDark,
        color: colors.bg,
        fontSize: s(fontSizes.button, scale),
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </motion.button>
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
