'use client';

import { useState } from 'react';

interface Ingredient {
  name: string;
  quantity: string;
}

interface RecipeAnswer {
  recipe_name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  cooking_time_minutes: number;
  difficulty: string;
  source_recipe_ids: string[];
}

interface RetrievedContext {
  recipe_id: string;
  recipe_name: string;
  similarity: number;
}

interface ChatResponse {
  answer: RecipeAnswer;
  retrieved_context: RetrievedContext[];
}

const EXAMPLE_PROMPTS = [
  'What can I make with chicken and rice?',
  'Give me a vegetarian pasta recipe.',
  'I have eggs, tomato and onion.',
  'Show me something under 30 minutes.',
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const handleSubmit = async (prompt?: string) => {
    const finalQuery = prompt || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setCheckedIngredients(new Set());
    setShowContext(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: finalQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🍳 AI Recipe Assistant</h1>
          <p className="text-xl text-gray-600">
            Find recipes using AI-powered semantic search.
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Ask for a recipe... (e.g., What can I make with chicken?)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              disabled={loading}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Searching...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setQuery(prompt);
                  handleSubmit(prompt);
                }}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-orange-50 hover:border-orange-300 transition-colors text-sm disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Finding the perfect recipe...</p>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div className="space-y-6">
            {/* Recipe Card */}
            <div className="bg-white shadow-lg rounded-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {response.answer.recipe_name}
              </h2>
              <p className="text-gray-600 mb-6">{response.answer.description}</p>

              <div className="flex gap-4 mb-6">
                <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                  ⏱️ {response.answer.cooking_time_minutes} minutes
                </div>
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                  📊 {response.answer.difficulty}
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {response.answer.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.has(index)}
                        onChange={() => toggleIngredient(index)}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className={checkedIngredients.has(index) ? 'line-through text-gray-400' : 'text-gray-700'}>
                        <span className="font-medium">{ingredient.name}</span>
                        {ingredient.quantity && (
                          <span className="text-gray-500"> - {ingredient.quantity}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {response.answer.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Retrieved Context */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <button
                onClick={() => setShowContext(!showContext)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  🔍 Retrieved Context
                </span>
                <span className="text-gray-500">{showContext ? '▼' : '▶'}</span>
              </button>
              
              {showContext && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">
                    These recipes were retrieved from the vector database and used to generate the answer:
                  </p>
                  <div className="space-y-3">
                    {response.retrieved_context.map((context, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {context.recipe_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {context.recipe_id}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            {(context.similarity * 100).toFixed(1)}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}