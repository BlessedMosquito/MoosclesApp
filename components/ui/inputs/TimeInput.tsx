'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

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
  const { scale, isMobile } = useResponsive();

  function updateValue(key: 'hours' | 'minutes', value: string) {
    let numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      numberValue = 0;
    }

    if (key === 'minutes') {
      numberValue = Math.min(Math.max(numberValue, 0), 59);
    }

    if (key === 'hours') {
      numberValue = Math.max(numberValue, 0);
    }

    onChange({
      hours: key === 'hours' ? numberValue : hours,
      minutes: key === 'minutes' ? numberValue : minutes,
    });
  }

  const inputStyle = {
    width: s(isMobile ? 70 : 100, scale),
    padding: s(12, scale),
    textAlign: 'center' as const,
    borderRadius: s(14, scale),
    border: `1px solid ${colors.border}`,
    background: colors.componentsBg,
    color: colors.text,
    fontSize: Math.max(s(fontSizes.input, scale), 16),
    outline: 'none',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: s(8, scale),
      }}
    >
      {/* HOURS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: s(6, scale),
        }}
      >
        <span
          style={{
            color: colors.text,
            fontSize: s(fontSizes.caption, scale),
            fontWeight: 700,
          }}
        >
          Hours
        </span>

        <input
          inputMode="numeric"
          min={0}
          value={String(hours).padStart(1, '0')}
          onChange={(e) => updateValue('hours', e.target.value)}
          style={inputStyle}
          disabled={disabled}
        />
      </div>

      {/* COLON */}
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

      {/* MINUTES */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: s(6, scale),
        }}
      >
        <span
          style={{
            color: colors.text,
            fontSize: s(fontSizes.caption, scale),
            fontWeight: 700,
          }}
        >
          Minutes
        </span>

        <input
          inputMode="numeric"
          min={0}
          max={59}
          value={String(minutes).padStart(1, '0')}
          onChange={(e) => updateValue('minutes', e.target.value)}
          style={inputStyle}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
