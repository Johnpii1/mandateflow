import type { RequestHandler } from 'express';
import { createMandateDraft, getMandate, listMandates } from './mandate.service.js';
import {
  createMandateSchema,
  mandateIdSchema,
  mandateListQuerySchema,
} from './mandate.validation.js';

export const createMandateController: RequestHandler = async (request, response) => {
  const parsed = createMandateSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }
  const mandate = await createMandateDraft(response.locals.userId as string, parsed.data);
  response.status(201).json({ mandate });
};

export const getMandateController: RequestHandler = async (request, response) => {
  const parsedId = mandateIdSchema.safeParse(request.params.mandateId);
  if (!parsedId.success) {
    response.status(400).json({ error: 'Invalid mandate ID' });
    return;
  }
  response.json({ mandate: await getMandate(parsedId.data, response.locals.userId as string) });
};

export const listMandatesController: RequestHandler = async (request, response) => {
  const parsed = mandateListQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid query', details: parsed.error.issues });
    return;
  }
  response.json(await listMandates(
    response.locals.userId as string,
    parsed.data.page,
    parsed.data.limit,
  ));
};
