'use client';

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

  const textColor = variant === 'danger'
    ? colors.error
    : isActive ? colors.text : colors.textSecondary;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s(12, scale),
        padding: `${s(10, scale)}px ${s(12, scale)}px`,
        borderRadius: s(12, scale),
        border: `1px solid ${isActive ? colors.borderStrong : 'transparent'}`,
        background: isActive ? colors.glassHover : 'transparent',
        color: textColor,
        fontSize: s(fontSizes.body, scale),
        fontWeight: isActive ? 700 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      <span style={{
        width: s(22, scale),
        height: s(22, scale),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: textColor,
      }}>
        {icon}
      </span>
      {label}
    </button>
  );
}