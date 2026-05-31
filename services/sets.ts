import { supabase } from "@/lib/supabase";

type AddSetsProperties = {
    exerciseId: number;
    reps: number;
    weight: number;
    order: number;
}

export async function addSets(props: AddSetsProperties){
    const { data, error } = await supabase.from('sets').insert({
        exercise_id: props.exerciseId,
        reps: props.reps,
        weight: props.weight,
        set_order: props.order,
        }).select().single();

    if (error) {
        throw error;
    }

    return data;
}