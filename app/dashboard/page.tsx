'use client';

import LoadingCircle from '@/components/ui/feedback/LoadingCircle';
import LevelGaugeTile from '@/components/ui/tiles/LevelGaugeTile';
import WeeklyWorkoutTile from '@/components/ui/tiles/WeeklyWorkoutTile';
import ErrorPopUp from '@/components/ui/feedback/ErrorPopUp';
import { createClient } from '@/lib/supabase/client';
import { useResponsive } from '@/lib/useResponsive';
import {
  emptyUserData,
  getMissingProfileItems,
  getUserData,
  ReturnGetUserData,
} from '@/services/userData';
import {
  getCompletedWorkouts,
  getWorkoutDaysForWeek,
  type ReturnCompletedWorkoutData,
} from '@/services/workouts';
import { getWeeklyDataSummary } from '@/services/workoutMetrics';
import { useEffect, useState } from 'react';
import TopBar from '@/components/ui/topBar/TopBar';
import AddIcon from '@/components/icons/AddIcon';
import { useRouter } from 'next/navigation';
import MetricsTile from '@/components/ui/tiles/MetricsTile';
import WorkoutActivityTile from '@/components/ui/tiles/WorkoutActivityTile';
import DailyWaterIntakeTile from '@/components/ui/tiles/DailyWaterIntakeTile';
import ProfileSetupPrompt from '@/components/ui/popups/ProfileSetupPrompt';
import ExpandableButton, {
  ExpandableButtonOption,
} from '@/components/ui/buttons/ExpandableButton';
import { IconBarbell, IconTemplate } from '@tabler/icons-react';
import { PROFILE_PROMPT_DISMISSED_KEY } from '@/app/constants/storageConstants';

export default function DashboardPage() {
  const supabase = createClient();
  const { isMobile, width } = useResponsive();

  const router = useRouter();
  const [userData, setUserData] = useState<ReturnGetUserData>(emptyUserData);
  const [workoutDays, setWorkoutDays] = useState<Record<string, boolean>>({});
  const [monthWorkouts, setMonthWorkouts] = useState<
    ReturnCompletedWorkoutData[]
  >([]);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [weeklyDistanceKm, setWeeklyDistanceKm] = useState(0);
  const [weeklyDurationHours, setWeeklyDurationHours] = useState(0);
  const [activeWeeks, setActiveWeeks] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [missingProfileItems, setMissingProfileItems] = useState<string[]>([]);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  const gridGap = isMobile ? 12 : 24;
  const paddingX = isMobile ? 18 : 24;
  const availableWidth = Math.max(0, width - paddingX * 2);
  const tileWidth = isMobile
    ? Math.round(availableWidth * 0.48)
    : Math.min(290, Math.floor((availableWidth - gridGap * 2) / 3));
  const tileHeight = isMobile ? 180 : 250;
  const halfTileHeight = (tileHeight - gridGap) / 2;
  const contentMaxWidth =
    tileWidth * (isMobile ? 2 : 3) + gridGap * (isMobile ? 1 : 2);

  async function loadUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        return;
      }

      setFirstName(user.user_metadata?.first_name ?? null);

      const now = new Date();
      const pad = (value: number) => String(value).padStart(2, '0');
      const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthEnd = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-01`;

      const [data, weekData, monthWorkouts, weeklySummary] = await Promise.all([
        getUserData(user.id),
        getWorkoutDaysForWeek(user.id),
        getCompletedWorkouts(user.id, monthStart, monthEnd),
        getWeeklyDataSummary({ userId: user.id }),
      ]);
      setUserData(data);

      const missing = getMissingProfileItems(data);
      setMissingProfileItems(missing);
      if (
        missing.length > 0 &&
        !window.sessionStorage.getItem(PROFILE_PROMPT_DISMISSED_KEY)
      ) {
        setShowProfilePrompt(true);
      }
      setWeeklyDistanceKm(weeklySummary.distance_meters / 1000);
      setWeeklyDurationHours(weeklySummary.duration_minutes / 60);

      const mapped: Record<string, boolean> = {};
      for (const d of weekData.workout_days) mapped[d.date] = true;
      setWorkoutDays(mapped);
      setWorkoutCount(weekData.workout_count);
      setActiveWeeks(weekData.active_weeks);

      setMonthWorkouts(monthWorkouts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data.');
    } finally {
      setIsLoadingUserData(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOptions: ExpandableButtonOption[] = [
    {
      label: 'Workout',
      icon: <IconBarbell size={22} stroke={1.75} />,
      onClick: () => router.push('/workout/create'),
    },
    {
      label: 'Template',
      icon: <IconTemplate size={22} stroke={1.75} />,
      onClick: () => router.push('/templates/new'),
    },
  ];

  const metricsProps = {
    tileHeight,
    chartSize: tileWidth,
    distance: weeklyDistanceKm,
    distanceMax: userData.weekly_distance_goal_meters / 1000,
    duration: weeklyDurationHours,
    durationMax: userData.weekly_duration_goal_minutes / 60,
  };

  return (
    <main className="dashboard">
      <TopBar
        width={contentMaxWidth}
        left={<h1 className="dashboard-title">Mooscles</h1>}
        right={`Hello, ${firstName ?? ''}`}
      />

      {error && <ErrorPopUp onClose={() => setError(null)}>{error}</ErrorPopUp>}

      <ProfileSetupPrompt
        open={showProfilePrompt}
        missingItems={missingProfileItems}
        onClose={() => {
          window.sessionStorage.setItem(PROFILE_PROMPT_DISMISSED_KEY, '1');
          setShowProfilePrompt(false);
        }}
      />

      {isLoadingUserData ? (
        <div
          className="dashboard-loading"
          style={{ maxWidth: contentMaxWidth }}
        >
          <LoadingCircle />
        </div>
      ) : isMobile ? (
        <div
          className="dashboard-grid-mobile"
          style={{ maxWidth: contentMaxWidth }}
        >
          <LevelGaugeTile
            experience={userData.experience}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <div className="dashboard-column" style={{ width: tileWidth }}>
            <ExpandableButton
              label="Create"
              icon={<AddIcon />}
              height={halfTileHeight}
              options={createOptions}
            />
            <DailyWaterIntakeTile
              tileWidth={tileWidth}
              tileHeight={halfTileHeight}
              goalMl={userData.daily_water_goal_ml}
              onError={setError}
            />
          </div>
          <MetricsTile tileWidth={contentMaxWidth} {...metricsProps} />
          <div className="w-full">
            <WorkoutActivityTile
              tileWidth={contentMaxWidth}
              tileHeight={tileHeight}
              workouts={monthWorkouts}
              weeklyWorkouts={workoutCount}
            />
          </div>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ maxWidth: contentMaxWidth }}>
          <LevelGaugeTile
            experience={userData.experience}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
          />
          <div className="col-span-2">
            <MetricsTile
              tileWidth={tileWidth * 2 + gridGap}
              {...metricsProps}
            />
          </div>
          <div className="dashboard-column">
            <ExpandableButton
              label="Create"
              icon={<AddIcon />}
              height={halfTileHeight}
              options={createOptions}
            />
            <DailyWaterIntakeTile
              tileWidth={tileWidth}
              tileHeight={halfTileHeight}
              goalMl={userData.daily_water_goal_ml}
              onError={setError}
            />
          </div>
          <div className="col-span-2">
            <WeeklyWorkoutTile
              workoutDays={workoutDays}
              workoutsThisWeek={workoutCount}
              activeWeeks={activeWeeks}
              width={tileWidth * 2 + gridGap}
              height={tileHeight}
            />
          </div>
          <div className="dashboard-activity">
            <WorkoutActivityTile
              tileWidth={tileWidth}
              tileHeight={tileHeight}
              workouts={monthWorkouts}
              weeklyWorkouts={workoutCount}
            />
          </div>
        </div>
      )}
    </main>
  );
}
