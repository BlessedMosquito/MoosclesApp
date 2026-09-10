'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type NumericInputProps = {
  value: number | string;
  min: number;
  max: number;
  placeholder: string;
  onChange: (value: number | string) => void;
  disabled?: boolean;
  label?: string;
  width?: number;
  mobileWidth?: number;
  textAlign?: 'center' | 'right';
  decimal?: boolean;
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
  decimal = false,
}: NumericInputProps) {
  const { scale, isMobile } = useResponsive();

  const cleanPattern = decimal ? /[^0-9.,]/g : /[^0-9]/g;

  function sanitize(raw: string): string {
    let cleaned = raw.replace(cleanPattern, '');
    if (decimal) {
      const firstSep = cleaned.search(/[.,]/);
      if (firstSep !== -1) {
        const head = cleaned.slice(0, firstSep);
        const sep = cleaned[firstSep];
        const tail = cleaned.slice(firstSep + 1).replace(/[.,]/g, '');
        cleaned = head + sep + tail;
      }
    }
    return cleaned;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = sanitize(e.target.value);

    if (typeof value === 'string') {
      onChange(raw);
      return;
    }

    const parsed = Number(raw);
    const num = Number.isNaN(parsed) ? 0 : Math.floor(parsed);
    onChange(Math.min(Math.max(min, num), max));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (typeof value === 'string') {
      if (e.target.value === '') onChange('');
      return;
    }
    if (e.target.value === '') onChange(0);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: s(6, scale),
        width: '100%',
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
        inputMode={decimal ? 'decimal' : 'numeric'}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
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