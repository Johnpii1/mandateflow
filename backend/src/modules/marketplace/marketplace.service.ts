import { Types, type PipelineStage } from 'mongoose';
import { Agent } from '../agents/agent.model.js';
import type { MarketplaceQuery } from './marketplace.validation.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function publicProjection(): PipelineStage.Project {
  return {
    $project: {
      _id: 0,
      agentId: 1,
      name: 1,
      slug: 1,
      description: 1,
      avatarUrl: 1,
      category: 1,
      capabilities: 1,
      serviceDescription: 1,
      pricing: 1,
      status: 1,
      verificationStatus: 1,
      createdAt: 1,
    },
  };
}

export async function searchMarketplace(query: MarketplaceQuery) {
  const match: Record<string, unknown> = {
    status: 'active',
    isDiscoverable: true,
  };

  if (query.category) match.category = query.category.toLowerCase();
  if (query.capability) match.capabilities = query.capability.toLowerCase();
  if (query.chainId !== undefined) match['pricing.chainId'] = query.chainId;
  if (query.token) match['pricing.token'] = query.token.toUpperCase();

  if (query.search) {
    const safeSearch = new RegExp(escapeRegex(query.search), 'i');
    match.$or = [
      { name: safeSearch },
      { description: safeSearch },
      { serviceDescription: safeSearch },
    ];
  }

  const pipeline: PipelineStage[] = [{ $match: match }];
  const priceFilter: Record<string, Types.Decimal128> = {};

  if (query.priceMin !== undefined) {
    priceFilter.$gte = Types.Decimal128.fromString(query.priceMin);
  }
  if (query.priceMax !== undefined) {
    priceFilter.$lte = Types.Decimal128.fromString(query.priceMax);
  }

  if (Object.keys(priceFilter).length > 0 || query.sort.startsWith('price_')) {
    pipeline.push(
      {
        $addFields: {
          __price: {
            $convert: { input: '$pricing.amount', to: 'decimal', onError: null, onNull: null },
          },
        },
      },
      { $match: { __price: { $ne: null, ...priceFilter } } },
    );
  }

  let sortStage: Record<string, 1 | -1>;
  if (query.sort === 'price_asc') {
    sortStage = { __price: 1, createdAt: -1, _id: 1 };
  } else if (query.sort === 'price_desc') {
    sortStage = { __price: -1, createdAt: -1, _id: 1 };
  } else {
    sortStage = { createdAt: -1, _id: 1 };
  }

  pipeline.push({
    $facet: {
      agents: [
        { $sort: sortStage },
        { $skip: (query.page - 1) * query.limit },
        { $limit: query.limit },
        publicProjection(),
      ],
      count: [{ $count: 'total' }],
    },
  });

  const [result] = await Agent.aggregate<{
    agents: Record<string, unknown>[];
    count: Array<{ total: number }>;
  }>(pipeline);
  const total = result?.count[0]?.total ?? 0;

  return {
    agents: result?.agents ?? [],
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}

export async function listMarketplaceCategories(): Promise<string[]> {
  return Agent.distinct('category', { status: 'active', isDiscoverable: true }).then((categories) =>
    categories.sort((left, right) => left.localeCompare(right)),
  );
}
