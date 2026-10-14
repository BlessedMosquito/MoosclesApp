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
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 16,
        width: '100%',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <NumericInput
          label="Hours"
          value={hours}
          min={0}
          max={23}
          placeholder="0"
          disabled={disabled}
          onChange={(h) => onChange({ hours: Number(h), minutes })}
        />
      </div>

      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: s(12, scale),
          transform: 'translateX(-50%)',
          color: colors.text,
          fontWeight: 700,
          fontSize: s(fontSizes.input, scale),
          pointerEvents: 'none',
        }}
      >
        :
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <NumericInput
          label="Minutes"
          value={minutes}
          min={0}
          max={59}
          placeholder="0"
          disabled={disabled}
          onChange={(m) => onChange({ hours, minutes: Number(m) })}
        />
      </div>
    </div>
  );
}
