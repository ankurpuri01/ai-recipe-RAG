import { config } from 'dotenv';
config({ path: '.env.local' });

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

// Debug log
console.log('🔑 Token status:', HF_TOKEN ? 'FOUND' : 'MISSING');

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Status:', response.status, 'Error:', errorText.substring(0, 200));
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as number[];
  } catch (error: any) {
    console.error('Error details:', error.message);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateChatCompletion(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7
) {
  try {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Error:', error.message);
    throw new Error('Failed to generate response');
  }
}