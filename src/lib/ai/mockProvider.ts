import type { AIProvider, AIReplyContext } from "./types";

/** Deterministic fallback so the app is fully demoable without an OpenAI key. */
export class MockAIProvider implements AIProvider {
  async generateReply(message: string, context: AIReplyContext): Promise<string> {
    const firstName = context.leadName.trim().split(/\s+/)[0] || "there";

    return [
      `Hi ${firstName},`,
      "",
      `Thanks for reaching out${context.leadCompany ? `. Great to hear from ${context.leadCompany}` : ""}. ${summarizeIntent(message)}`,
      "",
      "I'd be glad to walk you through pricing, what's included at each tier, and how teams typically get started. Could you share your rough timeline and team size so I can tailor the details?",
      "",
      "I'll follow up shortly with a few resources in the meantime.",
      "",
      "Best,",
      "The LeadFlow Team",
    ].join("\n");
  }
}

function summarizeIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost")) {
    return "Happy to help with pricing.";
  }
  if (lower.includes("demo")) {
    return "I'd love to set up a quick demo.";
  }
  if (lower.includes("integrat")) {
    return "Happy to talk through how our integrations work.";
  }
  return "Happy to help answer that.";
}
