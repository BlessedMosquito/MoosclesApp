import { supabase } from "@/lib/supabase";


type CreateWorkoutProperties = {
    name: string;
    workoutType: string;
    date: Date;
    durationHours?: number;
    durationMinutes?: number;
    durationSeconds?: number;
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
        workout_type: props.workoutType,
        duration_seconds: durationSeconds}).select().single();

    if(error){
        throw error
    }
    
    return data;
}

