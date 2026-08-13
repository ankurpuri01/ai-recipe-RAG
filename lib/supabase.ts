import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

export async function searchRecipesByEmbedding(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.1
) {
  try {
    const { data, error } = await supabase.rpc('match_recipes', {
      query_embedding: queryEmbedding,
      match_count: limit,
      similarity_threshold: similarityThreshold,
    });

    if (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchRecipesByEmbedding:', error);
    throw new Error('Failed to search recipes');
  }
}