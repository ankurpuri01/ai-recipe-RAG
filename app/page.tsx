'use client';

import { FormEvent, useState } from 'react';

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
  {
    icon: '🍗',
    text: 'I have chicken and rice',
  },
  {
    icon: '🥚',
    text: 'I have eggs, tomato and onion',
  },
  {
    icon: '🥬',
    text: 'Give me a vegetarian dinner',
  },
  {
    icon: '⚡',
    text: 'Show me something under 30 minutes',
  },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  const handleSubmit = async (prompt?: string) => {
    const finalQuery = (prompt ?? query).trim();

    if (!finalQuery || loading) {
      return;
    }

    setQuery(finalQuery);
    setLoading(true);
    setError(null);
    setResponse(null);
    setShowContext(false);
    setCheckedIngredients(new Set());

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: finalQuery,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || 'Something went wrong while finding your recipe.'
        );
      }

      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  const toggleIngredient = (index: number) => {
    const updated = new Set(checkedIngredients);

    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }

    setCheckedIngredients(updated);
  };

  const startOver = () => {
    setQuery('');
    setResponse(null);
    setError(null);
    setShowContext(false);
    setCheckedIngredients(new Set());
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] text-gray-900">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-red-100/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-3">
          <button
            onClick={startOver}
            className="flex items-center gap-3"
            aria-label="Start over"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg shadow-orange-200">
              🍳
            </div>

            <div className="text-left">
              <p className="text-lg font-bold tracking-tight text-gray-900">
                RecipeMate
              </p>
              <p className="text-xs text-gray-500">
                Your smart kitchen companion
              </p>
            </div>
          </button>

          {response && (
            <button
              onClick={startOver}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
            >
              New search
            </button>
          )}
        </header>

        {!response && !loading && (
          <>
            {/* Hero */}
            <section className="mx-auto max-w-4xl pb-10 pt-16 text-center sm:pt-24">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
                <span>✨</span>
                <span>AI-powered recipe discovery</span>
              </div>

              <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                What are you{' '}
                <span className="text-orange-500">cooking today?</span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Tell me what ingredients you have, what you&apos;re craving,
                or how much time you have. I&apos;ll find a recipe that fits.
              </p>

              {/* Search */}
              <form onSubmit={handleFormSubmit} className="mx-auto mt-10 max-w-3xl">
                <div className="rounded-3xl border border-gray-200 bg-white p-2 shadow-xl shadow-orange-100/50 transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
                  <div className="flex items-center gap-2">
                    <span className="hidden pl-3 text-xl sm:block">🔎</span>

                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Try “I have chicken, rice and vegetables...”"
                      disabled={loading}
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-lg"
                    />

                    <button
                      type="submit"
                      disabled={loading || !query.trim()}
                      className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none sm:px-7"
                    >
                      Find recipe
                    </button>
                  </div>
                </div>
              </form>

              {/* Examples */}
              <div className="mt-8">
                <p className="mb-4 text-sm font-medium text-gray-500">
                  Not sure what to ask? Try one of these
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSubmit(prompt.text)}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <span>{prompt.icon}</span>
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Feature cards */}
            <section className="mx-auto grid max-w-4xl gap-4 pb-12 sm:grid-cols-3">
              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="mb-3 text-2xl">🥕</div>
                <h3 className="font-semibold text-gray-900">
                  Use what you have
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Tell me your ingredients and discover meals without another
                  grocery trip.
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="mb-3 text-2xl">⚡</div>
                <h3 className="font-semibold text-gray-900">
                  Match your time
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Looking for something quick? Ask for recipes under 15, 30 or
                  45 minutes.
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="mb-3 text-2xl">🌱</div>
                <h3 className="font-semibold text-gray-900">
                  Find your style
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Ask for vegetarian, vegan, spicy, healthy or comfort-food
                  options.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Loading */}
        {loading && (
          <section className="mx-auto max-w-2xl py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-4xl">
              🍳
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Finding something delicious...
            </h2>

            <p className="mt-3 text-gray-500">
              Searching your recipe collection and finding the best match.
            </p>

            <div className="mx-auto mt-8 flex max-w-xs items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && !loading && (
          <section className="mx-auto max-w-2xl py-16">
            <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                😕
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                I couldn&apos;t find a recipe
              </h2>

              <p className="mt-2 text-gray-500">{error}</p>

              <button
                onClick={() => handleSubmit()}
                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Try again
              </button>
            </div>
          </section>
        )}

        {/* Recipe */}
        {response && !loading && (
          <section className="mx-auto max-w-5xl pb-16 pt-10">
            {/* Search summary */}
            <div className="mb-8">
              <p className="text-sm font-medium text-orange-600">
                Here&apos;s what I found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Based on: <span className="font-medium text-gray-700">{query}</span>
              </p>
            </div>

            {/* Main recipe card */}
            <article className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40">
              {/* Recipe header */}
              <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 px-6 py-10 text-white sm:px-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur">
                      <span>🍽️</span>
                      <span>Recipe recommendation</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                      {response.answer.recipe_name}
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
                      {response.answer.description}
                    </p>
                  </div>

                  <div className="text-6xl">👨‍🍳</div>
                </div>

                {/* Recipe stats */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-orange-100">TIME</p>
                    <p className="mt-1 font-semibold">
                      ⏱️ {response.answer.cooking_time_minutes} min
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-orange-100">DIFFICULTY</p>
                    <p className="mt-1 font-semibold capitalize">
                      👨‍🍳 {response.answer.difficulty}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-orange-100">INGREDIENTS</p>
                    <p className="mt-1 font-semibold">
                      🥕 {response.answer.ingredients.length} items
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipe content */}
              <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr]">
                {/* Ingredients */}
                <div>
                  <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                      What you need
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      Ingredients
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#fffaf5] p-4">
                    <ul className="space-y-1">
                      {response.answer.ingredients.map(
                        (ingredient, index) => {
                          const checked = checkedIngredients.has(index);

                          return (
                            <li
                              key={`${ingredient.name}-${index}`}
                              className={`rounded-xl transition ${
                                checked ? 'bg-gray-100' : 'hover:bg-white'
                              }`}
                            >
                              <label className="flex cursor-pointer items-center gap-3 p-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleIngredient(index)}
                                  className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />

                                <span
                                  className={`flex-1 text-sm sm:text-base ${
                                    checked
                                      ? 'text-gray-400 line-through'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {ingredient.name}
                                  </span>

                                  {ingredient.quantity && (
                                    <span className="ml-2 text-gray-500">
                                      {ingredient.quantity}
                                    </span>
                                  )}
                                </span>

                                {checked && (
                                  <span className="text-sm text-green-600">
                                    ✓
                                  </span>
                                )}
                              </label>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Check ingredients as you prepare them.
                  </p>
                </div>

                {/* Instructions */}
                <div>
                  <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                      Let&apos;s cook
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-900">
                      Instructions
                    </h2>
                  </div>

                  <ol className="space-y-5">
                    {response.answer.steps.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-4">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                          {index + 1}
                        </div>

                        <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                          <p className="text-sm leading-7 text-gray-700 sm:text-base">
                            {step}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>

            {/* Follow-up suggestions */}
            <div className="mt-8 rounded-3xl border border-orange-100 bg-orange-50/60 p-6 sm:p-8">
              <div className="text-center">
                <p className="text-sm font-semibold text-orange-600">
                  WANT TO CHANGE IT?
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Make it your way
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Ask me for another version of this recipe.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() =>
                    handleSubmit(`Give me another recipe similar to ${response.answer.recipe_name}`)
                  }
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                >
                  🔄 Another recipe
                </button>

                <button
                  onClick={() =>
                    handleSubmit(`Make ${response.answer.recipe_name} vegetarian`)
                  }
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                >
                  🌱 Vegetarian
                </button>

                <button
                  onClick={() =>
                    handleSubmit(`Make ${response.answer.recipe_name} spicy`)
                  }
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                >
                  🌶️ Make it spicy
                </button>

                <button
                  onClick={() =>
                    handleSubmit(`Give me a faster version of ${response.answer.recipe_name}`)
                  }
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                >
                  ⚡ Make it faster
                </button>
              </div>
            </div>

            {/* Retrieved context */}
            <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setShowContext(!showContext)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-gray-50 sm:px-8"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    🔎 How this recipe was found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Retrieved from your recipe vector database
                  </p>
                </div>

                <span className="text-gray-400">
                  {showContext ? '▲' : '▼'}
                </span>
              </button>

              {showContext && (
                <div className="border-t border-gray-100 px-6 py-6 sm:px-8">
                  <div className="space-y-3">
                    {response.retrieved_context.map((context, index) => (
                      <div
                        key={`${context.recipe_id}-${index}`}
                        className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {context.recipe_name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {context.recipe_id}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                          {(context.similarity * 100).toFixed(1)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action */}
            <div className="mt-8 text-center">
              <button
                onClick={startOver}
                className="rounded-2xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                🍳 Find another recipe
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}