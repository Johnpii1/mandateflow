import { randomUUID } from 'node:crypto';
import type { Types } from 'mongoose';
import { Agent } from './agent.model.js';
import type { CreateAgentInput } from './agent.validation.js';

function toPublicAgent(agent: {
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
  };
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

  return toPublicAgent(agent);
}
