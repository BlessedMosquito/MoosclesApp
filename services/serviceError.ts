import { PostgrestError } from '@supabase/supabase-js';

export const LOCKED_WORKOUT_MESSAGE =
  'This workout is completed and can no longer be edited.';

const OUT_OF_RANGE_MESSAGE = 'One of the values is out of the allowed range.';

const RLS_VIOLATION_CODE = '42501';
const LOCKED_WORKOUT_CODE = 'MS002';
const CHECK_VIOLATION_CODE = '23514';

export function isLockedWorkoutError(error: PostgrestError | null) {
  return (
    error?.code === RLS_VIOLATION_CODE || error?.code === LOCKED_WORKOUT_CODE
  );
}

export function toServiceError(error: PostgrestError, fallback: string) {
  if (isLockedWorkoutError(error)) {
    return new Error(LOCKED_WORKOUT_MESSAGE);
  }

  if (error.code === CHECK_VIOLATION_CODE) {
    return new Error(OUT_OF_RANGE_MESSAGE);
  }

  return new Error(error.message || fallback);
}
