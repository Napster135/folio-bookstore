import { AI_MODE } from '../../config/index.config.js';
import { demoRespond } from './demoProvider.js';

export async function generateAIResponse(message, history) {
  switch (AI_MODE) {
    case 'demo':
    default:
      return demoRespond(message, history);
    // Future: case 'openai':    return openaiProvider.respond(message, history);
    // Future: case 'anthropic': return anthropicProvider.respond(message, history);
  }
}
