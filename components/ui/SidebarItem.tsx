'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type SidebarItemProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  activePath?: string;
  variant?: 'default' | 'danger';
};

export default function SidebarItem({
  label,
  icon,
  onClick,
  activePath,
  variant = 'default',
}: SidebarItemProps) {
  const { scale } = useResponsive();
  const pathname = usePathname();
  const isActive = activePath ? pathname === activePath : false;
  const [isHovered, setIsHovered] = useState(false);

  const textColor =
    variant === 'danger'
      ? colors.error
      : isActive || isHovered
        ? colors.text
        : colors.textSecondary;

  const background = isActive
    ? colors.glassHover
    : isHovered
      ? colors.glass
      : 'transparent';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s(12, scale),
        padding: `${s(10, scale)}px ${s(12, scale)}px`,
        borderRadius: s(12, scale),
        border: `1px solid ${isActive ? colors.borderStrong : 'transparent'}`,
        background,
        color: textColor,
        fontSize: s(fontSizes.body, scale),
        fontWeight: isActive ? 700 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      <span
        style={{
          width: s(22, scale),
          height: s(22, scale),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: textColor,
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
