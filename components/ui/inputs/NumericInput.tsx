'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type NumericInputProps = {
  value: number;
  min: number;
  max: number;
  placeholder: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  width?: number;
  mobileWidth?: number;
  textAlign?: 'center' | 'right';
};

export default function NumericInput({
  value,
  min,
  max,
  placeholder,
  onChange,
  disabled,
  label,
  width,
  mobileWidth,
  textAlign = 'center',
}: NumericInputProps) {
  const { scale, isMobile } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(6, scale),
      }}
    >
      {label && (
        <span
          style={{
            color: colors.text,
            fontSize: s(fontSizes.caption, scale),
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      )}

      <input
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          let numberValue = Number(e.target.value);
          if (Number.isNaN(numberValue)) numberValue = 0;
          onChange(Math.min(Math.max(min, Math.floor(numberValue)), max));
        }}
        onBlur={(e) => {
          if (e.target.value === '') onChange(0);
        }}
        disabled={disabled}
        style={{
          width: width
            ? s(isMobile && mobileWidth ? mobileWidth : width, scale)
            : '100%',
          boxSizing: 'border-box',
          minWidth: 0,
          padding: s(12, scale),
          textAlign,
          borderRadius: s(14, scale),
          border: `1px solid ${colors.border}`,
          background: colors.componentsBg,
          color: colors.text,
          fontSize: Math.max(s(fontSizes.input, scale), 16),
          outline: 'none',
        }}
      />
    </div>
  );
}
