'use client';

import { CSSProperties, KeyboardEvent, Ref } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  inputMode?: 'text' | 'numeric' | 'email' | 'tel' | 'decimal';
  autoComplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
};

export default function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  disabled = false,
  readOnly = false,
  onBlur,
  onKeyDown,
  style,
  ref,
}: TextInputProps) {
  const { scale } = useResponsive();

  const mergedStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: s(14, scale),
    borderRadius: s(14, scale),
    border: `1px solid ${colors.border}`,
    background: colors.componentsBg,
    color: colors.text,
    fontSize: Math.max(s(fontSizes.input, scale), 16),
    outline: 'none',
    ...style,
  };

  return (
    <input
      ref={ref}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      style={mergedStyle}
    />
  );
}
