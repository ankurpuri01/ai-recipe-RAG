import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateEmbedding } from '../lib/openai';
import { supabase } from '../lib/supabase';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cuisine: string;
  diet: string;
  cooking_time_minutes: number;
  difficulty: string;
  tags: string[];
}

function prepareRecipeText(recipe: Recipe): string {
  return [
    `Recipe Name: ${recipe.name}`,
    `Description: ${recipe.description}`,
    `Cuisine: ${recipe.cuisine}`,
    `Diet: ${recipe.diet}`,
    `Cooking Time: ${recipe.cooking_time_minutes} minutes`,
    `Difficulty: ${recipe.difficulty}`,
    `Ingredients: ${recipe.ingredients.join(', ')}`,
    `Instructions: ${recipe.instructions.join(' ')}`,
    `Tags: ${recipe.tags.join(', ')}`,
  ].join('\n');
}

async function ingestRecipes() {
  console.log('🚀 Starting recipe ingestion...\n');

  const recipesPath = join(process.cwd(), 'data', 'recipes.json');
  const recipes: Recipe[] = JSON.parse(readFileSync(recipesPath, 'utf-8'));

  console.log(`📚 Found ${recipes.length} recipes to process\n`);

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    console.log(`Processing ${i + 1}/${recipes.length}: ${recipe.name}`);

    try {
      const textToEmbed = prepareRecipeText(recipe);
      const embedding = await generateEmbedding(textToEmbed);

      const { error } = await supabase.from('recipe_embeddings').insert({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        content: textToEmbed,
        metadata: recipe,
        embedding: embedding,
      });

      if (error) {
        console.error(`❌ Error inserting ${recipe.name}:`, error.message);
        continue;
      }

      console.log(`✅ Successfully embedded: ${recipe.name}`);
    } catch (error) {
      console.error(`❌ Failed to process ${recipe.name}:`, error);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n🎉 Recipe ingestion complete!');
}

ingestRecipes().catch(console.error);