
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Search,
  Palette,
  Sparkles,
  CheckCircle2,
  Star,
  BriefcaseBusiness,
  Clock3,
  ChevronRight,
  Bot,
  Globe,
  FileText,
} from 'lucide-react'

import SecurityAgent from '../../assets/images/security-agent.png'
import DeveloperAgent from '../../assets/images/developer-agent-2.png'
import ResearchAgent from '../../assets/images/research-agent-1.png'
import DesignAgent from '../../assets/images/design-agent-3.png'

const STORAGE_KEY = 'mandateflow_agents'

type Agent = {
  id: string
  name: string
  category: string
  specialty: string
  description: string
  longDescription: string
  image: string
  icon: typeof Bot
  status: string
  skills: string[]
  services: string[]
  pricing: string
  framework?: string
  endpoint?: string
  documentation?: string
  isRegistered?: boolean
}

type SavedAgent = {
  id: string
  name: string
  category: string
  specialty?: string
  description?: string
  framework?: string
  pricingModel?: string
  price?: string
  pricing?: string
  capabilities?: string[]
  endpoint?: string
  documentation?: string

  // Images saved by RegisterAgentPage
  image?: string
  avatar?: string
  imageSource?: 'custom' | 'category'

  status?: string
}

const demoAgents: Agent[] = [
  {
    id: 'security-agent',
    name: 'Security Agent',
    category: 'Security',
    specialty: 'Security & Auditing',
    description:
      'Audits smart contracts, identifies vulnerabilities, and helps improve blockchain application security.',
    longDescription:
      'The Security Agent helps blockchain teams identify potential vulnerabilities before they become serious problems. It reviews smart contract logic, examines common security risks, and provides recommendations that help developers build safer decentralized applications.',
    image: SecurityAgent,
    icon: ShieldCheck,
    status: 'Demo',
    skills: [
      'Smart Contract Audit',
      'Security Analysis',
      'Vulnerability Detection',
      'Code Review',
    ],
    services: [
      'Smart contract security review',
      'Vulnerability analysis',
      'Security recommendations',
      'Code risk assessment',
    ],
    pricing: '120 USDC / task',
  },
  {
    id: 'developer-agent',
    name: 'Developer Agent',
    category: 'Development',
    specialty: 'Development',
    description:
      'Builds decentralized applications, writes smart contracts, and helps solve development challenges.',
    longDescription:
      'The Developer Agent supports product teams with software development tasks. From building decentralized applications to writing smart contracts, it helps turn technical requirements into practical development solutions.',
    image: DeveloperAgent,
    icon: Code2,
    status: 'Demo',
    skills: [
      'Smart Contracts',
      'DApp Development',
      'Frontend Development',
      'Debugging',
    ],
    services: [
      'Smart contract development',
      'DApp development',
      'Frontend implementation',
      'Code debugging and review',
    ],
    pricing: '85 USDC / task',
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    category: 'Research',
    specialty: 'Research & Analytics',
    description:
      'Researches markets, analyzes information, and turns complex data into useful insights.',
    longDescription:
      'The Research Agent helps individuals and teams make better-informed decisions. It gathers information, studies trends, analyzes data, and organizes findings into clear, useful insights.',
    image: ResearchAgent,
    icon: Search,
    status: 'Demo',
    skills: [
      'Data Analysis',
      'Market Research',
      'Trend Analysis',
      'Research Reports',
    ],
    services: [
      'Market research',
      'Competitor analysis',
      'Data interpretation',
      'Research report preparation',
    ],
    pricing: '45 USDC / task',
  },
  {
    id: 'design-agent',
    name: 'Design Agent',
    category: 'Design',
    specialty: 'Design & Creative',
    description:
      'Creates user interfaces, visual assets, and digital experiences for modern products.',
    longDescription:
      'The Design Agent helps transform product ideas into polished digital experiences. It supports interface design, visual direction, and creative production for modern applications and brands.',
    image: DesignAgent,
    icon: Palette,
    status: 'Demo',
    skills: [
      'UI/UX Design',
      'Graphic Design',
      'Interface Design',
      'Visual Design',
    ],
    services: [
      'Website interface design',
      'Dashboard design',
      'Visual asset creation',
      'Design improvement suggestions',
    ],
    pricing: '95 USDC / task',
  },
]

const getCategoryDetails = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'security':
      return { image: SecurityAgent, icon: ShieldCheck }
    case 'development':
    case 'developer':
      return { image: DeveloperAgent, icon: Code2 }
    case 'design':
      return { image: DesignAgent, icon: Palette }
    case 'research':
      return { image: ResearchAgent, icon: Search }
    default:
      return { image: ResearchAgent, icon: Bot }
  }
}

const getSavedAgents = (): SavedAgent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Unable to load registered agents:', error)
    return []
  }
}

const getPricing = (agent: SavedAgent) => {
  if (agent.pricing) return agent.pricing

  if (!agent.price || agent.pricingModel === 'Free') {
    return 'Free'
  }

  const model = (agent.pricingModel || 'Per task')
    .toLowerCase()
    .replace('per ', '')

  return `${agent.price} USDC / ${model}`
}

const mapRegisteredAgent = (saved: SavedAgent): Agent => {
  const categoryDetails = getCategoryDetails(saved.category)

  const capabilities =
    Array.isArray(saved.capabilities) && saved.capabilities.length > 0
      ? saved.capabilities
      : ['Capabilities not provided']

  const services = capabilities

  return {
    id: saved.id,
    name: saved.name || 'Unnamed Agent',
    category: saved.category || 'Other',
    specialty:
      saved.specialty || saved.description || 'Specialty not provided',

    description:
      saved.description || 'This agent has been registered on MandateFlow.',

    longDescription:
      saved.description ||
      'This agent has been submitted to MandateFlow. Its profile information and capabilities are provided by its creator and are awaiting verification.',

    // FIX: Display the uploaded image instead of always using the category image.
    // Fall back to the category image if no custom image was uploaded.
    image: saved.image || saved.avatar || categoryDetails.image,

    icon: categoryDetails.icon,
    status: saved.status || 'Pending Verification',
    skills: capabilities,
    services,
    pricing: getPricing(saved),
    framework: saved.framework,
    endpoint: saved.endpoint,
    documentation: saved.documentation,
    isRegistered: true,
  }
}

const AgentDetailsPage = () => {
  const { id: agentId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')

  const agent = useMemo(() => {
    if (!agentId) return undefined

    const registeredAgents = getSavedAgents().map(mapRegisteredAgent)
    const allAgents = [...registeredAgents, ...demoAgents]

    return allAgents.find((item) => item.id === agentId)
  }, [agentId])

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
            <Search size={28} />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-[#101B1B]">
            Agent not found
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#586461]">
            This agent could not be found in your registered agents or demo
            profiles. Return to your dashboard and check that the agent was
            saved successfully.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-6 py-3 font-bold text-white transition-colors hover:bg-[#008A66]"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-6 py-3 font-bold text-[#586461] hover:text-[#00A87D]"
            >
              Explore Agents
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const AgentIcon = agent.icon
  const tabs = ['Overview', 'Capabilities', 'Services']

  const statusStyles =
    agent.status === 'Active'
      ? 'bg-[#E6F8F1] text-[#008A66]'
      : agent.status === 'Pending Verification'
        ? 'bg-amber-50 text-amber-700'
        : agent.status === 'Inactive'
          ? 'bg-[#F2F4F2] text-[#586461]'
          : 'bg-[#E6F8F1] text-[#008A66]'

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* TOP NAVIGATION */}
      <header className="border-b border-[#E8EDE8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A87D] text-white">
              <Sparkles size={19} />
            </div>

            <span className="text-lg font-extrabold tracking-tight text-[#101B1B]">
              Mandate<span className="text-[#00A87D]">Flow</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {agent.isRegistered && (
              <Link
                to="/dashboard"
                className="hidden text-sm font-semibold text-[#586461] transition-colors hover:text-[#00A87D] sm:inline-flex"
              >
                My Dashboard
              </Link>
            )}

            <Link
              to="/explore"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#586461] transition-colors hover:text-[#00A87D]"
            >
              <ArrowLeft size={17} />
              Explore Agents
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="px-5 pb-20 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          {/* BREADCRUMB */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#929D98]">
            <Link to="/" className="hover:text-[#00A87D]">
              Home
            </Link>
            <ChevronRight size={15} />
            <Link to="/explore" className="hover:text-[#00A87D]">
              Explore Agents
            </Link>
            <ChevronRight size={15} />
            <span className="break-all font-semibold text-[#101B1B]">
              {agent.name}
            </span>
          </div>

          {/* AGENT PROFILE HERO */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[2rem] border border-[#E8EDE8] bg-white shadow-[0_10px_40px_rgba(16,27,27,0.04)]"
          >
            <div className="grid min-w-0 lg:grid-cols-[0.9fr_1.1fr]">
              {/* IMAGE */}
              <div className="relative flex min-h-[320px] min-w-0 items-center justify-center overflow-hidden bg-[#E6F8F1]/50 p-8 sm:min-h-[400px] lg:min-h-[480px]">
                <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#00A87D]/10 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#00D6A0]/10 blur-[90px]" />

                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  src={agent.image}
                  alt={agent.name}
                  className="relative z-10 max-h-[340px] max-w-full object-contain sm:max-h-[390px]"
                />

                <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-3 py-2 shadow-sm sm:left-6 sm:top-6 sm:px-4">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      agent.status === 'Active'
                        ? 'bg-[#00A87D]'
                        : agent.status === 'Pending Verification'
                          ? 'bg-amber-500'
                          : 'bg-[#929D98]'
                    }`}
                  />
                  <span className="break-words text-xs font-bold text-[#586461]">
                    {agent.status}
                  </span>
                </div>

                <div className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8EDE8] bg-white text-[#00A87D] shadow-sm">
                  <AgentIcon size={23} />
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-14">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="max-w-full break-words rounded-full bg-[#E6F8F1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#008A66]">
                    {agent.category}
                  </span>

                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${statusStyles}`}
                  >
                    <CheckCircle2 size={14} />
                    {agent.isRegistered ? 'Registered Agent' : 'Demo Agent'}
                  </span>
                </div>

                <p className="break-words text-sm font-semibold text-[#00A87D]">
                  {agent.specialty}
                </p>

                <h1 className="mt-3 break-words text-3xl font-extrabold leading-tight tracking-tight text-[#101B1B] sm:text-4xl lg:text-5xl">
                  {agent.name}
                </h1>

                <p className="mt-5 max-w-xl break-words text-base leading-8 text-[#586461]">
                  {agent.description}
                </p>

                <div className="mt-8 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 rounded-2xl border border-[#E8EDE8] bg-[#FAFAF6] p-4">
                    <div className="flex items-center gap-2 text-[#929D98]">
                      <BriefcaseBusiness size={17} />
                      <span className="text-xs font-medium">Category</span>
                    </div>
                    <p className="mt-3 break-words text-sm font-bold text-[#101B1B]">
                      {agent.category}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-[#E8EDE8] bg-[#FAFAF6] p-4">
                    <div className="flex items-center gap-2 text-[#929D98]">
                      <Clock3 size={17} />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <p className="mt-3 break-words text-sm font-bold text-[#101B1B]">
                      {agent.status}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#E8EDE8] bg-[#FAFAF6] p-4">
                  <p className="text-xs font-medium text-[#929D98]">
                    Pricing
                  </p>
                  <p className="mt-2 break-words text-lg font-bold text-[#101B1B]">
                    {agent.pricing}
                  </p>
                </div>

                {agent.isRegistered && agent.status === 'Pending Verification' && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-800">
                      Awaiting verification
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      Your agent profile has been saved. It is still pending
                      verification and should not be treated as an approved,
                      active marketplace agent yet.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row">
                  {agent.isRegistered ? (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-7 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#008A66]"
                    >
                      Back to My Agents
                      <ArrowUpRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/hire/${agent.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-7 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#008A66]"
                    >
                      Hire This Agent
                      <ArrowUpRight size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/explore')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-7 py-4 text-sm font-bold text-[#586461] transition-all hover:border-[#00A87D]/40 hover:text-[#008A66]"
                  >
                    <ArrowLeft size={17} />
                    All Agents
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* DETAILS SECTION */}
          <section className="mt-12 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {/* TABS */}
              <div className="flex gap-7 overflow-x-auto border-b border-[#E8EDE8]">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative shrink-0 pb-4 text-sm font-bold transition-colors ${
                      activeTab === tab
                        ? 'text-[#008A66]'
                        : 'text-[#929D98] hover:text-[#586461]'
                    }`}
                  >
                    {tab}

                    {activeTab === tab && (
                      <motion.span
                        layoutId="agent-details-tab"
                        className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#00A87D]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="min-w-0 py-8"
              >
                {activeTab === 'Overview' && (
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-extrabold text-[#101B1B]">
                      About this agent
                    </h2>

                    <p className="mt-5 break-words text-sm leading-8 text-[#586461]">
                      {agent.longDescription}
                    </p>

                    {agent.framework && (
                      <div className="mt-6 rounded-2xl border border-[#E8EDE8] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#929D98]">
                          Framework
                        </p>
                        <p className="mt-2 break-words text-sm font-bold text-[#101B1B]">
                          {agent.framework}
                        </p>
                      </div>
                    )}

                    <div className="mt-8 rounded-2xl border border-[#E8EDE8] bg-white p-6">
                      <h3 className="text-lg font-bold text-[#101B1B]">
                        What this agent can help with
                      </h3>

                      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                        {agent.services.map((service) => (
                          <div
                            key={service}
                            className="flex min-w-0 items-start gap-3"
                          >
                            <CheckCircle2
                              size={18}
                              className="mt-0.5 shrink-0 text-[#00A87D]"
                            />
                            <span className="break-words text-sm text-[#586461]">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Capabilities' && (
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-extrabold text-[#101B1B]">
                      Skills & capabilities
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#586461]">
                      Explore the areas this agent is designed to support.
                    </p>

                    <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
                      {agent.skills.map((skill, index) => (
                        <div
                          key={skill}
                          className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#E8EDE8] bg-white p-5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                            <Sparkles size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#929D98]">
                              Capability {index + 1}
                            </p>
                            <p className="mt-1 break-words text-sm font-bold text-[#101B1B]">
                              {skill}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Services' && (
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-extrabold text-[#101B1B]">
                      Available services
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#586461]">
                      These are the services listed in this agent's profile.
                    </p>

                    <div className="mt-6 space-y-3">
                      {agent.services.map((service) => (
                        <div
                          key={service}
                          className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-[#E8EDE8] bg-white p-5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                              <CheckCircle2 size={19} />
                            </div>

                            <span className="break-words text-sm font-semibold text-[#101B1B]">
                              {service}
                            </span>
                          </div>

                          <ArrowUpRight
                            size={18}
                            className="shrink-0 text-[#929D98]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-[#E8EDE8] bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                    <Star size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-[#101B1B]">
                      Agent reputation
                    </h3>
                    <p className="text-xs text-[#929D98]">
                      Reputation preview
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#FAFAF6] p-4">
                  <p className="text-sm font-semibold text-[#586461]">
                    Reputation data
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#929D98]">
                    Ratings and completed task history will appear here when
                    real agent activity is connected.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8EDE8] bg-white p-6">
                <h3 className="font-bold text-[#101B1B]">
                  Agent information
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-sm text-[#929D98]">
                      Category
                    </span>
                    <span className="break-words text-right text-sm font-semibold text-[#101B1B]">
                      {agent.category}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-sm text-[#929D98]">
                      Profile
                    </span>
                    <span className="break-words text-right text-sm font-semibold text-[#101B1B]">
                      {agent.isRegistered ? 'Registered' : 'Demo'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-sm text-[#929D98]">
                      Status
                    </span>
                    <span className="break-words text-right text-sm font-semibold text-[#101B1B]">
                      {agent.status}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-sm text-[#929D98]">
                      Skills
                    </span>
                    <span className="text-sm font-semibold text-[#101B1B]">
                      {agent.skills.length}
                    </span>
                  </div>
                </div>
              </div>

              {agent.endpoint && (
                <div className="rounded-2xl border border-[#E8EDE8] bg-white p-6">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-[#00A87D]" />
                    <h3 className="font-bold text-[#101B1B]">
                      Agent endpoint
                    </h3>
                  </div>

                  <p className="mt-3 break-all text-sm leading-6 text-[#586461]">
                    {agent.endpoint}
                  </p>
                </div>
              )}

              {agent.documentation && (
                <div className="rounded-2xl border border-[#E8EDE8] bg-white p-6">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#00A87D]" />
                    <h3 className="font-bold text-[#101B1B]">
                      Documentation
                    </h3>
                  </div>

                  <a
                    href={agent.documentation}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-[#008A66] hover:text-[#00A87D]"
                  >
                    View documentation
                    <ArrowUpRight size={15} className="shrink-0" />
                  </a>
                </div>
              )}

              <div className="rounded-2xl border border-[#BDEBDD] bg-[#E6F8F1] p-6">
                <div className="flex items-center gap-2 text-[#008A66]">
                  <Sparkles size={18} />
                  <h3 className="font-bold">
                    {agent.isRegistered
                      ? 'Manage your agent'
                      : 'Ready to collaborate?'}
                  </h3>
                </div>

                <p className="mt-3 break-words text-sm leading-6 text-[#586461]">
                  {agent.isRegistered
                    ? 'Return to your dashboard to manage this agent and check its verification status.'
                    : 'Start by exploring what this agent can do for your next task.'}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      agent.isRegistered
                        ? '/dashboard'
                        : `/hire/${agent.id}`,
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#008A66]"
                >
                  {agent.isRegistered ? 'Go to Dashboard' : 'Hire Agent'}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </aside>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E8EDE8] bg-white px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <Link to="/" className="text-lg font-extrabold text-[#101B1B]">
            Mandate<span className="text-[#00A87D]">Flow</span>
          </Link>

          <p className="text-center text-xs text-[#929D98]">
            Built for the agent-powered economy.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AgentDetailsPage
