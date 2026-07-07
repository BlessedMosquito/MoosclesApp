'use client';

import { KeyboardEvent, ReactNode, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { s, useResponsive } from '@/lib/useResponsive';
import { fontSizes } from '@/theme/typography';
import { colors } from '@/theme/colors';

type TileProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
};

type TileRect = {
  top: number;
  left: number;
  width: number;
  height: number;
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

  const [isExpanding, setIsExpanding] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const tileRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }

  return (
    <>
      <motion.div
        ref={tileRef}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
        whileHover={onClick ? { scale: 0.97 } : undefined}
        whileTap={onClick ? { scale: 0.94 } : undefined}
        transition={{ duration: 0.18, ease: 'easeOut' }}
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
          opacity: isExpanding ? 0 : 1,
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
    </>
  );
}
