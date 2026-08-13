-- ============================================
-- AI Recipe Assistant - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the recipes table for storing recipe chunks with embeddings
CREATE TABLE IF NOT EXISTS recipe_embeddings (
    id BIGSERIAL PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    recipe_name TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create an index for fast vector similarity search
CREATE INDEX IF NOT EXISTS recipe_embeddings_vector_idx 
ON recipe_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create a function for similarity search
CREATE OR REPLACE FUNCTION match_recipes(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.0
)
RETURNS TABLE(
    id BIGINT,
    recipe_id TEXT,
    recipe_name TEXT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        re.id,
        re.recipe_id,
        re.recipe_name,
        re.content,
        re.metadata,
        1 - (re.embedding <=> query_embedding) AS similarity
    FROM recipe_embeddings re
    WHERE 1 - (re.embedding <=> query_embedding) > similarity_threshold
    ORDER BY re.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Create an index on recipe_id for faster lookups
CREATE INDEX IF NOT EXISTS recipe_embeddings_recipe_id_idx 
ON recipe_embeddings(recipe_id);