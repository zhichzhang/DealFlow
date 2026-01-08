// ingestion/resolver/index.ts
import { supabase } from '../../../db/db';

export async function resolveRetailerId(name: string): Promise<number> {
    const { data } = await supabase
        .from('retailers')
        .select('id')
        .eq('name', name)
        .single();

    if (data) return data.id;

    const { data: newData } = await supabase
        .from('retailers')
        .insert({ name })
        .select('id')
        .single();

    return newData?.id;
}

export async function resolveProductId(name: string, size?: string, category?: string): Promise<number> {
    const { data } = await supabase
        .from('products')
        .select('id')
        .match({ name, size: size || null, category: category || null })
        .single();

    if (data) return data.id;

    const { data: newData } = await supabase
        .from('products')
        .insert({ name, size, category })
        .select('id')
        .single();

    return newData?.id;
}
