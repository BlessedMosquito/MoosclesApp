'use client';

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
  return (
    <div className="split-input">
      <div className="split-input-item">
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

      <span className="split-input-separator">:</span>

      <div className="split-input-item">
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
