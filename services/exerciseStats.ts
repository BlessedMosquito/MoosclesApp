import { createClient } from '@/lib/supabase/client';

type RawSet = {
  reps: number | null;
  weight: number | null;
  set_order: number;
};

type RawExercise = {
  id: string;
  name: string;
  exercise_list_id: string | null;
  workouts: {
    id: string;
    name: string;
    workout_date: string;
    completed_at: string | null;
    user_id: string;
  } | null;
  sets: RawSet[] | null;
  exercises_list: { primary_muscles: string | null } | null;
};

export type ExerciseSet = {
  reps: number;
  weight: number;
};

export type ExerciseSession = {
  exerciseId: string;
  workoutId: string;
  workoutName: string;
  date: string;
  isCompleted: boolean;
  sets: ExerciseSet[];
  bestWeight: number;
  repsAtBestWeight: number;
  maxReps: number;
  volume: number;
  estimatedOneRepMax: number;
};

export type ExerciseHistory = {
  key: string;
  name: string;
  exerciseListId: string | null;
  primaryMuscle: string | null;
  sessions: ExerciseSession[];
};

export type SessionTrend = 'up' | 'down' | 'same' | 'new';

const supabase = createClient();

const EXERCISE_SELECT = `
  id,
  name,
  exercise_list_id,
  workouts!inner (id, name, workout_date, completed_at, user_id),
  sets (reps, weight, set_order),
  exercises_list (primary_muscles)
`;

export function getExerciseKey(name: string, exerciseListId: string | null) {
  return exerciseListId ?? `name:${name.trim().toLowerCase()}`;
}

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

function toSession(
  exercise: RawExercise & { workouts: NonNullable<RawExercise['workouts']> }
): ExerciseSession {
  const sets = [...(exercise.sets ?? [])]
    .sort((a, b) => a.set_order - b.set_order)
    .map((set) => ({ reps: set.reps ?? 0, weight: set.weight ?? 0 }));

  let bestWeight = 0;
  let repsAtBestWeight = 0;
  let maxReps = 0;
  let volume = 0;
  let estimatedOneRepMax = 0;

  for (const set of sets) {
    if (
      set.weight > bestWeight ||
      (set.weight === bestWeight && set.reps > repsAtBestWeight)
    ) {
      bestWeight = set.weight;
      repsAtBestWeight = set.reps;
    }
    maxReps = Math.max(maxReps, set.reps);
    volume += set.weight * set.reps;
    estimatedOneRepMax = Math.max(
      estimatedOneRepMax,
      estimateOneRepMax(set.weight, set.reps)
    );
  }

  return {
    exerciseId: exercise.id,
    workoutId: exercise.workouts.id,
    workoutName: exercise.workouts.name,
    date: exercise.workouts.workout_date,
    isCompleted: Boolean(exercise.workouts.completed_at),
    sets,
    bestWeight,
    repsAtBestWeight,
    maxReps,
    volume: Math.round(volume * 10) / 10,
    estimatedOneRepMax,
  };
}

export async function getExerciseHistories(): Promise<ExerciseHistory[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated.');
  }

  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .eq('workouts.user_id', user.id);

  if (error) {
    throw new Error('Could not load exercise history.');
  }

  const histories = new Map<string, ExerciseHistory>();

  for (const exercise of (data ?? []) as unknown as RawExercise[]) {
    if (!exercise.workouts) continue;
    const session = toSession({ ...exercise, workouts: exercise.workouts });
    if (session.sets.length === 0) continue;

    const key = getExerciseKey(exercise.name, exercise.exercise_list_id);
    const history = histories.get(key) ?? {
      key,
      name: exercise.name,
      exerciseListId: exercise.exercise_list_id,
      primaryMuscle: exercise.exercises_list?.primary_muscles ?? null,
      sessions: [],
    };
    history.sessions.push(session);
    histories.set(key, history);
  }

  return [...histories.values()]
    .map((history) => ({
      ...history,
      sessions: history.sessions.sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) =>
      b.sessions[b.sessions.length - 1].date.localeCompare(
        a.sessions[a.sessions.length - 1].date
      )
    );
}

export async function getExerciseHistory(
  key: string
): Promise<ExerciseHistory | null> {
  const histories = await getExerciseHistories();
  return histories.find((history) => history.key === key) ?? null;
}

export function getSessionTrend(
  session: ExerciseSession,
  previous: ExerciseSession | undefined
): SessionTrend {
  if (!previous) return 'new';
  if (session.bestWeight > previous.bestWeight) return 'up';
  if (session.bestWeight < previous.bestWeight) return 'down';
  if (session.repsAtBestWeight > previous.repsAtBestWeight) return 'up';
  if (session.repsAtBestWeight < previous.repsAtBestWeight) return 'down';
  return 'same';
}

export function getPersonalRecords(sessions: ExerciseSession[]) {
  const pick = (score: (session: ExerciseSession) => number) =>
    sessions.reduce<ExerciseSession | null>(
      (best, session) =>
        !best || score(session) > score(best) ? session : best,
      null
    );

  return {
    heaviest: pick(
      (session) => session.bestWeight * 1000 + session.repsAtBestWeight
    ),
    mostReps: pick((session) => session.maxReps),
    bestVolume: pick((session) => session.volume),
    bestOneRepMax: pick((session) => session.estimatedOneRepMax),
  };
}
