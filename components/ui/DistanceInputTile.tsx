'use client';

import { useEffect, useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';

type DistanceInputProps = {
  label: string;
  valueMeters: number;
  onChange: (meters: number) => void;
};

export default function DistanceInputTile({
  label,
  valueMeters,
  onChange,
}: DistanceInputProps) {
  const { scale } = useResponsive();

  const [kilometers, setKilometers] = useState('');
  const [meters, setMeters] = useState('');

  useEffect(() => {
    const km = Math.floor(valueMeters / 1000);
    const m = valueMeters % 1000;

    setKilometers(km > 0 ? String(km) : '');
    setMeters(m > 0 ? String(m) : '');
  }, [valueMeters]);

  useEffect(() => {
    const km = parseInt(kilometers) || 0;
    const m = parseInt(meters) || 0;

    onChange(km * 1000 + m);
  }, [kilometers, meters, onChange]);

  const totalMeters =
    (parseInt(kilometers) || 0) * 1000 +
    (parseInt(meters) || 0);

  const totalKm = (totalMeters / 1000)
    .toFixed(3)
    .replace(/\.?0+$/, '')
    .replace('.', ',');

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: s(14, scale),
    borderRadius: s(14, scale),
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    fontSize: s(fontSizes.input, scale),
    outline: 'none',
  };

  return (
    <section style={{ marginTop: s(24, scale) }}>
      <p
        style={{
          margin: `0 0 ${s(8, scale)}px`,
          color: colors.textSecondary,
          fontSize: s(fontSizes.caption, scale),
        }}
      >
        {label}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: s(12, scale),
        }}
      >
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(8, scale),
            color: colors.textSecondary,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          Kilometers

          <input
            placeholder="0"
            inputMode="numeric"
            value={kilometers}
            onChange={(e) => setKilometers(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(8, scale),
            color: colors.textSecondary,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          Meters

          <input
            placeholder="0"
            inputMode="numeric"
            value={meters}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setMeters(String(Math.min(999, Math.max(0, value))));
            }}
            style={inputStyle}
          />
        </label>
      </div>

      <div
        style={{
          marginTop: s(14, scale),
          padding: s(12, scale),
          borderRadius: s(12, scale),
          border: `1px solid ${colors.border}`,
          background: colors.glass,
        }}
      >
        <p
          style={{
            margin: 0,
            color: colors.textMuted,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          Total distance
        </p>

        <p
          style={{
            margin: `${s(6, scale)}px 0 0`,
            fontSize: s(fontSizes.body, scale),
            fontWeight: 700,
          }}
        >
          {totalKm} km
        </p>

        <p
          style={{
            margin: `${s(4, scale)}px 0 0`,
            color: colors.textMuted,
            fontSize: s(fontSizes.caption, scale),
          }}
        >
          {totalMeters} m
        </p>
      </div>
    </section>
  );
}