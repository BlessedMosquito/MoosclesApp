import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ButtonWidth = number | '1/4' | '1/2' | '3/4' | 'full';
type ButtonAlign = 'left' | 'center' | 'right';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

const widthClass: Record<Exclude<ButtonWidth, number>, string> = {
  full: 'w-full',
  '3/4': 'w-3/4',
  '1/2': 'w-1/2',
  '1/4': 'w-1/4',
};

const alignClass: Record<ButtonAlign, string> = {
  left: 'btn-align-left',
  center: 'btn-align-center',
  right: 'btn-align-right',
};

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  width?: ButtonWidth;
  height?: number;
  align?: ButtonAlign;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
};

export default function Button({
  children,
  onClick,
  disabled = false,
  width,
  height,
  align,
  type = 'button',
  variant = 'primary',
}: ButtonProps) {
  const button = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'btn',
        variant === 'secondary' && 'btn-secondary',
        variant === 'danger' && 'btn-danger',
        typeof width === 'string' && widthClass[width]
      )}
      style={{
        width: typeof width === 'number' ? width : undefined,
        height,
      }}
    >
      {children}
    </motion.button>
  );

  if (!align) return button;

  return <div className={cn('btn-align', alignClass[align])}>{button}</div>;
}
