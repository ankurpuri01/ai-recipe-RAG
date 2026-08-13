import 'dotenv/config';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is not set. Check your .env.local file.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7
) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate response from OpenAI');
  }
}