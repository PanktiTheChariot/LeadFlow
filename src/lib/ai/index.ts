import { MockAIProvider } from "./mockProvider";
import { OpenAIProvider } from "./openaiProvider";
import type { AIProvider } from "./types";

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;
  const apiKey = process.env.OPENAI_API_KEY;
  cachedProvider = apiKey ? new OpenAIProvider(apiKey) : new MockAIProvider();
  return cachedProvider;
}

export type { AIProvider, AIReplyContext } from "./types";
