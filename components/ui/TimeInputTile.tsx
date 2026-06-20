'use client';

import { useEffect, useState } from 'react';
import { s, useResponsive } from '@/lib/useResponsive';
import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import WheelPicker from './WheelPicker';
import DropDownIcon from '../icons/DropDownIcon';
import CloseIcon from '../icons/CloseIcon';

type TimeInputProps = {
  label: string;
  inputHours: number;
  inputMinutes: number;
  inputSeconds: number;
  onChange: (valueInSeconds: number) => void;
};

export default function TimeInputTile({
  label,
  inputHours,
  inputMinutes,
  inputSeconds,
  onChange,
}: TimeInputProps) {
  const { scale } = useResponsive();

  const [hours, setHours] = useState(inputHours);
  const [minutes, setMinutes] = useState(inputMinutes);
  const [seconds, setSeconds] = useState(inputSeconds);
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasTime = hours > 0 || minutes > 0 || seconds > 0;

  useEffect(() => {
    setHours(inputHours);
    setMinutes(inputMinutes);
    setSeconds(inputSeconds);
  }, [inputHours, inputMinutes, inputSeconds]);

  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    onChange(totalSeconds);
  }, [hours, minutes, seconds, onChange]);

  function pad(n: number) {
    return String(n).padStart(2, '0');
  }

  return (
    <section style={{ marginTop: s(32, scale) }}>
      <p
        style={{
          margin: `0 0 ${s(8, scale)}px`,
          color: colors.textSecondary,
          fontSize: s(fontSizes.caption, scale),
        }}
      >
        {label}
      </p>

      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${s(14, scale)}px ${s(16, scale)}px`,
          borderRadius: s(14, scale),
          border: `1px solid ${
            pickerOpen ? colors.borderStrong : colors.border
          }`,
          background: colors.surface,
          color: hasTime ? colors.text : colors.textMuted,
          cursor: 'pointer',
          transition: 'border-color 150ms ease',
        }}
      >
        <span
          style={{
            fontSize: s(fontSizes.input, scale),
            fontWeight: hasTime ? 600 : 400,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.04em',
          }}
        >
          {`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
        </span>

        {!pickerOpen ? (
          <DropDownIcon color={colors.text} />
        ) : (
          <CloseIcon color={colors.text} />
        )}
      </button>

      {pickerOpen && (
        <div
          style={{
            marginTop: s(8, scale),
            padding: s(16, scale),
            background: colors.transparent,
            display: 'flex',
            justifyContent: 'center',
            gap: s(16, scale),
            alignItems: 'flex-start',
          }}
        >
          <WheelPicker
            max={24}
            value={hours}
            onChange={setHours}
            label="hours"
          />

          <WheelPicker
            max={60}
            value={minutes}
            onChange={setMinutes}
            label="minutes"
          />

          <WheelPicker
            max={60}
            value={seconds}
            onChange={setSeconds}
            label="seconds"
          />
        </div>
      )}
    </section>
  );
}
