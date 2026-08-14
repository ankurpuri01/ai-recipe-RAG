import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateChatCompletion, generateEmbedding } from '@/lib/openai';
import { searchRecipesByEmbedding } from '@/lib/supabase';

const ChatRequestSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(500, 'Query too long'),
});

const RecipeResponseSchema = z.object({
  recipe_name: z.string(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
    })
  ),
  steps: z.array(z.string()),
  cooking_time_minutes: z.number(),
  difficulty: z.string(),
  source_recipe_ids: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are an AI Recipe Assistant that helps users find recipes based on their ingredients and preferences.

RULES:
1. ONLY use recipes provided in the CONTEXT below as your knowledge source.
2. If the user asks for something not in the CONTEXT, say "I don't have a recipe for that in my database."
3. You can suggest modifications to existing recipes (e.g., make vegetarian, substitute ingredients).
4. Format all quantities as strings (e.g., "200g", "2 cups").
5. Return ONLY valid JSON matching the required schema.
6. Include the source_recipe_ids of recipes you used.
7. Match user ingredients semantically to recipes in the context.
8. If user asks for recipes under a certain time, filter by cooking_time_minutes.

Your response must be a valid JSON object with these exact keys:
- recipe_name: string
- description: string
- ingredients: array of {name: string, quantity: string}
- steps: array of strings
- cooking_time_minutes: number
- difficulty: string
- source_recipe_ids: array of strings`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = ChatRequestSchema.parse(body);

    const queryEmbedding = await generateEmbedding(query);
    const similarRecipes = await searchRecipesByEmbedding(queryEmbedding, 5, 0.1);

    if (!similarRecipes.length) {
      return NextResponse.json(
        { error: 'No relevant recipes found. Try a different query.' },
        { status: 404 }
      );
    }

    const context = similarRecipes
      .map((recipe: any, index: number) => {
        return `[RECIPE ${index + 1}]
Recipe ID: ${recipe.recipe_id}
Name: ${recipe.recipe_name}
Content: ${recipe.content}
Similarity Score: ${recipe.similarity.toFixed(3)}`;
      })
      .join('\n\n');

    const llmResponse = await generateChatCompletion(
      `${SYSTEM_PROMPT}\n\nCONTEXT:\n${context}`,
      `User Question: ${query}\n\nPlease provide a recipe recommendation based on the context above.`
    );

    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in the model response.');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const validatedResponse = RecipeResponseSchema.parse(parsedResponse);

    return NextResponse.json({
      answer: validatedResponse,
      retrieved_context: similarRecipes.map((recipe: any) => ({
        recipe_id: recipe.recipe_id,
        recipe_name: recipe.recipe_name,
        similarity: recipe.similarity,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error. Please try again.';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
