AI Recipe Assistant

AI Recipe Assistant is a small RAG-based project that helps users find recipes using normal, natural-language questions.

For example, instead of searching for exact keywords, you can ask:

“What can I make with chicken and rice?”

The application converts the question into an embedding, searches the recipe database for semantically similar recipes, and returns the most relevant result.

What I Built

The project uses Hugging Face's BAAI/bge-small-en-v1.5 model to create embeddings for the recipes and user queries.

These embeddings are 384-dimensional and are stored in Supabase PostgreSQL using pgvector.

When a user asks something, the flow is:

User Query
    ↓
Hugging Face Embedding Model
    ↓
384-Dimensional Vector
    ↓
Supabase Vector Search
    ↓
Relevant Recipes
    ↓
Recipe Response

This allows the application to understand the meaning of a query instead of depending only on matching exact words.

Example

User:

What can I make with chicken and rice?

The system retrieves recipes such as:

Chicken Fried Rice
Egg Fried Rice with Vegetables
Chicken Noodle Soup

The most relevant recipe is then used to create the response.

Tech Stack
Next.js – application and API
TypeScript – development
Hugging Face – embedding generation
BAAI/bge-small-en-v1.5 – embedding model
Running the Project

I built this project to get hands-on experience with RAG, embeddings, vector databases, and AI APIs rather than just learning these concepts theoretically.

It helped me understand how a real AI application can take unstructured user questions, convert them into embeddings, retrieve relevant information from a custom dataset, and use that information to generate a useful response.
Supabase – database
PostgreSQL + pgvector – vector storage and similarity search
Zod – validation
