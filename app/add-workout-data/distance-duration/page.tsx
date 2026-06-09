'use client'

import BackButton from "@/components/ui/BackButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import WheelPicker from "@/components/ui/WheelPicker";
import { s, useResponsive } from "@/lib/useResponsive";
import { WorkoutTypeGroup } from "@/services/workoutTypes";
import { colors } from "@/theme/colors";
import { fontSizes } from "@/theme/typography";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import { useState } from "react";




export default function AddWorkoutDataDuration(){

    const router = useRouter();
    const searchParams = useSearchParams();
    const { isMobile, isTablet, scale } = useResponsive();

    const workoutId = searchParams.get('workoutId');
    const workoutName = searchParams.get('name') ?? 'Workout';
    const workoutType = searchParams.get('type') ?? 'workout';
    const from = searchParams.get('from');
    const calendarYear = searchParams.get('year');
    const calendarMonth = searchParams.get('month');
    const workoutTypeGroup = searchParams.get('group') as WorkoutTypeGroup;

    const [error, setError] = useState<string | null>(null);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isSaving, setIsSaving] = useState(false);


    const contentMaxWidth = isMobile ? '100%' : isTablet ? 620 : 760;

    function handleBack() {
        if (from === 'calendar') {
          const calendarParams = new URLSearchParams();
    
          if (calendarYear) {
            calendarParams.set('year', calendarYear);
          }
          if (calendarMonth) {
            calendarParams.set('month', calendarMonth);
          }
          if (workoutId) {
            calendarParams.set('workoutId', workoutId);
          }
          router.push(`/calendar?${calendarParams.toString()}`);
          return;
        }
        router.push('/add-workout');
      }

      function handleAdd(){
        //
      }

      function pad(n: number) {
        return String(n).padStart(2, '0');
      }
    
    return (
        <main
              style={{
                minHeight: '100dvh',
                background: colors.background,
                padding: s(isMobile ? 18 : 28, scale),
                color: colors.text,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
                <div
                    style={{
                    width: '100%',
                    maxWidth: contentMaxWidth,
                    }}
                >
                    <BackButton onClick={handleBack} />

                    <section
                        style={{
                        marginTop: s(28, scale),
                        }}
                    >
                        <p
                        style={{
                            margin: 0,
                            color: colors.textMuted,
                            fontSize: s(fontSizes.caption, scale),
                        }}
                        >
                        
                        {workoutTypeGroup === 'DistanceDuration' as WorkoutTypeGroup ? 'Step 2 of 3' : 'Step 2 of 2'}
                        </p>
            
                        <h1
                        style={{
                            margin: `${s(8, scale)}px 0 0`,
                            fontSize: s(
                            isMobile ? fontSizes.heading1 : fontSizes.display,
                            scale
                            ),
                            fontWeight: 700,
                        }}
                        >
                        {workoutName}
                        </h1>
            
                        <p
                        style={{
                            margin: `${s(10, scale)}px 0 0`,
                            color: colors.textSecondary,
                            fontSize: s(fontSizes.bodySmall, scale),
                            lineHeight: 1.5,
                        }}
                        >
                        Add distance to your {workoutType} session.
                        </p>
                    </section>
                    {error && (
                        <div
                            role="alert"
                            style={{
                            marginTop: s(18, scale),
                            padding: s(12, scale),
                            borderRadius: s(12, scale),
                            border: `1px solid ${colors.errorBorder}`,
                            background: colors.errorSurface,
                            color: colors.errorMuted,
                            fontSize: s(fontSizes.bodySmall, scale),
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <section style={{ marginTop: s(32, scale) }}>
                    <div
                        style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: s(10, scale),
                        borderRadius: s(12, scale),
                        background: colors.glass,
                        border: `1px solid ${colors.border}`,
                        }}
                    >
                        <p style={{
                        margin: 0,
                        color: colors.textMuted,
                        fontSize: fontSizes.heading1,
                        }}>
                        Time
                        </p>

                        <h2 style={{
                        margin: `${s(6, scale)}px 0 0`,
                        fontSize: s(isMobile ? fontSizes.display : 52, scale),
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '0.02em',
                        }}>
                        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                        </h2>
                    </div>
                    </section>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 16,
                            alignItems: 'flex-start',
                            marginTop: s(28, scale),
                            margin: `0 0 ${s(12, scale)}px`
                          }}
                        >
                        <WheelPicker
                            max={24}
                            value={hours}
                            label="hours"
                            onChange={setHours}
                        />

                        <WheelPicker
                            max={60}
                            value={minutes}
                            label="minutes"
                            onChange={setMinutes}
                        />

                        <WheelPicker
                            max={60}
                            value={seconds}
                            label="seconds"
                            onChange={setSeconds}
                        />
                    </div>
                    <PrimaryButton
                    onClick={() => {}}
                    disabled={isSaving}
                    width={'3/4'}
                    align={'center'}
                  >
                    {isSaving ? 'Adding...' : 'Add'}
                    </PrimaryButton>
                </div>
            </main>
    )
}