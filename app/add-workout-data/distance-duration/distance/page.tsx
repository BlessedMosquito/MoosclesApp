'use client'
import BackButton from "@/components/ui/BackButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { s, useResponsive } from "@/lib/useResponsive";
import { colors } from "@/theme/colors";
import { fontSizes } from "@/theme/typography";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function AddWorkoutDataDistance(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet, scale } = useResponsive();

  const workoutId = searchParams.get('workoutId');
  const workoutName = searchParams.get('name') ?? 'Workout';
  const workoutType = searchParams.get('type') ?? 'workout';
  const from = searchParams.get('from');
  const calendarYear = searchParams.get('year');
  const calendarMonth = searchParams.get('month');

  const [error, setError] = useState<string | null>(null);
  const [kmInput, setKmInput] = useState('');
  const [meters, setMeters] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

  const totalMeters = (() => {
    const km = parseFloat(kmInput.replace(',', '.')) || 0;
    const m = parseInt(meters) || 0;
    return Math.round(km * 1000) + m;
  })();

  const totalKm = (() => {
    const km = totalMeters / 1000;
    if (Number.isInteger(km)) return String(km);
    return km.toFixed(3).replace(/\.?0+$/, '').replace('.', ',');
  })();

  function handleKmChange(val: string) {
    setKmInput(val);
    const normalized = val.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      const km = Math.floor(parsed);
      const m = Math.round((parsed - km) * 1000);
      if (m > 0) {
        setExpanded(true);
        setMeters(String(m));
        setKmInput(String(km));
      }
    }
  }

  function handleBack() {
    if (from === 'calendar') {
      const calendarParams = new URLSearchParams();
      if (calendarYear) calendarParams.set('year', calendarYear);
      if (calendarMonth) calendarParams.set('month', calendarMonth);
      if (workoutId) calendarParams.set('workoutId', workoutId);
      router.push(`/calendar?${calendarParams.toString()}`);
      return;
    }
    router.push('/add-workout');
  }

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
    <main style={{
      minHeight: '100dvh',
      background: colors.background,
      padding: s(isMobile ? 18 : 28, scale),
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: contentMaxWidth }}>
        <BackButton onClick={handleBack} />

        <section style={{ marginTop: s(28, scale) }}>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: s(fontSizes.caption, scale) }}>
            Step 3 of 3
          </p>
          <h1 style={{
            margin: `${s(8, scale)}px 0 0`,
            fontSize: s(isMobile ? fontSizes.heading1 : fontSizes.display, scale),
            fontWeight: 700,
          }}>
            {workoutName}
          </h1>
          <p style={{
            margin: `${s(10, scale)}px 0 0`,
            color: colors.textSecondary,
            fontSize: s(fontSizes.bodySmall, scale),
            lineHeight: 1.5,
          }}>
            Add distance to your {workoutType} session.
          </p>
        </section>

        {error && (
          <div role="alert" style={{
            marginTop: s(18, scale),
            padding: s(12, scale),
            borderRadius: s(12, scale),
            border: `1px solid ${colors.errorBorder}`,
            background: colors.errorSurface,
            color: colors.errorMuted,
            fontSize: s(fontSizes.bodySmall, scale),
          }}>
            {error}
          </div>
        )}
        {totalMeters > 0 && (
          <section style={{ marginTop: s(32, scale) }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: s(10, scale),
              borderRadius: s(12, scale),
              background: colors.glass,
              border: `1px solid ${colors.border}`,
            }}>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: fontSizes.caption }}>
                Distance
              </p>
              <h2 style={{
                margin: `${s(6, scale)}px 0 0`,
                fontSize: s(isMobile ? fontSizes.display : 52, scale),
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}>
                {totalKm} km
              </h2>
              <p style={{ margin: `${s(4, scale)}px 0 0`, color: colors.textMuted, fontSize: s(fontSizes.caption, scale) }}>
                {totalMeters} m
              </p>
            </div>
          </section>
        )}
        <section style={{
          marginTop: s(24, scale),
          display: 'flex',
          flexDirection: 'column',
          gap: s(10, scale),
        }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            gap: s(8, scale),
            color: colors.textSecondary,
            fontSize: s(fontSizes.caption, scale),
          }}>
            Kilometers
            <div style={{ position: 'relative' }}>
              <input
                placeholder="0"
                inputMode="decimal"
                value={kmInput}
                onChange={(e) => handleKmChange(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                style={{
                  position: 'absolute',
                  right: s(14, scale),
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: s(fontSizes.caption, scale),
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {expanded ? '▲ hide m' : '▼ + m'}
              </button>
            </div>
          </label>

          {expanded && (
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(8, scale),
              color: colors.textSecondary,
              fontSize: s(fontSizes.caption, scale),
            }}>
              Meters (0–999)
              <input
                placeholder="0"
                inputMode="numeric"
                value={meters}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setMeters(String(Math.min(999, Math.max(0, v))));
                }}
                style={inputStyle}
              />
            </label>
          )}
        </section>

        <div style={{ marginTop: s(24, scale) }}>
          <PrimaryButton
            onClick={() => {}}
            disabled={isSaving}
            width="3/4"
            align="center"
          >
            {isSaving ? 'Adding...' : 'Add'}
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}