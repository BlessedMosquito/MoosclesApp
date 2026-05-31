import { supabase } from "@/lib/supabase";


type CreateWorkoutProperties = {
    name: string;
    workoutType: string;
    date: Date;
    durationHours?: number;
    durationMinutes?: number;
    durationSeconds?: number;
}

type GetWorkoutsProperties = {
    date?: Date;
    name?: string;
    workoutTypeId?: string;
}

export async function createWorkout(props: CreateWorkoutProperties){
    const { data: { user }, error: userError} = await supabase.auth.getUser();

    if(userError || !user){
        throw new Error('User not authenticated!');
    }

    const hoursInSeconds = (props.durationHours ?? 0) * 3600;
    const minutesInSeconds = (props.durationMinutes ?? 0) * 60;
    const seconds = props.durationSeconds ?? 0;
  
    const durationSeconds = hoursInSeconds + minutesInSeconds + seconds;

    const {data, error} = await supabase.from('workouts').insert({ 
        user_id: user.id, 
        name: props.name, 
        workout_date: props.date.toISOString(),
        workout_type_id: props.workoutType,
        duration_seconds: durationSeconds}).select().single();

    if(error){
        throw new Error(error.message);
    }
    
    return data;
}

export async function getWorkouts(filters?: GetWorkoutsProperties) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      throw new Error('User not authenticated!');
    }
  
    let query = supabase
      .from('workouts')
      .select(`
        *,
        workout_types (
          id,
          name,
          label
        )
      `)
      .eq('user_id', user.id);
  
    if (filters?.date) {
      query = query.eq(
        'workout_date',
        filters.date.toISOString().split('T')[0]
      );
    }
  
    if (filters?.name) {
      query = query.ilike(
        'name',
        `%${filters.name}%`
      );
    }
  
    if (filters?.workoutTypeId) {
      query = query.eq(
        'workout_type_id',
        filters.workoutTypeId
      );
    }
  
    const { data, error } = await query.order(
      'workout_date',
      { ascending: false }
    );
  
    if (error) {
      throw new Error(error.message);
    }
  
    return data;
  }
