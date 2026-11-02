import { PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { createWorkout, deleteWorkout } from './workouts';
import { ReturnGetWorkoutTypeData } from './workoutTypes';
import { toServiceError } from './serviceError';

export type WorkoutTemplateExercise = {
  id: string;
  template_id: string;
  name: string;
  exercise_list_id: string | null;
  exercise_order: number;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  workout_type_id: string;
  created_at: string;
  workout_types: ReturnGetWorkoutTypeData;
  workout_template_exercises: WorkoutTemplateExercise[];
};

export const TEMPLATES_NOT_SET_UP_MESSAGE =
  'Templates are not set up in the database yet.';

export const STRENGTH_ONLY_MESSAGE =
  'Templates are available for strength workouts only.';

const MISSING_TABLE_CODES = ['PGRST205', '42P01'];
const STRENGTH_ONLY_CODE = 'MS001';

const TEMPLATE_SELECT = `
  *,
  workout_types (*),
  workout_template_exercises (*)
`;

const supabase = createClient();

function toTemplateError(error: PostgrestError, fallback: string) {
  if (MISSING_TABLE_CODES.includes(error.code)) {
    return new Error(TEMPLATES_NOT_SET_UP_MESSAGE);
  }
  if (error.code === STRENGTH_ONLY_CODE) {
    return new Error(STRENGTH_ONLY_MESSAGE);
  }
  return toServiceError(error, fallback);
}

function sortExercises(template: WorkoutTemplate): WorkoutTemplate {
  return {
    ...template,
    workout_template_exercises: [
      ...(template.workout_template_exercises ?? []),
    ].sort((a, b) => a.exercise_order - b.exercise_order),
  };
}

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(TEMPLATE_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw toTemplateError(error, 'Could not load templates.');
  }

  return ((data ?? []) as WorkoutTemplate[])
    .filter(
      (template) => template.workout_types?.workout_group === 'RepetitionBased'
    )
    .map(sortExercises);
}

export async function getTemplateById(
  templateId: string
): Promise<WorkoutTemplate | null> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(TEMPLATE_SELECT)
    .eq('id', templateId)
    .maybeSingle();

  if (error) {
    throw toTemplateError(error, 'Could not load template.');
  }

  return data ? sortExercises(data as WorkoutTemplate) : null;
}

export async function createTemplate({
  name,
  workoutTypeId,
}: {
  name: string;
  workoutTypeId: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({ name, workout_type_id: workoutTypeId })
    .select('id')
    .single();

  if (error) {
    throw toTemplateError(error, 'Could not create template.');
  }

  return data;
}

export async function deleteTemplate(templateId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)
    .select('id');

  if (error) {
    throw toTemplateError(error, 'Could not delete template.');
  }

  if (!data || data.length === 0) {
    throw new Error('Could not delete template.');
  }
}

export async function addTemplateExercise({
  templateId,
  name,
  exerciseListId,
}: {
  templateId: string;
  name: string;
  exerciseListId: string | null;
}) {
  const { data: last, error: orderError } = await supabase
    .from('workout_template_exercises')
    .select('exercise_order')
    .eq('template_id', templateId)
    .order('exercise_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    throw toTemplateError(orderError, 'Could not add exercise.');
  }

  const { error } = await supabase.from('workout_template_exercises').insert({
    template_id: templateId,
    name,
    exercise_list_id: exerciseListId,
    exercise_order: (last?.exercise_order ?? 0) + 1,
  });

  if (error) {
    throw toTemplateError(error, 'Could not add exercise.');
  }
}

export async function deleteTemplateExercise(exerciseId: string) {
  const { data, error } = await supabase
    .from('workout_template_exercises')
    .delete()
    .eq('id', exerciseId)
    .select('id');

  if (error) {
    throw toTemplateError(error, 'Could not delete exercise.');
  }

  if (!data || data.length === 0) {
    throw new Error('Could not delete exercise.');
  }
}

export async function createWorkoutFromTemplate({
  userId,
  template,
  date,
}: {
  userId: string;
  template: WorkoutTemplate;
  date: Date;
}): Promise<{ id: string }> {
  const workout = await createWorkout({
    userId,
    name: template.name,
    workoutType: template.workout_type_id,
    date,
  });

  if (template.workout_template_exercises.length === 0) {
    return workout;
  }

  const { error } = await supabase.from('exercises').insert(
    template.workout_template_exercises.map((exercise, index) => ({
      workout_id: workout.id,
      name: exercise.name,
      exercise_list_id: exercise.exercise_list_id,
      exercise_order: index + 1,
    }))
  );

  if (error) {
    await deleteWorkout(String(workout.id)).catch(() => {});
    throw toServiceError(error, 'Could not add template exercises.');
  }

  return workout;
}
