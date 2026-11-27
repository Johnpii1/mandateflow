import type { RequestHandler } from 'express';
import { createAgent } from './agent.service.js';
import { createAgentSchema } from './agent.validation.js';

export const createAgentController: RequestHandler = async (request, response) => {
  const parsed = createAgentSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }

  const agent = await createAgent(response.locals.userId as string, parsed.data);
  response.status(201).json({ agent });
};
