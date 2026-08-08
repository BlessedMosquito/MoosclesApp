'use client';

import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type Distance = {
  km: number;
  m: number;
};

type DistanceInputProps = {
  value: Distance;
  disabled: boolean;
  onChange: (value: Distance) => void;
};

export default function DistanceInput({
  value,
  disabled,
  onChange,
}: DistanceInputProps) {
  const { scale, isMobile } = useResponsive();

  const inputStyle = {
    width: s(isMobile ? 90 : 120, scale),
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
        gap: s(16, scale),
      }}
    >
      {/* Kilometers */}
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
          Kilometers
        </span>

        <input
          inputMode="numeric"
          min={0}
          value={value.km === 0 ? '' : value.km}
          placeholder="0"
          onChange={(e) =>
            onChange({
              ...value,
              km: Math.max(0, Number(e.target.value) || 0),
            })
          }
          onBlur={(e) => {
            if (e.target.value === '') {
              onChange({
                ...value,
                km: 0,
              });
            }
          }}
          style={inputStyle}
          disabled={disabled}
        />
      </div>

      {/* Meters */}
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
          Meters
        </span>

        <input
          inputMode="numeric"
          min={0}
          value={value.m === 0 ? '' : value.m}
          placeholder="0"
          onChange={(e) => {
            const meters = Math.max(0, Number(e.target.value) || 0);

            onChange({
              km: value.km + Math.floor(meters / 1000),
              m: meters % 1000,
            });
          }}
          onBlur={(e) => {
            if (e.target.value === '') {
              onChange({
                ...value,
                m: 0,
              });
            }
          }}
          style={inputStyle}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
