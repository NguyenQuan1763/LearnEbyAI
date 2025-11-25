import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyCard } from '../types';
import { STATIC_VOCABULARY, getFallbackWords } from '../data/staticData';

const apiKey = process.env.API_KEY || '';

// AI Generator Function
// Added excludeWords param to support "Add more words" feature
export const generateWithAI = async (topic: string, count: number, excludeWords: string[] = []): Promise<VocabularyCard[]> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning fallback data.");
    return getFallbackWords(topic);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    let prompt = `Generate ${count} English vocabulary words related to the topic: "${topic}". 
    For each word, provide:
    1. The word itself.
    2. Phonetic transcription (IPA).
    3. Vietnamese translation (meaning).
    4. A short example sentence in English.
    5. Part of speech (noun, verb, etc.).
    
    Ensure the words vary in difficulty but are relevant to the topic.`;

    if (excludeWords.length > 0) {
      prompt += `\n\nIMPORTANT: Do NOT include the following words as they are already learned: ${excludeWords.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              vietnamese: { type: Type.STRING },
              example: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["word", "phonetic", "vietnamese", "example", "type"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return getFallbackWords(topic);

    return JSON.parse(jsonText) as VocabularyCard[];

  } catch (error) {
    console.error("Error generating vocabulary:", error);
    return getFallbackWords(topic);
  }
};

/**
 * Main service function to fetch vocabulary.
 * Updated to support exclusions.
 */
export const fetchVocabulary = async (
  topicId: string, 
  topicName: string, 
  count: number,
  excludeWords: string[] = [] // Optional: words to skip
): Promise<{ words: VocabularyCard[], isStatic: boolean }> => {
  
  // 1. Check Static Database
  if (STATIC_VOCABULARY[topicId]) {
    console.log(`[Cache Hit] Loading fixed lesson for: ${topicName}`);
    let words = STATIC_VOCABULARY[topicId];
    return { words, isStatic: true };
  }

  // 2. AI Generation for Custom Topics
  console.log(`[Cache Miss] Generating AI lesson for: ${topicName}`);
  const aiWords = await generateWithAI(topicName, count, excludeWords);
  return { words: aiWords, isStatic: false };
};