import { createClient } from '@/lib/supabase/client';

export type GetExercisesListReturnData = {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primary_muscles: string;
  secondary_muscles: string[];
};

export type GetExercisesListOrderBy = {
  column: 'name' | 'category' | 'equipment' | 'primary_muscles';
  ascending?: boolean;
};

export type GetExercisesListFilters = {
  name?: string | null;
  category?: string | null;
  equipment?: string | null;
  primaryMuscles?: string | null;
  secondaryMuscles?: string[] | null;
  orderBy?: GetExercisesListOrderBy | null;
  limit?: number | null;
  offset?: number | null;
};

const supabase = createClient();

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export async function getExercisesList(
  filters: GetExercisesListFilters = {}
): Promise<GetExercisesListReturnData[]> {
  let query = supabase
    .from('exercises_list')
    .select('*')
    .order('name', { ascending: true });

  if (hasText(filters.name)) {
    query = query.ilike('name', `%${filters.name.trim()}%`);
  }

  if (hasText(filters.category)) {
    query = query.eq('category', filters.category.trim());
  }

  if (hasText(filters.equipment)) {
    query = query.eq('equipment', filters.equipment.trim());
  }

  if (hasText(filters.primaryMuscles)) {
    query = query.ilike(
      'primary_muscles',
      `%${filters.primaryMuscles.trim()}%`
    );
  }

  if (
    Array.isArray(filters.secondaryMuscles) &&
    filters.secondaryMuscles.length > 0
  ) {
    query = query.overlaps('secondary_muscles', filters.secondaryMuscles);
  }

  if (filters.orderBy) {
    query = query.order(filters.orderBy.column, {
      ascending: filters.orderBy.ascending ?? true,
      nullsFirst: false,
    });
  }

  if (typeof filters.limit === 'number' && filters.limit > 0) {
    query = query.limit(filters.limit);
  }

  if (typeof filters.offset === 'number' && filters.offset > 0) {
    query = query.offset(filters.offset);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as GetExercisesListReturnData[];
}

export async function getMuscles(): Promise<string[]> {
  const { data, error } = await supabase
    .from('exercises_list')
    .select('primary_muscles')
    .not('primary_muscles', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  const unique = new Set<string>();
  for (const el of data ?? []) {
    if (el.primary_muscles) {
      unique.add(capitalize(el.primary_muscles));
    }
  }

  return [...unique].sort((a, b) => a.localeCompare(b));
}
