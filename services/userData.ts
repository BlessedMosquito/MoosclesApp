import { createClient } from '@/lib/supabase/client';
import { toServiceError } from './serviceError';

export const DEFAULT_DAILY_WATER_GOAL_ML = 2000;

export type UpsertUserDataProps = {
  userId: string;
  weeklyDistanceGoal: number;
  weeklyDurationGoal: number;
  dailyWaterGoal: number;
  birthYear: number | null;
  weightKg: number | null;
};

export type ReturnGetUserData = {
  user_id: string;
  experience: number;
  weekly_distance_goal_meters: number;
  weekly_duration_goal_minutes: number;
  daily_water_goal_ml: number;
  birth_year: number | null;
  weight_kg: number | null;
  created_at: string | null;
  updated_at: string | null;
};

const MISSING_COLUMN_CODE = 'PGRST204';
const PERMISSION_DENIED_CODE = '42501';

const supabase = createClient();

export function emptyUserData(userId = ''): ReturnGetUserData {
  return {
    user_id: userId,
    experience: 0,
    weekly_duration_goal_minutes: 0,
    weekly_distance_goal_meters: 0,
    daily_water_goal_ml: DEFAULT_DAILY_WATER_GOAL_ML,
    birth_year: null,
    weight_kg: null,
    created_at: null,
    updated_at: null,
  };
}

export async function getUserData(userId: string): Promise<ReturnGetUserData> {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw toServiceError(error, 'Could not load user data.');
  }

  if (!data) return emptyUserData(userId);

  return {
    ...emptyUserData(userId),
    ...data,
    experience: data.experience ?? 0,
    daily_water_goal_ml:
      data.daily_water_goal_ml ?? DEFAULT_DAILY_WATER_GOAL_ML,
    birth_year: data.birth_year ?? null,
    weight_kg:
      data.weight_kg === null || data.weight_kg === undefined
        ? null
        : Number(data.weight_kg),
  };
}

export async function upsertUserData(props: UpsertUserDataProps) {
  const { error } = await supabase.from('user_data').upsert({
    user_id: props.userId,
    weekly_distance_goal_meters: props.weeklyDistanceGoal,
    weekly_duration_goal_minutes: props.weeklyDurationGoal,
    daily_water_goal_ml: props.dailyWaterGoal,
    birth_year: props.birthYear,
    weight_kg: props.weightKg,
  });

  if (error) {
    if (error.code === MISSING_COLUMN_CODE) {
      throw new Error(
        'Some profile fields are not set up in the database yet.'
      );
    }
    if (error.code === PERMISSION_DENIED_CODE) {
      throw new Error(
        'You do not have permission to save these profile fields.'
      );
    }
    throw toServiceError(error, 'Could not save user data.');
  }
}

export function getAgeFromBirthYear(birthYear: number | null) {
  return birthYear === null ? null : new Date().getFullYear() - birthYear;
}

export function getBirthYearFromAge(age: number) {
  return new Date().getFullYear() - age;
}

export function getMissingProfileItems(userData: ReturnGetUserData) {
  const missing: string[] = [];
  if (userData.birth_year === null) missing.push('Age');
  if (userData.weight_kg === null) missing.push('Weight');
  if (userData.weekly_duration_goal_minutes <= 0) {
    missing.push('Weekly workout time goal');
  }
  if (userData.weekly_distance_goal_meters <= 0) {
    missing.push('Weekly distance goal');
  }
  return missing;
}
