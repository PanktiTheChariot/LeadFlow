export interface AIReplyContext {
  leadName: string;
  leadCompany: string;
  leadStatus: string;
}

export interface AIProvider {
  generateReply(message: string, context: AIReplyContext): Promise<string>;
}
