import { embedMany } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const EMBEDDING_DIMS = 1536;

const openai = createOpenAI();

/** Satisfies PostgresStore's IndexConfig.embed — a plain async function, no LangChain Embeddings class needed. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    const { embeddings } = await embedMany({
      model: openai.embeddingModel('text-embedding-3-small'),
      values: texts,
    });
    return embeddings;
  } catch (error) {
    console.error('embedTexts failed', error);
    throw error;
  }
}
