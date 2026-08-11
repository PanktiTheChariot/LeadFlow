import OpenAI from "openai";
import type { AIProvider, AIReplyContext } from "./types";

const SYSTEM_PROMPT =
  "You are a professional sales rep replying to an inbound lead message. " +
  "Keep it concise (under 150 words), warm but not pushy, and end with a clear next step. " +
  "Do not invent specific prices, dates, or promises the company hasn't made.";

/**
 * Real integration, used automatically when OPENAI_API_KEY is set. The key is
 * read from process.env on the server only - this class is never imported by
 * client components, so the key can never end up in a browser bundle.
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateReply(message: string, context: AIReplyContext): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Lead name: ${context.leadName}`,
            `Lead company: ${context.leadCompany}`,
            `Lead status: ${context.leadStatus}`,
            "",
            `Lead's message:\n"""${message}"""`,
            "",
            "Write a professional reply.",
          ].join("\n"),
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? "";
  }
}
