'use client';

import { KeyboardEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import { press, PRESS_SCALE } from '@/lib/motion';
import { cn } from '@/lib/utils';

type TileProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
  width?: number;
  height?: number;
  className?: string;
  titleAlign?: 'left' | 'center';
  titleVAlign?: 'top' | 'center';
  titleSize?: 'sm' | 'lg';
};

export default function Tile({
  title,
  subtitle,
  children,
  onClick,
  width,
  height,
  className,
  titleAlign = 'left',
  titleVAlign = 'top',
  titleSize = 'sm',
}: TileProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileTap={onClick ? { scale: PRESS_SCALE } : undefined}
      transition={press}
      className={cn('tile', onClick && 'cursor-pointer', className)}
      style={{ width, height }}
    >
      {(title || subtitle) && (
        <div
          className={cn(
            'tile-header',
            titleVAlign === 'center' && 'tile-header-middle',
            titleAlign === 'center' && 'tile-header-centered'
          )}
        >
          {title && (
            <p
              className={cn(
                'tile-title',
                titleSize === 'lg' && 'tile-title-lg'
              )}
            >
              {title}
            </p>
          )}
          {subtitle && <p className="tile-subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="tile-body">{children}</div>
    </motion.div>
  );
}
