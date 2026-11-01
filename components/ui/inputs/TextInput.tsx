'use client';

import { KeyboardEvent, Ref } from 'react';
import { cn } from '@/lib/utils';

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
  className?: string;
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
  className,
  ref,
}: TextInputProps) {
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
      className={cn('input', className)}
    />
  );
}
