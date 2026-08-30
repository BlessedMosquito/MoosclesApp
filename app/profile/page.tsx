'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import LogoutIcon from '@/components/icons/LogoutIcon';
import EditIcon from '@/components/icons/EditIcon';

import Button from '@/components/ui/Button';
import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import SectionDivider from '@/components/ui/SectionDivider';

import { createClient } from '@/lib/supabase/client';
import { s, useResponsive } from '@/lib/useResponsive';

import { colors } from '@/theme/colors';
import { fontSizes } from '@/theme/typography';
import TimeInput from '@/components/ui/inputs/TimeInput';
import { getUserData, upsertUserData } from '@/services/userData';
import { formatDistance, formatDuration } from '@/lib/format';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import DistanceInput from '@/components/ui/inputs/DistanceInput';
import SaveIcon from '@/components/icons/SaveIcon';
import SuccessAnimation from '@/components/ui/feedback/SuccessAnimation';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const { isMobile, isTablet, scale } = useResponsive();

  const contentMaxWidth = isMobile ? '90%' : isTablet ? 620 : 760;

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [weeklyDurationGoal, setWeeklyDurationGoal] = useState({
    hours: 0,
    minutes: 0,
  });
  const [weeklyDistanceGoal, setWeeklyDistanceGoal] = useState({
    km: 0,
    m: 0,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth]);

  async function loadData() {
    setIsLoading(true);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setError(error?.message ?? 'User not found');
        return;
      }

      const userData = await getUserData(user.id);
      const formatedTime = formatDuration(
        userData.weekly_duration_goal_minutes
      );
      setWeeklyDurationGoal({
        hours: formatedTime.h,
        minutes: formatedTime.m,
      });
      const formatedDistance = formatDistance(
        userData.weekly_distance_goal_meters
      );
      setWeeklyDistanceGoal(formatedDistance);
      setEmail(user.email ?? '');
      setLogin(user.user_metadata?.login ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated.');
        return;
      }
      const { error } = await supabase.auth.updateUser({
        data: { login },
      });

      if (error) {
        setError(error.message);
        return;
      }

      const formatedWeeklyDistanceGoal =
        weeklyDistanceGoal.km * 1000 + weeklyDistanceGoal.m;
      const formatedWeeklyDurationGoal =
        weeklyDurationGoal.hours * 60 + weeklyDurationGoal.minutes;
      await upsertUserData({
        userId: user.id,
        weeklyDistanceGoal: formatedWeeklyDistanceGoal,
        weeklyDurationGoal: formatedWeeklyDurationGoal,
      });

      setIsEditing(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    loadData();
    setIsEditing(false);
    setError(null);
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    boxSizing: 'border-box',
    padding: s(14, scale),
    borderRadius: s(14, scale),
    border: `1px solid ${colors.border}`,
    background: colors.componentsBg,
    color: colors.text,
    fontSize: Math.max(s(fontSizes.input, scale), 16),
    outline: 'none',
    cursor: isEditing ? 'text' : 'default',
    opacity: isEditing ? 1 : 0.75,
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 250,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'transparent',
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
        <section
          style={{
            marginTop: s(28, scale),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: s(
                isMobile ? fontSizes.heading1 : fontSizes.display,
                scale
              ),
              fontWeight: 700,
            }}
          >
            Profile
          </h1>

          <Button onClick={signOut} color={colors.red}>
            {<LogoutIcon />}
            {'Logout'}
          </Button>
        </section>
        <div
          style={{
            marginTop: s(24, scale),
            padding: s(20, scale),
            borderRadius: s(20, scale),
            border: `1px solid ${colors.border}`,
            background: colors.componentsBg,
            display: 'flex',
            flexDirection: 'column',
            gap: s(16, scale),
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: s(8, scale),
              color: colors.text,
              fontSize: s(fontSizes.caption, scale),
            }}
          >
            <SectionDivider label="Login" />

            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              style={inputStyle}
              disabled={!isEditing}
            />

            <SectionDivider label="Email" />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'not-allowed',
                opacity: 0.75,
              }}
              disabled={true}
              readOnly
            />

            <SectionDivider label="Weekly Goals" />
            <TimeInput
              hours={weeklyDurationGoal.hours}
              minutes={weeklyDurationGoal.minutes}
              onChange={setWeeklyDurationGoal}
              disabled={!isEditing}
            />

            <SectionDivider label="Weekly Distance Goal" />
            <DistanceInput
              value={weeklyDistanceGoal}
              disabled={!isEditing}
              onChange={setWeeklyDistanceGoal}
            />
          </label>
          <div
            style={{
              padding: s(20, scale),
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                width="3/4"
                align="center"
              >
                {<EditIcon />}
                {'Edit profile'}
              </Button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  gap: s(12, scale),
                }}
              >
                <Button onClick={handleSave} width="3/4" align="center">
                  {<SaveIcon />}
                  {'Save changes'}
                </Button>
                <Button onClick={handleCancel} width="3/4" align="center">
                  {'Cancel'}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <p
              style={{
                color: colors.red,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {/* OVERLAYS */}
      {isLoading && (
        <div style={overlayStyle}>
          <LoadingCircle />
        </div>
      )}

      {error && (
        <div style={overlayStyle}>
          <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>
        </div>
      )}

      {showSuccess && (
        <SuccessAnimation
          message="Data successfully saved!"
          onDone={() => {
            setShowSuccess(false);
          }}
          doneDelay={1500}
        />
      )}
    </main>
  );
}
