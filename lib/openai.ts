import { config } from 'dotenv';

config({ path: '.env.local' });

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

console.log(
  '🔑 Token status:',
  HF_TOKEN ? 'FOUND' : 'MISSING'
);

if (!HF_TOKEN) {
  console.warn('⚠️ HUGGINGFACE_API_KEY is missing');
}

/**
 * Generate a 384-dimensional embedding using
 * BAAI/bge-small-en-v1.5 through Hugging Face.
 */
export async function generateEmbedding(
  text: string
): Promise<number[]> {
  try {
    if (!HF_TOKEN) {
      throw new Error('HUGGINGFACE_API_KEY is missing');
    }

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        '❌ Hugging Face Embedding Error:',
        response.status,
        responseText
      );

      throw new Error(
        `Hugging Face Embedding HTTP ${response.status}`
      );
    }

    const data = JSON.parse(responseText);

    let embedding: number[];

    /*
     * BGE-small should ultimately give us
     * one 384-dimensional vector.
     *
     * Depending on the HF response format,
     * handle either:
     *
     * [384]
     *
     * or:
     *
     * [[384], [384], ...]
     */

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0] === 'number'
    ) {
      embedding = data as number[];
    } else if (
      Array.isArray(data) &&
      data.length > 0 &&
      Array.isArray(data[0])
    ) {
      const tokenEmbeddings = data as number[][];

      const dimensions = tokenEmbeddings[0].length;

      if (dimensions !== 384) {
        throw new Error(
          `Expected 384 dimensions, received ${dimensions}`
        );
      }

      embedding = new Array(dimensions).fill(0);

      for (const tokenVector of tokenEmbeddings) {
        for (let i = 0; i < dimensions; i++) {
          embedding[i] += tokenVector[i];
        }
      }

      for (let i = 0; i < dimensions; i++) {
        embedding[i] /= tokenEmbeddings.length;
      }
    } else {
      console.error(
        '❌ Unexpected Hugging Face embedding response:',
        data
      );

      throw new Error(
        'Unexpected embedding response format'
      );
    }

    if (embedding.length !== 384) {
      throw new Error(
        `Invalid embedding dimension: ${embedding.length}. Expected 384.`
      );
    }

    /*
     * Normalize the vector for cosine similarity.
     */
    const magnitude = Math.sqrt(
      embedding.reduce(
        (sum, value) => sum + value * value,
        0
      )
    );

    if (magnitude === 0) {
      throw new Error(
        'Embedding has zero magnitude'
      );
    }

    embedding = embedding.map(
      (value) => value / magnitude
    );

    console.log(
      `✅ Embedding generated: ${embedding.length} dimensions`
    );

    return embedding;
  } catch (error: any) {
    console.error(
      '❌ Embedding error:',
      error.message
    );

    throw new Error(
      'Failed to generate embedding'
    );
  }
}

/**
 * Generate the final recipe response using
 * Hugging Face Inference Providers.
 */
export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7
): Promise<string> {
  try {
    if (!HF_TOKEN) {
      throw new Error(
        'HUGGINGFACE_API_KEY is missing'
      );
    }

    const response = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',

          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],

          temperature,
          max_tokens: 500,
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        '❌ Hugging Face Chat Error:',
        response.status,
        responseText
      );

      throw new Error(
        `Hugging Face Chat HTTP ${response.status}: ${responseText}`
      );
    }

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        '❌ Invalid JSON returned by Hugging Face:',
        responseText
      );

      throw new Error(
        'Invalid JSON response from Hugging Face'
      );
    }

    const content =
      data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error(
        '❌ No content in Hugging Face response:',
        data
      );

      throw new Error(
        'No response content returned from Hugging Face'
      );
    }

    console.log(
      '✅ Chat response generated'
    );

    return content;
  } catch (error: any) {
    console.error(
      '❌ Chat completion error:',
      error.message
    );

    throw new Error(
      'Failed to generate response'
    );
  }
}