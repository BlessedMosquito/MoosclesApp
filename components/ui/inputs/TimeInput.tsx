'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import NumericInput from './NumericInput';

type TimeInputProps = {
  hours: number;
  minutes: number;
  disabled: boolean;
  onChange: (value: { hours: number; minutes: number }) => void;
};

export default function TimeInput({
  hours,
  minutes,
  disabled,
  onChange,
}: TimeInputProps) {
  const { scale } = useResponsive();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <NumericInput
        label="Hours"
        value={hours}
        min={0}
        max={23}
        placeholder="0"
        width={100}
        mobileWidth={70}
        disabled={disabled}
        onChange={(h) => onChange({ hours: h, minutes })}
      />

      <span
        style={{
          color: colors.text,
          fontWeight: 700,
          fontSize: s(fontSizes.input, scale),
          paddingBottom: s(12, scale),
        }}
      >
        :
      </span>

      <NumericInput
        label="Minutes"
        value={minutes}
        min={0}
        max={59}
        placeholder="0"
        width={100}
        mobileWidth={70}
        disabled={disabled}
        onChange={(m) => onChange({ hours, minutes: m })}
      />
    </div>
  );
}
