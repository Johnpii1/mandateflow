import type { RequestHandler } from 'express';
import {
  changeAgentStatus,
  createAgent,
  getDiscoverableAgent,
  listOwnedAgents,
  updateAgent,
} from './agent.service.js';
import {
  agentIdSchema,
  agentStatusSchema,
  createAgentSchema,
  paginationSchema,
  updateAgentSchema,
} from './agent.validation.js';

export const createAgentController: RequestHandler = async (request, response) => {
  const parsed = createAgentSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }

  const agent = await createAgent(response.locals.userId as string, parsed.data);
  response.status(201).json({ agent });
};

export const listOwnedAgentsController: RequestHandler = async (request, response) => {
  const parsed = paginationSchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid query', details: parsed.error.issues });
    return;
  }

  response.json(await listOwnedAgents(
    response.locals.userId as string,
    parsed.data.page,
    parsed.data.limit,
  ));
};

export const getDiscoverableAgentController: RequestHandler = async (request, response) => {
  const parsedId = agentIdSchema.safeParse(request.params.agentId);
  if (!parsedId.success) {
    response.status(400).json({ error: 'Invalid agent ID' });
    return;
  }
  response.json({ agent: await getDiscoverableAgent(parsedId.data) });
};

export const updateAgentController: RequestHandler = async (request, response) => {
  const parsedId = agentIdSchema.safeParse(request.params.agentId);
  const parsedBody = updateAgentSchema.safeParse(request.body);
  if (!parsedId.success || !parsedBody.success) {
    response.status(400).json({ error: 'Invalid request' });
    return;
  }

  const agent = await updateAgent(
    response.locals.userId as string,
    parsedId.data,
    parsedBody.data,
  );
  response.json({ agent });
};

export const changeAgentStatusController: RequestHandler = async (request, response) => {
  const parsedId = agentIdSchema.safeParse(request.params.agentId);
  const parsedBody = agentStatusSchema.safeParse(request.body);
  if (!parsedId.success || !parsedBody.success) {
    response.status(400).json({ error: 'Invalid request' });
    return;
  }

  const agent = await changeAgentStatus(
    response.locals.userId as string,
    parsedId.data,
    parsedBody.data.status,
  );
  response.json({ agent });
};
