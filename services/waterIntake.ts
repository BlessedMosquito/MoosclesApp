import { createClient } from '@/lib/supabase/client';
import { toDateKey } from '@/lib/helpers';
import { toServiceError } from './serviceError';

export type WaterIntakeEntry = {
  id: string;
  amount_ml: number;
  created_at: string;
};

export type WaterIntakeDay = {
  date: string;
  totalMl: number;
};

const supabase = createClient();

const MISSING_TABLE_CODES = ['PGRST205', '42P01'];

export const WATER_NOT_SET_UP_MESSAGE = 'Water tracking is not set up yet.';

export async function getWaterEntriesForDay(
  date: Date
): Promise<WaterIntakeEntry[]> {
  const { data, error } = await supabase
    .from('water_intake')
    .select('id, amount_ml, created_at')
    .eq('intake_date', toDateKey(date))
    .order('created_at', { ascending: false });

  if (error) {
    if (MISSING_TABLE_CODES.includes(error.code)) return [];
    throw toServiceError(error, 'Could not load water intake.');
  }

  return (data ?? []) as WaterIntakeEntry[];
}

export async function getWaterHistory(
  days: number,
  endDate = new Date()
): Promise<WaterIntakeDay[]> {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - index));
    return toDateKey(date);
  });

  const { data, error } = await supabase
    .from('water_intake')
    .select('intake_date, amount_ml')
    .gte('intake_date', dates[0])
    .lte('intake_date', dates[dates.length - 1]);

  if (error) {
    if (MISSING_TABLE_CODES.includes(error.code)) {
      return dates.map((date) => ({ date, totalMl: 0 }));
    }
    throw toServiceError(error, 'Could not load water history.');
  }

  const totals = new Map<string, number>();
  for (const row of (data ?? []) as {
    intake_date: string;
    amount_ml: number;
  }[]) {
    totals.set(
      row.intake_date,
      (totals.get(row.intake_date) ?? 0) + row.amount_ml
    );
  }

  return dates.map((date) => ({ date, totalMl: totals.get(date) ?? 0 }));
}

export async function addWaterIntake({
  date,
  amountMl,
}: {
  date: Date;
  amountMl: number;
}): Promise<WaterIntakeEntry> {
  const { data, error } = await supabase
    .from('water_intake')
    .insert({
      intake_date: toDateKey(date),
      amount_ml: amountMl,
    })
    .select('id, amount_ml, created_at')
    .single();

  if (error) {
    if (MISSING_TABLE_CODES.includes(error.code)) {
      throw new Error(WATER_NOT_SET_UP_MESSAGE);
    }
    throw toServiceError(error, 'Could not add water.');
  }

  return data as WaterIntakeEntry;
}

export async function deleteWaterIntake(entryId: string) {
  const { data, error } = await supabase
    .from('water_intake')
    .delete()
    .eq('id', entryId)
    .select('id');

  if (error) {
    throw toServiceError(error, 'Could not delete water entry.');
  }

  if (!data || data.length === 0) {
    throw new Error('Water entry could not be deleted.');
  }
}
