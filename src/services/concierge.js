import { generateAIResponse } from './ai/aiService.js';

export async function processConciergeMessage(message, history = []) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { reply: 'Por favor escribí un mensaje para que pueda ayudarte.', books: [] };
  }
  const sanitized = message.trim().slice(0, 500);
  return generateAIResponse(sanitized, history);
}
