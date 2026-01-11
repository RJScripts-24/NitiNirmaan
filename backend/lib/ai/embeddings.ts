import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face Client
// 1. Get a FREE token here: https://huggingface.co/settings/tokens
// 2. Add HUGGINGFACE_API_KEY to your .env.local
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Generates a vector embedding for a given text string.
 * Uses 'sentence-transformers/all-MiniLM-L6-v2' (384 dimensions).
 * Note: This model is much smaller/faster than OpenAI (384 vs 1536 dims).
 * You MUST update your Supabase 'vectors' table definition to match 384 dimensions.
 * @param text The input string
 * @returns A 384-dimensional vector array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // 1. Sanitize Input
    const cleanText = text.replace(/\n/g, ' ');

    // 2. Call Hugging Face API (Feature Extraction)
    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: cleanText,
    });

    // 3. Ensure Output is a flat number array
    // HF sometimes returns nested arrays depending on input, we flatten it.
    if (Array.isArray(output) && Array.isArray(output[0])) {
      return (output as number[][])[0]; 
    }
    return output as number[];

  } catch (error) {
    console.error('Error generating embedding (HuggingFace):', error);
    // Fallback: If API fails, return a zero-vector (Prevents app crash, but breaks search)
    // In production, you would throw logic error.
    return new Array(384).fill(0);
  }
}

/**
 * Generates embeddings for a batch of texts.
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const cleanTexts = texts.map(t => t.replace(/\n/g, ' '));

    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: cleanTexts,
    });
    
    // HF returns (batch_size, hidden_dim)
    return output as number[][];

  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Batch embedding generation failed.');
  }
}