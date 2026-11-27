import { randomUUID } from 'node:crypto';
import type { Types } from 'mongoose';
import { AppError } from '../../common/errors/AppError.js';
import { Agent } from './agent.model.js';
import type { CreateAgentInput, UpdateAgentInput } from './agent.validation.js';

function toAgentDetails(agent: {
  agentId: string;
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  category: string;
  capabilities: string[];
  serviceDescription: string;
  pricing: CreateAgentInput['pricing'];
  endpointUrl?: string;
  status: string;
  verificationStatus: string;
  isDiscoverable: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    agentId: agent.agentId,
    ownerId: agent.ownerId.toString(),
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    avatarUrl: agent.avatarUrl,
    category: agent.category,
    capabilities: agent.capabilities,
    serviceDescription: agent.serviceDescription,
    pricing: agent.pricing,
    endpointUrl: agent.endpointUrl,
    status: agent.status,
    verificationStatus: agent.verificationStatus,
    isDiscoverable: agent.isDiscoverable,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}

function toPublicAgent(agent: Parameters<typeof toAgentDetails>[0]) {
  const { ownerId: _ownerId, endpointUrl: _endpointUrl, ...publicAgent } = toAgentDetails(agent);
  return publicAgent;
}

export async function createAgent(ownerId: string, input: CreateAgentInput) {
  const agentId = randomUUID();
  const normalizedName = input.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const agent = await Agent.create({
    ...input,
    agentId,
    ownerId,
    slug: `${normalizedName || 'agent'}-${agentId.slice(0, 8)}`,
    category: input.category.toLowerCase(),
    capabilities: input.capabilities.map((capability) => capability.toLowerCase()),
    pricing: { ...input.pricing, token: input.pricing.token.toUpperCase() },
    status: 'draft',
    verificationStatus: 'unverified',
    isDiscoverable: false,
  });

  return toAgentDetails(agent);
}

export async function listOwnedAgents(ownerId: string, page: number, limit: number) {
  const filter = { ownerId };
  const [agents, total] = await Promise.all([
    Agent.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Agent.countDocuments(filter),
  ]);

  return {
    agents: agents.map(toAgentDetails),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getDiscoverableAgent(agentId: string) {
  const agent = await Agent.findOne({ agentId, status: 'active', isDiscoverable: true });
  if (!agent) throw new AppError('Agent not found', 404);
  return toPublicAgent(agent);
}

export async function updateAgent(ownerId: string, agentId: string, input: UpdateAgentInput) {
  const existing = await Agent.findOne({ agentId, ownerId });
  if (!existing) throw new AppError('Agent not found', 404);
  if (existing.status === 'archived') throw new AppError('Archived agents cannot be edited', 409);

  const updates = {
    ...input,
    ...(input.category ? { category: input.category.toLowerCase() } : {}),
    ...(input.capabilities
      ? { capabilities: input.capabilities.map((capability) => capability.toLowerCase()) }
      : {}),
    ...(input.pricing ? { pricing: { ...input.pricing, token: input.pricing.token.toUpperCase() } } : {}),
  };
  const agent = await Agent.findOneAndUpdate(
    { agentId, ownerId },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!agent) throw new AppError('Agent not found', 404);
  return toAgentDetails(agent);
}

const allowedTransitions: Record<string, string[]> = {
  draft: ['active', 'archived'],
  active: ['suspended', 'archived'],
  suspended: ['active', 'archived'],
  archived: [],
};

export async function changeAgentStatus(
  ownerId: string,
  agentId: string,
  nextStatus: 'active' | 'suspended' | 'archived',
) {
  const existing = await Agent.findOne({ agentId, ownerId });
  if (!existing) throw new AppError('Agent not found', 404);
  if (!allowedTransitions[existing.status]?.includes(nextStatus)) {
    throw new AppError(`Cannot change agent status from ${existing.status} to ${nextStatus}`, 409);
  }

  const agent = await Agent.findOneAndUpdate(
    { agentId, ownerId, status: existing.status },
    {
      $set: {
        status: nextStatus,
        isDiscoverable: nextStatus === 'active',
      },
    },
    { new: true, runValidators: true },
  );
  if (!agent) throw new AppError('Agent status changed concurrently; reload and retry', 409);
  return toAgentDetails(agent);
}
