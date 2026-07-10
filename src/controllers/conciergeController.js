import { processConciergeMessage } from '../services/concierge.js';

export const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ status: 'error', message: 'El mensaje es requerido.' });
  }

  try {
    const result = await processConciergeMessage(message, history);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    req.logger?.error(`[concierge] ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Error procesando tu mensaje. Intentá de nuevo.' });
  }
};
