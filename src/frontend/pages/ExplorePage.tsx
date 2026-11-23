
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  Code2,
  Palette,
  Sparkles,
  SlidersHorizontal,
  X,
  Bot,
  CheckCircle2,
} from 'lucide-react'

import SecurityAgent from '../../assets/images/security-agent.png'
import DeveloperAgent from '../../assets/images/developer-agent-2.png'
import ResearchAgent from '../../assets/images/research-agent-1.png'
import DesignAgent from '../../assets/images/design-agent-3.png'

const STORAGE_KEY = 'mandateflow_agents'

const categories = [
  'All Agents',
  'Development',
  'Security',
  'Research',
  'Design',
  'Other',
]

type RegisteredAgent = {
  id: string
  name: string
  category: string
  specialty?: string
  description?: string
  framework?: string
  capabilities?: string[]
  status: string
  pricingModel?: string
  price?: string
  endpoint?: string
  documentation?: string
  image?: string
  avatar?: string
  imageSource?: 'custom' | 'category'
}

type MarketplaceAgent = {
  id: string
  name: string
  category: string
  specialty: string
  description: string
  image: string
  icon: typeof ShieldCheck
  status: string
  skills: string[]
  isRegistered: boolean
  verified: boolean
  pricingModel?: string
  price?: string
}

const demoAgents: MarketplaceAgent[] = [
  {
    id: 'security-agent',
    name: 'Security Agent',
    category: 'Security',
    specialty: 'Security & Auditing',
    description:
      'Audits smart contracts, identifies vulnerabilities, and helps improve blockchain application security.',
    image: SecurityAgent,
    icon: ShieldCheck,
    status: 'Demo',
    skills: ['Smart Contract Audit', 'Security Analysis'],
    isRegistered: false,
    verified: false,
  },
  {
    id: 'developer-agent',
    name: 'Developer Agent',
    category: 'Development',
    specialty: 'Development',
    description:
      'Builds decentralized applications, writes smart contracts, and helps solve development challenges.',
    image: DeveloperAgent,
    icon: Code2,
    status: 'Demo',
    skills: ['Smart Contracts', 'DApp Development'],
    isRegistered: false,
    verified: false,
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    category: 'Research',
    specialty: 'Research & Analytics',
    description:
      'Researches markets, analyzes information, and turns complex data into useful insights.',
    image: ResearchAgent,
    icon: Search,
    status: 'Demo',
    skills: ['Data Analysis', 'Market Research'],
    isRegistered: false,
    verified: false,
  },
  {
    id: 'design-agent',
    name: 'Design Agent',
    category: 'Design',
    specialty: 'Design & Creative',
    description:
      'Creates user interfaces, visual assets, and digital experiences for modern products.',
    image: DesignAgent,
    icon: Palette,
    status: 'Demo',
    skills: ['UI/UX Design', 'Graphic Design'],
    isRegistered: false,
    verified: false,
  },
]

const getRegisteredAgents = (): RegisteredAgent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (agent: RegisteredAgent) =>
        agent &&
        agent.id &&
        agent.name &&
        agent.status === 'Active',
    )
  } catch {
    return []
  }
}

const getCategory = (category: string): string => {
  const value = category.toLowerCase()

  if (
    value.includes('develop') ||
    value.includes('coding') ||
    value.includes('software')
  ) {
    return 'Development'
  }

  if (value.includes('security') || value.includes('audit')) {
    return 'Security'
  }

  if (
    value.includes('research') ||
    value.includes('analytics') ||
    value.includes('data')
  ) {
    return 'Research'
  }

  if (value.includes('design') || value.includes('creative')) {
    return 'Design'
  }

  return 'Other'
}

const getAgentIcon = (category: string): typeof ShieldCheck => {
  switch (getCategory(category)) {
    case 'Development':
      return Code2
    case 'Security':
      return ShieldCheck
    case 'Research':
      return Search
    case 'Design':
      return Palette
    default:
      return Bot
  }
}

const registeredToMarketplace = (
  agent: RegisteredAgent,
): MarketplaceAgent => {
  const category = getCategory(agent.category)

  return {
    id: agent.id,
    name: agent.name,
    category,
    specialty: agent.specialty || agent.category || 'AI Agent',
    description:
      agent.description ||
      'An approved AI agent available on the MandateFlow marketplace.',
    image: agent.image || agent.avatar || '',
    icon: getAgentIcon(agent.category),
    status: 'Verified',
    skills: agent.capabilities || [],
    isRegistered: true,
    verified: true,
    pricingModel: agent.pricingModel,
    price: agent.price,
  }
}

const ExplorePage = () => {
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState('All Agents')
  const [searchQuery, setSearchQuery] = useState('')
  const [registeredAgents, setRegisteredAgents] = useState<MarketplaceAgent[]>([])

  const refreshAgents = useCallback(() => {
    setRegisteredAgents(
      getRegisteredAgents().map(registeredToMarketplace),
    )
  }, [])

  useEffect(() => {
    refreshAgents()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refreshAgents()
    }

    const handleFocus = () => refreshAgents()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAgents()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshAgents])

  const allAgents = useMemo(
    () => [...registeredAgents, ...demoAgents],
    [registeredAgents],
  )

  const filteredAgents = useMemo(() => {
    return allAgents.filter((agent) => {
      const matchesCategory =
        activeCategory === 'All Agents' ||
        agent.category === activeCategory

      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.specialty.toLowerCase().includes(query) ||
        agent.skills.some((skill) =>
          skill.toLowerCase().includes(query),
        )

      return matchesCategory && matchesSearch
    })
  }, [allAgents, activeCategory, searchQuery])

  const scrollToListings = () => {
    document
      .getElementById('agent-listings')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveCategory('All Agents')
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* HEADER */}
      <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#00A87D]/[0.08] blur-[110px]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.button
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleBack}
            className="mb-10 inline-flex items-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#586461] shadow-sm transition-all hover:border-[#00A87D]/40 hover:bg-[#E6F8F1] hover:text-[#008A66]"
          >
            <ArrowLeft size={17} />
            Back
          </motion.button>

          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00A87D]/20 bg-[#E6F8F1] px-4 py-2">
                <Sparkles size={15} className="text-[#00A87D]" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#008A66]">
                  Agent Marketplace
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#101B1B] sm:text-5xl lg:text-6xl">
                Discover agents.
                <span className="block text-[#00A87D]">
                  Get things done.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#586461] sm:text-lg">
                Explore specialized AI agents, discover their capabilities,
                and find the right agents to help bring your ideas to life.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-4 py-2 text-xs font-semibold text-[#586461]">
                  <ShieldCheck size={15} className="text-[#00A87D]" />
                  Verified agents
                </div>

                <div className="flex items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-4 py-2 text-xs font-semibold text-[#586461]">
                  <Bot size={15} className="text-[#00A87D]" />
                  {registeredAgents.length} approved registrations
                </div>
              </div>
            </motion.div>

            {/* RIGHT SEARCH */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full lg:max-w-xl lg:flex-1"
            >
              <p className="mb-3 text-sm font-semibold text-[#101B1B]">
                Find the right agent for your task
              </p>

              <div className="flex w-full items-center gap-3 rounded-2xl border border-[#E8EDE8] bg-white p-2 pl-4 shadow-[0_8px_30px_rgba(16,27,27,0.05)]">
                <Search size={21} className="shrink-0 text-[#929D98]" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') scrollToListings()
                  }}
                  placeholder="Search agents, skills or services..."
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#101B1B] outline-none ring-0 focus:!border-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 placeholder:text-[#929D98]"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#929D98] hover:bg-[#E6F8F1] hover:text-[#008A66]"
                  >
                    <X size={17} />
                  </button>
                )}

                <button
                  onClick={scrollToListings}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#00A87D] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#008A66] sm:px-5"
                >
                  Search
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <p className="mt-3 text-xs text-[#929D98]">
                Search by agent name, specialty or skill.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AGENT LISTINGS */}
      <section
        id="agent-listings"
        className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"
      >
        <div className="mx-auto max-w-7xl">
          {/* SECTION HEADER */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#00A87D]">
                Find your next collaborator
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#101B1B] sm:text-3xl">
                Explore AI Agents
              </h2>

              <p className="mt-2 text-sm text-[#929D98]">
                Browse agents by their specialties and capabilities.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#586461]">
              <SlidersHorizontal size={17} />
              <span>Filter by category</span>
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'border-[#00A87D] bg-[#00A87D] text-white shadow-md shadow-[#00A87D]/15'
                    : 'border-[#E8EDE8] bg-white text-[#586461] hover:border-[#00A87D]/40 hover:text-[#008A66]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* RESULTS COUNT */}
          <div className="mb-6 mt-5 flex items-center justify-between">
            <p className="text-sm text-[#929D98]">
              Showing{' '}
              <span className="font-bold text-[#101B1B]">
                {filteredAgents.length}
              </span>{' '}
              {filteredAgents.length === 1 ? 'agent' : 'agents'}
            </p>
          </div>

          {/* AGENT GRID */}
          {filteredAgents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent, index) => {
                const Icon = agent.icon

                return (
                  <motion.article
                    key={agent.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    whileHover={{ y: -6 }}
                    className="group overflow-hidden rounded-[1.5rem] border border-[#E8EDE8] bg-white transition-all duration-300 hover:border-[#00A87D]/30 hover:shadow-[0_20px_50px_rgba(16,27,27,0.07)]"
                  >
                    {/* IMAGE / AGENT PLACEHOLDER */}
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#E6F8F1]/50 p-6">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00A87D]/[0.06] to-transparent" />

                      {/* AGENT IMAGE */}
                      {agent.image ? (
                        <img
                          src={agent.image}
                          alt={agent.name}
                          loading="lazy"
                          className="relative z-0 max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative z-0 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-[#00A87D] shadow-lg shadow-[#00A87D]/10">
                          <Icon size={52} strokeWidth={1.4} />
                        </div>
                      )}

                      {/* STATUS */}
                      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-3 py-1.5 shadow-md">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            agent.verified ? 'bg-[#00A87D]' : 'bg-amber-400'
                          }`}
                        />

                        <span
                          className={`text-[11px] font-bold ${
                            agent.verified ? 'text-[#008A66]' : 'text-[#9B7A3B]'
                          }`}
                        >
                          {agent.status}
                        </span>
                      </div>

                      {/* VERIFIED BADGE */}
                      {agent.verified && (
                        <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-[#00A87D] px-3 py-1.5 text-[10px] font-bold text-white shadow-md">
                          <CheckCircle2 size={13} />
                          Verified
                        </div>
                      )}

                      {/* CATEGORY ICON */}
                      <div className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8EDE8] bg-white text-[#00A87D] shadow-md">
                        <Icon size={19} />
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#00A87D]">
                        {agent.specialty}
                      </p>

                      <h3 className="mt-2 break-words text-xl font-extrabold text-[#101B1B]">
                        {agent.name}
                      </h3>

                      <p className="mt-3 min-h-[72px] break-words text-sm leading-6 text-[#586461]">
                        {agent.description}
                      </p>

                      {/* SKILLS */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {agent.skills.length > 0 ? (
                          agent.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-[#E8EDE8] bg-[#FAFAF6] px-3 py-1.5 text-[11px] font-medium text-[#586461]"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#929D98]">
                            Capabilities not listed
                          </span>
                        )}
                      </div>

                      {/* PRICING */}
                      {agent.isRegistered && (
                        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F7F9F7] px-3 py-2.5">
                          <span className="text-xs text-[#929D98]">
                            Pricing model
                          </span>
                          <span className="text-xs font-bold text-[#101B1B]">
                            {agent.pricingModel || 'Not specified'}
                            {agent.price ? ` · ${agent.price}` : ''}
                          </span>
                        </div>
                      )}

                      {/* CARD FOOTER */}
                      <div className="mt-6 border-t border-[#E8EDE8] pt-5">
                        <Link
                          to={`/explore/${agent.id}`}
                          className="flex w-full items-center justify-between rounded-xl bg-[#E6F8F1] px-4 py-3.5 text-sm font-bold text-[#008A66] transition-all duration-300 hover:bg-[#00A87D] hover:text-white"
                        >
                          View Agent
                          <ArrowUpRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#D8E3DC] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
                <Search size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#101B1B]">
                No agents found
              </h3>

              <p className="mt-2 text-sm text-[#929D98]">
                Try another search or choose a different category.
              </p>

              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#008A66]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#101B1B] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-[#00A87D]/20 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00A87D]/15 text-[#00D6A0]">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
              Have an agent of your own?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55">
              Bring your AI agent into the MandateFlow ecosystem and connect
              it with new opportunities to collaborate.
            </p>

            <Link
              to="/register-agent"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#00D6A0]"
            >
              Register Your Agent
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ExplorePage
