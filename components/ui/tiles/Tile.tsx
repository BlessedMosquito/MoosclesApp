'use client';

import { KeyboardEvent, ReactNode, useRef } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { fontSizes } from '@/theme/typography';
import { colors } from '@/theme/colors';
import { motion } from 'motion/react';

type TileProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
};

export default function Tile({
  title,
  subtitle,
  children,
  onClick,
  width,
  height,
  aspectRatio = '1 / 1',
}: TileProps) {
  const { isMobile, scale } = useResponsive();

  const finalWidth = isMobile ? 350 : (width ?? 500);
  const finalHeight = isMobile ? 180 : (height ?? 300);

  const tileRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <motion.div
      ref={tileRef}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileHover={{
        scale: 0.97,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{
        width: finalWidth,
        height: finalHeight,
        aspectRatio: finalHeight ? undefined : aspectRatio,
        minHeight: 0,
        padding: s(14, scale),
        borderRadius: s(18, scale),
        background: colors.componentsBg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {(title || subtitle) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(4, scale),
          }}
        >
          {title && (
            <p
              style={{
                margin: 0,
                fontSize: s(fontSizes.bodySmall, scale),
                fontWeight: 800,
                color: colors.text,
              }}
            >
              {title}
            </p>
          )}

          {subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: s(fontSizes.caption, scale),
                color: colors.text,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
