# 🍳 AI Recipe Assistant

A Retrieval-Augmented Generation (RAG) application that helps users find recipes using AI-powered semantic search. Users can ask natural language questions about recipes, ingredients, and dietary preferences.

## What is RAG?

Retrieval-Augmented Generation (RAG) combines:
1. **Retrieval**: Finding relevant information from a database
2. **Generation**: Using AI to create responses based on retrieved information

Instead of relying solely on the AI model's training data, RAG fetches relevant context from a vector database and provides it to the LLM, resulting in more accurate and grounded responses.

## Architecture
RECIPE JSON → Data Ingestion → Embedding Generation → Supabase pgvector
↓
USER QUERY → Query Embedding → Vector Similarity Search → Top-K Recipes
↓
Retrieved Context
↓
OpenAI LLM
↓
Structured Response
↓
Recipe UI


## Technologies Used

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI API (text-embedding-3-small, gpt-4o-mini)
- **Vector Database**: Supabase with pgvector
- **Validation**: Zod

## How Embeddings Work

Embeddings convert text into numerical vectors (arrays of numbers). Similar texts produce similar vectors. OpenAI's `text-embedding-3-small` model converts text into 1536-dimensional vectors.

## How Vector Search Works

Vector search finds similar items by calculating the distance between vectors. We use cosine similarity - the cosine of the angle between two vectors. Similar vectors have a small angle (high similarity), while different vectors have a large angle (low similarity).

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- OpenAI API key
- Supabase account

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the contents of `supabase/schema.sql`
4. Copy your Project URL and service_role key

### 3. OpenAI Setup

1. Get your API key from [platform.openai.com](https://platform.openai.com)
2. Ensure you have billing credits

### 4. Environment Variables

Create `.env.local`:

```bash
OPENAI_API_KEY=your-key
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
