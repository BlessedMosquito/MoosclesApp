'use client';

import NumericInput from './NumericInput';

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
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <NumericInput
        label="Kilometers"
        value={value.km}
        min={0}
        max={999}
        placeholder="0"
        width={120}
        mobileWidth={90}
        disabled={disabled}
        onChange={(km) => onChange({ ...value, km })}
      />

      <NumericInput
        label="Meters"
        value={value.m}
        min={0}
        max={999}
        placeholder="0"
        width={120}
        mobileWidth={90}
        disabled={disabled}
        onChange={(m) => onChange({ ...value, m })}
      />
    </div>
  );
}
