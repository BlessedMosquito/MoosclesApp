import { PostgrestError } from '@supabase/supabase-js';

export const LOCKED_WORKOUT_MESSAGE =
  'This workout is completed and can no longer be edited.';

const RLS_VIOLATION_CODE = '42501';

export function isLockedWorkoutError(error: PostgrestError | null) {
  return error?.code === RLS_VIOLATION_CODE;
}

export function toServiceError(error: PostgrestError, fallback: string) {
  if (isLockedWorkoutError(error)) {
    return new Error(LOCKED_WORKOUT_MESSAGE);
  }

  return new Error(error.message || fallback);
}
