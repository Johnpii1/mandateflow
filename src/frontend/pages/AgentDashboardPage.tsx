
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  CheckCircle2,
  Wallet,
  Star,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  MoreHorizontal,
  Activity,
  ShieldCheck,
  Code2,
  Palette,
  Sparkles,
  Menu,
  X,
  Pencil,
  Eye,
  Power,
  TrendingUp,
  Clock3,
  XCircle,
  FileText,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'

import SecurityAgent from '../../assets/images/security-agent.png'
import DeveloperAgent from '../../assets/images/developer-agent-2.png'
import ResearchAgent from '../../assets/images/research-agent-1.png'
import DesignAgent from '../../assets/images/design-agent-3.png'
import WalletLinkCard from '../components/WalletLinkCard'

const STORAGE_KEY = 'mandateflow_agents'
const REQUESTS_STORAGE_KEY = 'mandateflow_hiring_requests'

type AgentStatus = 'Active' | 'Pending Verification' | 'Inactive' | 'Rejected'

type Agent = {
  id: string
  name: string
  category: string
  specialty: string
  image: string
  status: AgentStatus
  tasks: number
  completed: number
  earnings: number
  rating: number
  pricing: string
  icon: typeof Bot
  isRegistered?: boolean
}

type SavedAgent = {
  id: string
  name: string
  category: string
  specialty: string
  description?: string
  framework?: string
  pricingModel?: string
  price?: string
  pricing?: string
  capabilities?: string[]
  endpoint?: string
  documentation?: string
  image?: string
  avatar?: string
  imageSource?: 'custom' | 'category'
  status?: AgentStatus
  tasks?: number
  completed?: number
  earnings?: number
  rating?: number
  createdAt?: string
}

type HiringRequest = {
  id: string
  agentId: string
  agentName: string
  agentCategory: string
  taskTitle: string
  description: string
  requirements: string
  budget: number
  currency: string
  deadline: string
  status: string
  createdAt: string
}

const initialAgents: Agent[] = [
  {
    id: 'security-agent',
    name: 'Security Agent',
    category: 'Security',
    specialty: 'Smart Contract Auditing',
    image: SecurityAgent,
    status: 'Active',
    tasks: 12,
    completed: 9,
    earnings: 420,
    rating: 4.9,
    pricing: '120 USDC / task',
    icon: ShieldCheck,
  },
  {
    id: 'developer-agent',
    name: 'Developer Agent',
    category: 'Development',
    specialty: 'Web3 Development',
    image: DeveloperAgent,
    status: 'Active',
    tasks: 18,
    completed: 14,
    earnings: 580,
    rating: 4.8,
    pricing: '85 USDC / task',
    icon: Code2,
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    category: 'Research',
    specialty: 'Blockchain Research',
    image: ResearchAgent,
    status: 'Pending Verification',
    tasks: 8,
    completed: 6,
    earnings: 180,
    rating: 4.7,
    pricing: '45 USDC / task',
    icon: Sparkles,
  },
  {
    id: 'design-agent',
    name: 'Design Agent',
    category: 'Design',
    specialty: 'Product and UI Design',
    image: DesignAgent,
    status: 'Inactive',
    tasks: 6,
    completed: 4,
    earnings: 120,
    rating: 4.9,
    pricing: '95 USDC / task',
    icon: Palette,
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
      return { image: ResearchAgent, icon: Sparkles }
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
    console.error('Unable to read registered agents:', error)
    return []
  }
}

const getSavedRequests = (): HiringRequest[] => {
  try {
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Unable to read hiring requests:', error)
    return []
  }
}

const getAgentPricing = (agent: SavedAgent) => {
  if (agent.pricing) return agent.pricing

  if (!agent.price || agent.pricingModel === 'Free') {
    return 'Free'
  }

  const model = agent.pricingModel || 'Per task'
  const price = Number(agent.price)
  const formattedPrice = !Number.isNaN(price) ? price : agent.price

  return `${formattedPrice} USDC / ${model.toLowerCase().replace('per ', '')}`
}

const mapSavedAgent = (saved: SavedAgent): Agent => {
  const categoryDetails = getCategoryDetails(saved.category)

  return {
    id: saved.id,
    name: saved.name || 'Unnamed Agent',
    category: saved.category || 'Other',
    specialty: saved.specialty || saved.description || 'Specialty not provided',
    image: saved.image || saved.avatar || categoryDetails.image,
    status: saved.status || 'Pending Verification',
    tasks: saved.tasks ?? 0,
    completed: saved.completed ?? 0,
    earnings: saved.earnings ?? 0,
    rating: saved.rating ?? 0,
    pricing: getAgentPricing(saved),
    icon: categoryDetails.icon,
    isRegistered: true,
  }
}

const tasks = [
  {
    id: 1,
    title: 'Review DeFi smart contract',
    agent: 'Security Agent',
    category: 'Security',
    budget: '120.00',
    deadline: 'Nov 26, 2026',
    status: 'In Progress',
  },
  {
    id: 2,
    title: 'Build wallet connection interface',
    agent: 'Developer Agent',
    category: 'Development',
    budget: '85.00',
    deadline: 'Nov 28, 2026',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Research Layer 2 protocols',
    agent: 'Research Agent',
    category: 'Research',
    budget: '45.00',
    deadline: 'Nov 30, 2026',
    status: 'Pending Review',
  },
]

const completedTasks = [
  {
    id: 1,
    title: 'Analyze blockchain ecosystem',
    agent: 'Research Agent',
    budget: '60.00',
    date: 'Nov 18, 2026',
  },
  {
    id: 2,
    title: 'Design dashboard interface',
    agent: 'Design Agent',
    budget: '95.00',
    date: 'Nov 15, 2026',
  },
  {
    id: 3,
    title: 'Review token contract',
    agent: 'Security Agent',
    budget: '150.00',
    date: 'Nov 12, 2026',
  },
]

const activities = [
  {
    title: 'Task submitted for review',
    detail: 'Research Agent submitted Layer 2 protocol research',
    time: '2 hours ago',
    icon: ClipboardList,
  },
  {
    title: 'New task started',
    detail: 'Developer Agent started wallet connection interface',
    time: '5 hours ago',
    icon: Bot,
  },
  {
    title: 'Task completed',
    detail: 'Design Agent completed dashboard interface',
    time: 'Yesterday',
    icon: CheckCircle2,
  },
  {
    title: 'Payment recorded',
    detail: '150 USDC recorded for completed contract review',
    time: '2 days ago',
    icon: Wallet,
  },
]

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'agents', label: 'My Agents', icon: Bot },
  { id: 'requests', label: 'Hiring Requests', icon: FileText },
  { id: 'incoming', label: 'Incoming Requests', icon: ClipboardList },
  { id: 'tasks', label: 'Active Tasks', icon: ClipboardList },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
]

const formatDate = (date: string) => {
  if (!date) return 'Not specified'

  const parsed = new Date(
    date.length === 10 ? `${date}T00:00:00` : date,
  )

  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatCreatedDate = (date: string) => {
  if (!date) return 'Date unavailable'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return 'Date unavailable'

  return parsed.toLocaleString()
}

const getRequestStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'bg-[#E6F8F1] text-[#008A66]'
    case 'completed':
      return 'bg-blue-50 text-blue-700'
    case 'rejected':
    case 'cancelled':
      return 'bg-red-50 text-red-600'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}

const AgentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [agents, setAgents] = useState<Agent[]>(() => {
    const registeredAgents = getSavedAgents().map(mapSavedAgent)
    return [...registeredAgents, ...initialAgents]
  })

  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>(
    getSavedRequests,
  )

  const [openAgentMenu, setOpenAgentMenu] = useState<string | null>(null)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [editPricing, setEditPricing] = useState('')

  useEffect(() => {
    const refreshRecords = () => {
      const registeredAgents = getSavedAgents().map(mapSavedAgent)
      setAgents([...registeredAgents, ...initialAgents])
      setHiringRequests(getSavedRequests())
    }

    const handleAgentsUpdated = () => refreshRecords()

    window.addEventListener('focus', refreshRecords)
    window.addEventListener('storage', refreshRecords)
    window.addEventListener('mandateflow-agents-updated', handleAgentsUpdated)
    window.addEventListener('mandateflow-requests-updated', refreshRecords)

    return () => {
      window.removeEventListener('focus', refreshRecords)
      window.removeEventListener('storage', refreshRecords)
      window.removeEventListener('mandateflow-agents-updated', handleAgentsUpdated)
      window.removeEventListener('mandateflow-requests-updated', refreshRecords)
    }
  }, [])

  const filteredAgents = useMemo(
    () =>
      agents.filter((agent) =>
        `${agent.name} ${agent.category} ${agent.specialty} ${agent.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [agents, search],
  )

  const filteredTasks = tasks.filter((task) =>
    `${task.title} ${task.agent} ${task.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const filteredRequests = useMemo(
    () =>
      hiringRequests.filter((request) =>
        `${request.taskTitle} ${request.agentName} ${request.agentCategory} ${request.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [hiringRequests, search],
  )

  const registeredAgentIds = useMemo(
    () => new Set(agents.filter((agent) => agent.isRegistered).map((agent) => agent.id)),
    [agents],
  )

  const filteredIncomingRequests = useMemo(
    () =>
      hiringRequests.filter((request) => {
        const belongsToRegisteredAgent = registeredAgentIds.has(request.agentId)

        const matchesSearch =
          `${request.taskTitle} ${request.agentName} ${request.agentCategory} ${request.status}`
            .toLowerCase()
            .includes(search.toLowerCase())

        return belongsToRegisteredAgent && matchesSearch
      }),
    [hiringRequests, registeredAgentIds, search],
  )

  const pendingIncomingCount = hiringRequests.filter(
    (request) =>
      registeredAgentIds.has(request.agentId) &&
      request.status.toLowerCase() === 'pending',
  ).length

  const totalCompleted = agents.reduce(
    (sum, agent) => sum + agent.completed,
    0,
  )

  const totalEarnings = agents.reduce(
    (sum, agent) => sum + agent.earnings,
    0,
  )

  const activeAgents = agents.filter(
    (agent) => agent.status === 'Active',
  ).length

  const averageRating =
    agents.length > 0
      ? (
          agents.reduce((sum, agent) => sum + agent.rating, 0) /
          agents.length
        ).toFixed(1)
      : '0.0'

  const stats = [
    {
      label: 'Total Agents',
      value: agents.length.toString(),
      change: `${activeAgents} currently active`,
      icon: Bot,
    },
    {
      label: 'Hiring Requests',
      value: hiringRequests.length.toString(),
      change: 'Saved in this browser',
      icon: FileText,
    },
    {
      label: 'Completed Tasks',
      value: totalCompleted.toString(),
      change: 'Illustrative demo records',
      icon: CheckCircle2,
    },
    {
      label: 'Total Earnings',
      value: totalEarnings.toLocaleString(),
      suffix: 'USDC',
      change: 'Illustrative demo figure',
      icon: Wallet,
    },
  ]

  const updateSavedAgent = (
    agentId: string,
    updates: Partial<SavedAgent>,
  ) => {
    try {
      const savedAgents = getSavedAgents()

      const updatedAgents = savedAgents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent,
      )

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgents))
      window.dispatchEvent(new Event('mandateflow-agents-updated'))
    } catch (error) {
      console.error('Unable to update registered agent:', error)
    }
  }

  const updateHiringRequestStatus = (
    requestId: string,
    status: 'Accepted' | 'Rejected',
  ) => {
    try {
      const existingRequests = getSavedRequests()

      const requestExists = existingRequests.some(
        (request) => request.id === requestId,
      )

      if (!requestExists) {
        console.error('Hiring request could not be found.')
        return
      }

      const updatedRequests = existingRequests.map((request) =>
        request.id === requestId && request.status === 'Pending'
          ? { ...request, status }
          : request,
      )

      localStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify(updatedRequests),
      )

      setHiringRequests(updatedRequests)
      window.dispatchEvent(new Event('mandateflow-requests-updated'))
    } catch (error) {
      console.error('Unable to update hiring request:', error)
    }
  }

  const openEditModal = (agent: Agent) => {
    setEditingAgentId(agent.id)
    setEditName(agent.name)
    setEditSpecialty(agent.specialty)
    setEditPricing(agent.pricing)
    setOpenAgentMenu(null)
  }

  const saveAgentChanges = () => {
    if (!editingAgentId || !editName.trim() || !editSpecialty.trim()) return

    const updatedValues = {
      name: editName.trim(),
      specialty: editSpecialty.trim(),
      pricing: editPricing.trim() || 'Not specified',
    }

    setAgents((current) =>
      current.map((agent) =>
        agent.id === editingAgentId
          ? { ...agent, ...updatedValues }
          : agent,
      ),
    )

    const editedAgent = agents.find(
      (agent) => agent.id === editingAgentId,
    )

    if (editedAgent?.isRegistered) {
      updateSavedAgent(editingAgentId, updatedValues)
    }

    setEditingAgentId(null)
  }

  const toggleAgentStatus = (agentId: string) => {
    const selectedAgent = agents.find((agent) => agent.id === agentId)
    if (!selectedAgent) return

    if (
      selectedAgent.status === 'Pending Verification' ||
      selectedAgent.status === 'Rejected' ||
      !selectedAgent.isRegistered
    ) {
      setOpenAgentMenu(null)
      return
    }

    const newStatus =
      selectedAgent.status === 'Inactive' ? 'Active' : 'Inactive'

    setAgents((current) =>
      current.map((agent) =>
        agent.id === agentId ? { ...agent, status: newStatus } : agent,
      ),
    )

    updateSavedAgent(agentId, { status: newStatus })
    setOpenAgentMenu(null)
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#E6F8F1] text-[#008A66]'
      case 'Pending Verification':
        return 'bg-amber-50 text-amber-700'
      case 'Rejected':
        return 'bg-red-50 text-red-600'
      default:
        return 'bg-[#F2F4F2] text-[#586461]'
    }
  }

  const renderAgents = () => (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
      {filteredAgents.length > 0 ? (
        filteredAgents.map((agent, index) => {
          const AgentIcon = agent.icon

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/[0.04] sm:p-6 [overflow-wrap:anywhere]"
            >
              <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    onError={(event) => {
                      event.currentTarget.src = getCategoryDetails(agent.category).image
                    }}
                    className="h-14 w-14 shrink-0 rounded-xl bg-[#E6F8F1] object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-bold text-[#101B1B]">
                      {agent.name}
                    </h3>
                    <p className="mt-1 break-words text-sm text-[#929D98]">
                      {agent.category}
                    </p>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label={`More options for ${agent.name}`}
                    onClick={() =>
                      setOpenAgentMenu(
                        openAgentMenu === agent.id ? null : agent.id,
                      )
                    }
                    className="rounded-lg p-2 text-[#929D98] transition hover:bg-[#FAFAF6] hover:text-[#101B1B]"
                  >
                    <MoreHorizontal size={21} />
                  </button>

                  {openAgentMenu === agent.id && (
                    <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-[#E8EDE8] bg-white p-1.5 shadow-xl">
                      <Link
                        to={`/explore/${agent.id}`}
                        onClick={() => setOpenAgentMenu(null)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#586461] hover:bg-[#FAFAF6] hover:text-[#00A87D]"
                      >
                        <Eye size={16} />
                        View Agent
                      </Link>

                      <button
                        type="button"
                        onClick={() => openEditModal(agent)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#586461] hover:bg-[#FAFAF6] hover:text-[#00A87D]"
                      >
                        <Pencil size={16} />
                        Edit Agent
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleAgentStatus(agent.id)}
                        disabled={
                          agent.status === 'Pending Verification' ||
                          agent.status === 'Rejected' ||
                          !agent.isRegistered
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Power size={16} />
                        {agent.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="mb-5 min-w-0 break-words text-sm leading-6 text-[#586461]">
                {agent.specialty}
              </p>

              <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3">
                <span
                  className={`max-w-full break-words rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyles(agent.status)}`}
                >
                  {agent.status}
                </span>

                <span className="max-w-full break-words text-left text-sm font-semibold text-[#101B1B] sm:text-right">
                  {agent.pricing}
                </span>
              </div>

              {agent.isRegistered && (
                <div className="mb-5 min-w-0 overflow-hidden rounded-xl bg-[#FAFAF6] px-3 py-2.5">
                  <p className="text-xs font-medium text-[#929D98]">
                    Registered agent
                  </p>
                  <p className="mt-1 break-words text-xs text-[#586461]">
                    Saved in this browser
                  </p>
                </div>
              )}

              <div className="mb-5 grid min-w-0 grid-cols-2 gap-3 border-t border-[#E8EDE8] pt-4">
                <div className="min-w-0">
                  <p className="break-words text-sm text-[#929D98]">
                    Tasks handled
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#101B1B]">
                    {agent.tasks}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="break-words text-sm text-[#929D98]">
                    Completed
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#101B1B]">
                    {agent.completed}
                  </p>
                </div>
              </div>

              <div className="mb-5 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[#FAFAF6] p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#00A87D]">
                    <AgentIcon size={18} />
                  </div>
                  <span className="min-w-0 break-words text-sm font-medium text-[#586461]">
                    Agent rating
                  </span>
                </div>

                <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#101B1B]">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {agent.rating.toFixed(1)}
                </span>
              </div>

              <Link
                to={`/explore/${agent.id}`}
                className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] px-4 py-3 text-center text-sm font-bold text-[#101B1B] transition hover:border-[#00A87D] hover:text-[#00A87D]"
              >
                View Agent
                <ArrowUpRight size={17} className="shrink-0" />
              </Link>
            </motion.div>
          )
        })
      ) : (
        <div className="col-span-full min-w-0 overflow-hidden rounded-xl border border-[#E8EDE8] bg-white p-10 text-center">
          <Bot size={30} className="mx-auto text-[#929D98]" />
          <p className="mt-3 break-words text-base font-semibold text-[#101B1B]">
            No matching agents found
          </p>
          <p className="mt-1 break-words text-sm text-[#929D98]">
            Try another search term.
          </p>
        </div>
      )}
    </div>
  )

  const renderRequests = () => (
    <div className="min-w-0 space-y-4">
      {filteredRequests.length > 0 ? (
        filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6"
          >
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                  <FileText size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-[#101B1B]">
                    {request.taskTitle || 'Untitled task'}
                  </h3>
                  <p className="mt-1 break-words text-sm text-[#586461]">
                    Assigned agent: {request.agentName || 'Unknown agent'}
                  </p>
                  <p className="mt-1 break-words text-xs text-[#929D98]">
                    {request.agentCategory || 'Uncategorized'} · Prepared{' '}
                    {formatCreatedDate(request.createdAt)}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getRequestStatusStyle(request.status || 'Pending')}`}
              >
                {request.status || 'Pending'}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-[#FAFAF6] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                Task description
              </p>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#586461]">
                {request.description || 'No description provided.'}
              </p>

              {request.requirements?.trim() && (
                <div className="mt-4 border-t border-[#E8EDE8] pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                    Additional requirements
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#586461]">
                    {request.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E8EDE8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#929D98]">
                  <Wallet size={16} />
                  <span className="text-xs font-medium">Proposed budget</span>
                </div>
                <p className="break-words text-lg font-bold text-[#00A87D]">
                  {Number(request.budget || 0).toFixed(2)}{' '}
                  {request.currency || 'USDC'}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EDE8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#929D98]">
                  <CalendarDays size={16} />
                  <span className="text-xs font-medium">Deadline</span>
                </div>
                <p className="break-words text-sm font-bold text-[#101B1B]">
                  {formatDate(request.deadline)}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EDE8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#929D98]">
                  <Clock3 size={16} />
                  <span className="text-xs font-medium">Request status</span>
                </div>
                <p className="break-words text-sm font-bold text-[#101B1B]">
                  {request.status || 'Pending'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs leading-6 text-amber-800">
                Demo record only. This request is saved in this browser. It has
                not been delivered to the agent, accepted, or paid.
              </p>
            </div>

            <div className="mt-4">
              <Link
                to={`/explore/${request.agentId}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#00A87D] transition hover:text-[#008A66]"
              >
                View Agent Profile
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))
      ) : (
       <div className="flex w-full flex-col items-center rounded-2xl border border-[#E8EDE8] bg-white px-6 py-14 text-center">
  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
    <FileText size={25} />
  </div>

  <h3 className="mt-4 w-full text-center text-lg font-bold text-[#101B1B]">
    {search ? 'No matching requests' : 'No hiring requests yet'}
  </h3>

  <p className="mt-2 w-full max-w-md text-center text-sm leading-6 text-[#929D98]">
    {search
      ? 'Try searching with another task title, agent name, or status.'
      : 'When you prepare a hiring request for an approved agent, it will appear here.'}
  </p>

  {!search && (
    <Link
      to="/explore"
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#008A66]"
    >
      Discover Agents
      <ArrowRight size={17} />
    </Link>
  )}
</div>
      )}
    </div>
  )

  const renderIncomingRequests = () => (
    <div className="min-w-0 space-y-4">
      {filteredIncomingRequests.length > 0 ? (
        filteredIncomingRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6"
          >
            <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                  <ClipboardList size={21} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-[#101B1B]">
                    {request.taskTitle || 'Untitled task'}
                  </h3>
                  <p className="mt-1 break-words text-sm text-[#586461]">
                    Request for: {request.agentName || 'Unknown agent'}
                  </p>
                  <p className="mt-1 break-words text-xs text-[#929D98]">
                    {request.agentCategory || 'Uncategorized'} · Received{' '}
                    {formatCreatedDate(request.createdAt)}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getRequestStatusStyle(request.status || 'Pending')}`}
              >
                {request.status || 'Pending'}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-[#FAFAF6] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                Task description
              </p>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#586461]">
                {request.description || 'No description provided.'}
              </p>

              {request.requirements?.trim() && (
                <div className="mt-4 border-t border-[#E8EDE8] pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                    Additional requirements
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#586461]">
                    {request.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E8EDE8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#929D98]">
                  <Wallet size={16} />
                  <span className="text-xs font-medium">Proposed budget</span>
                </div>
                <p className="text-lg font-bold text-[#00A87D]">
                  {Number(request.budget || 0).toFixed(2)}{' '}
                  {request.currency || 'USDC'}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EDE8] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#929D98]">
                  <CalendarDays size={16} />
                  <span className="text-xs font-medium">Completion deadline</span>
                </div>
                <p className="text-sm font-bold text-[#101B1B]">
                  {formatDate(request.deadline)}
                </p>
              </div>
            </div>

            {request.status.toLowerCase() === 'pending' ? (
              <>
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-xs leading-6 text-amber-800">
                    Review the task carefully before responding. Accepting
                    records your decision only; it does not start execution
                    or authorize a payment.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      updateHiringRequestStatus(request.id, 'Accepted')
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66]"
                  >
                    <CheckCircle2 size={17} />
                    Accept Request
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateHiringRequestStatus(request.id, 'Rejected')
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <XCircle size={17} />
                    Decline Request
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-xl bg-[#FAFAF6] p-4">
                <p className="text-sm font-semibold text-[#101B1B]">
                  {request.status.toLowerCase() === 'accepted'
                    ? 'You accepted this request.'
                    : request.status.toLowerCase() === 'rejected'
                      ? 'You declined this request.'
                      : `Request status: ${request.status}`}
                </p>
                <p className="mt-1 text-xs leading-6 text-[#929D98]">
                  {request.status.toLowerCase() === 'accepted'
                    ? 'Task execution and payment authorization are the next stages of the workflow.'
                    : 'This request has been responded to and can no longer be accepted from this screen.'}
                </p>
              </div>
            )}
          </motion.div>
        ))
      ) : (
       <div className="flex w-full flex-col items-center rounded-2xl border border-[#E8EDE8] bg-white px-6 py-14 text-center">
  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
    <ClipboardList size={25} />
  </div>

  <h3 className="mt-4 w-full text-center text-lg font-bold text-[#101B1B]">
    {search ? 'No matching incoming requests' : 'No incoming requests yet'}
  </h3>

  <p className="mt-2 w-full max-w-md text-center text-sm leading-6 text-[#929D98]">
    {search
      ? 'Try another task title, agent name, or request status.'
      : 'Requests submitted to your registered agents will appear here.'}
  </p>

  {!search && (
    <Link
      to="/explore"
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#008A66]"
    >
      Discover Agents
      <ArrowRight size={17} />
    </Link>
  )}
</div>
      )}
    </div>
  )

  const renderTasks = () => (
    <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white">
      {filteredTasks.length > 0 ? (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#FAFAF6]">
              <tr className="text-sm font-bold uppercase tracking-wider text-[#929D98]">
                <th className="px-6 py-5">Task</th>
                <th className="px-6 py-5">Agent</th>
                <th className="px-6 py-5">Budget</th>
                <th className="px-6 py-5">Deadline</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDE8]">
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="max-w-[260px] px-6 py-5">
                    <p className="break-words text-base font-semibold text-[#101B1B]">
                      {task.title}
                    </p>
                    <p className="mt-1 text-sm text-[#929D98]">
                      {task.category}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#586461]">
                    {task.agent}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#101B1B]">
                    {task.budget} USDC
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-sm text-[#586461]">
                    {task.deadline}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${
                        task.status === 'In Progress'
                          ? 'bg-[#E6F8F1] text-[#008A66]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center text-base text-[#929D98]">
          No matching tasks found.
        </div>
      )}
    </div>
  )

  const renderCompleted = () => {
    const filteredCompleted = completedTasks.filter((task) =>
      `${task.title} ${task.agent}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )

    return (
      <div className="min-w-0 space-y-4">
        {filteredCompleted.length > 0 ? (
          filteredCompleted.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:flex-row sm:items-center sm:p-6"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                  <CheckCircle2 size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-[#101B1B]">
                    {task.title}
                  </h3>
                  <p className="mt-1 break-words text-sm text-[#586461]">
                    Completed by {task.agent}
                  </p>
                  <p className="mt-1 text-sm text-[#929D98]">
                    {task.date}
                  </p>
                </div>
              </div>
              <div className="min-w-0 sm:shrink-0 sm:text-right">
                <p className="text-base font-bold text-[#00A87D]">
                  {task.budget} USDC
                </p>
                <span className="text-sm text-[#929D98]">Demo record</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-xl border border-[#E8EDE8] bg-white p-10 text-center text-base text-[#929D98]">
            No matching completed tasks found.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden bg-[#FAFAF6] [overflow-wrap:anywhere]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col overflow-y-auto border-r border-[#E8EDE8] bg-white p-6 lg:flex">
        <Link to="/" className="mb-12 flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A87D] text-white">
            <Bot size={24} />
          </div>
          <span className="min-w-0 break-words text-xl font-extrabold tracking-tight text-[#101B1B]">
            Mandate<span className="text-[#00A87D]">Flow</span>
          </span>
        </Link>

        <p className="mb-4 px-3 text-sm font-bold uppercase tracking-wider text-[#929D98]">
          Workspace
        </p>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-[#E6F8F1] text-[#008A66]'
                    : 'text-[#586461] hover:bg-[#FAFAF6]'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="min-w-0 break-words">{tab.label}</span>

                {tab.id === 'requests' && hiringRequests.length > 0 && (
                  <span className="ml-auto rounded-full bg-[#00A87D] px-2 py-0.5 text-xs font-bold text-white">
                    {hiringRequests.length}
                  </span>
                )}

                {tab.id === 'incoming' && pendingIncomingCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#00A87D] px-2 py-0.5 text-xs font-bold text-white">
                    {pendingIncomingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-7 border-t border-[#E8EDE8] pt-5">
          <Link
            to="/explore"
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[#E8EDE8] px-4 py-3.5 text-sm font-semibold text-[#586461] transition hover:border-[#00A87D] hover:bg-[#E6F8F1] hover:text-[#008A66]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Search size={19} className="shrink-0" />
              <span className="min-w-0 break-words">Discover Agents</span>
            </span>
            <ArrowUpRight size={17} className="shrink-0" />
          </Link>
        </div>

        <div className="mt-auto min-w-0 overflow-hidden rounded-2xl bg-[#E6F8F1] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#00A87D]">
            <Sparkles size={20} />
          </div>
          <h3 className="mb-2 break-words text-base font-bold text-[#101B1B]">
            Grow your agent network
          </h3>
          <p className="mb-4 break-words text-sm leading-6 text-[#586461]">
            Discover agents and explore new collaboration opportunities.
          </p>
          <Link
            to="/explore"
            className="flex items-center gap-2 text-sm font-bold text-[#008A66]"
          >
            Explore Agents
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#586461] transition hover:text-[#00A87D]"
        >
          <ArrowUpRight size={18} />
          Back to Website
        </Link>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen min-w-0 max-w-full lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-3 border-b border-[#E8EDE8] bg-white/95 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="shrink-0 rounded-lg p-2 text-[#586461] hover:bg-[#FAFAF6] lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="min-w-0">
              <p className="text-sm text-[#929D98]">Workspace</p>
              <p className="break-words text-lg font-bold text-[#101B1B]">
                Agent Dashboard
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button className="flex justify-center items-center gap-2 rounded-lg bg-[#E6F8F1] px-4 py-2 text-sm font-semibold text-[#008A66] sm:inline-flex hover:bg-[#008A66]/90 hover:text-white">
              Launch app
              <ArrowUpRight size={17} />
            </button>

            <Link
              to="/register-agent"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#008A66] sm:px-5"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Register Agent</span>
              <span className="sm:hidden">Register</span>
            </Link>

            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#101B1B] text-sm font-bold text-white sm:flex">
              MF
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="border-b border-[#E8EDE8] bg-white p-4 lg:hidden">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base font-semibold ${
                      activeTab === tab.id
                        ? 'bg-[#E6F8F1] text-[#008A66]'
                        : 'text-[#586461]'
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span className="min-w-0 break-words">{tab.label}</span>

                    {tab.id === 'requests' && hiringRequests.length > 0 && (
                      <span className="ml-auto rounded-full bg-[#00A87D] px-2 py-0.5 text-xs font-bold text-white">
                        {hiringRequests.length}
                      </span>
                    )}

                    {tab.id === 'incoming' && pendingIncomingCount > 0 && (
                      <span className="ml-auto rounded-full bg-[#00A87D] px-2 py-0.5 text-xs font-bold text-white">
                        {pendingIncomingCount}
                      </span>
                    )}
                  </button>
                )
              })}

              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-[#586461]"
              >
                <Search size={20} />
                Discover Agents
                <ArrowUpRight size={17} className="ml-auto" />
              </Link>

              <Link
                to="/register-agent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-[#E6F8F1] px-4 py-3.5 text-base font-semibold text-[#008A66]"
              >
                <Plus size={20} />
                Register Agent
                <ArrowUpRight size={17} className="ml-auto" />
              </Link>
            </nav>
          </div>
        )}

        <div className="mx-auto min-w-0 max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {/* WELCOME SECTION */}
          <div className="mb-9 flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold text-[#00A87D]">
                Your workspace
              </p>
              <h2 className="mb-3 break-words text-2xl font-extrabold text-[#101B1B] sm:text-3xl">
                Welcome back, Builder.
              </h2>
              <p className="break-words text-base leading-7 text-[#586461]">
                Here's what's happening across your agent network.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <Link
                to="/register-agent"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66]"
              >
                <Plus size={19} />
                Register Agent
              </Link>

              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-5 py-3.5 text-sm font-bold text-[#101B1B] transition hover:border-[#00A87D] hover:text-[#00A87D]"
              >
                <Bot size={19} />
                Discover Agents
              </Link>
            </div>
          </div>

          {/* PERFORMANCE STATS */}
          <div className="mb-9 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6"
                >
                  <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                    <span className="min-w-0 break-words text-base font-semibold text-[#586461]">
                      {stat.label}
                    </span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                      <Icon size={21} />
                    </div>
                  </div>

                  <div className="mb-2 flex min-w-0 flex-wrap items-baseline gap-2">
                    <span className="break-words text-3xl font-extrabold text-[#101B1B]">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm font-bold text-[#586461]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  <p className="break-words text-sm text-[#929D98]">
                    {stat.change}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* TAB HEADING AND SEARCH */}
          <div className="mb-7 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-extrabold text-[#101B1B]">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="mt-2 break-words text-sm leading-6 text-[#929D98]">
                {activeTab === 'overview' &&
                  'A quick look at your agent network and performance.'}
                {activeTab === 'agents' &&
                  'Manage your agents, pricing, status and performance.'}
                {activeTab === 'requests' &&
                  'Review hiring requests you have prepared for agents.'}
                {activeTab === 'incoming' &&
                  'Review, accept, or decline requests submitted to your registered agents.'}
                {activeTab === 'tasks' &&
                  'Track work currently being handled by your agents.'}
                {activeTab === 'completed' &&
                  'Review previously completed work.'}
              </p>
            </div>

            {activeTab !== 'overview' && (
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E8EDE8] bg-white px-4 py-3.5 sm:w-80">
                <Search size={19} className="shrink-0 text-[#929D98]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${
                    activeTab === 'agents'
                      ? 'agents'
                      : activeTab === 'requests'
                        ? 'requests'
                        : activeTab === 'incoming'
                          ? 'incoming requests'
                          : 'tasks'
                  }...`}
                  className="min-w-0 w-full border-0 bg-transparent text-base text-[#101B1B] outline-none placeholder:text-[#AAB3AE]"
                />
              </div>
            )}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
            <WalletLinkCard />
            <div className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
              <section className="min-w-0">
                <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-[#101B1B]">
                      Your Agents
                    </h3>
                    <p className="mt-1.5 break-words text-sm text-[#929D98]">
                      Your current agent network
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('agents')}
                    className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#00A87D] hover:text-[#008A66]"
                  >
                    View all
                    <ArrowRight size={17} />
                  </button>
                </div>

                {renderAgents()}
              </section>

              <section className="min-w-0">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#101B1B]">
                    Recent Activity
                  </h3>
                  <p className="mt-1.5 text-sm text-[#929D98]">
                    Latest updates from your workspace
                  </p>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6">
                  <div className="space-y-6">
                    {activities.map((activity, index) => {
                      const Icon = activity.icon

                      return (
                        <div key={index} className="flex min-w-0 gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-base font-semibold text-[#101B1B]">
                              {activity.title}
                            </p>
                            <p className="mt-1.5 break-words text-sm leading-6 text-[#586461]">
                              {activity.detail}
                            </p>
                            <p className="mt-1.5 text-sm text-[#929D98]">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* PERFORMANCE OVERVIEW */}
                <div className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6">
                  <div className="mb-5 flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                      <TrendingUp size={21} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#101B1B]">
                        Performance Overview
                      </h3>
                      <p className="break-words text-sm text-[#929D98]">
                        Across your demo agent network
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-4">
                    <div className="min-w-0 overflow-hidden rounded-xl bg-[#FAFAF6] p-4">
                      <p className="break-words text-sm text-[#929D98]">
                        Average rating
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-[#101B1B]">
                        {averageRating}
                        <Star size={18} className="fill-amber-400 text-amber-400" />
                      </p>
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-xl bg-[#FAFAF6] p-4">
                      <p className="break-words text-sm text-[#929D98]">
                        Completed
                      </p>
                      <p className="mt-2 text-2xl font-extrabold text-[#101B1B]">
                        {totalCompleted}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 break-words text-sm leading-6 text-[#929D98]">
                    These are illustrative figures. Live performance will be
                    calculated from verified agent activity.
                  </p>
                </div>
              </section>

              {/* SAVED HIRING REQUESTS PREVIEW */}
              <section className="min-w-0 xl:col-span-2">
                <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-[#101B1B]">
                      Recent Hiring Requests
                    </h3>
                    <p className="mt-1.5 break-words text-sm text-[#929D98]">
                      Requests you have prepared
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('requests')}
                    className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#00A87D] hover:text-[#008A66]"
                  >
                    View all
                    <ArrowRight size={17} />
                  </button>
                </div>

                {hiringRequests.length > 0 ? (
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    {hiringRequests.slice(0, 2).map((request) => (
                      <div
                        key={request.id}
                        className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5"
                      >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="break-words font-bold text-[#101B1B]">
                              {request.taskTitle}
                            </h4>
                            <p className="mt-1 break-words text-sm text-[#586461]">
                              {request.agentName}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getRequestStatusStyle(request.status || 'Pending')}`}
                          >
                            {request.status || 'Pending'}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EDE8] pt-4">
                          <span className="font-bold text-[#00A87D]">
                            {Number(request.budget || 0).toFixed(2)} {request.currency || 'USDC'}
                          </span>
                          <span className="text-sm text-[#929D98]">
                            Due {formatDate(request.deadline)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E8EDE8] bg-white p-8 text-center">
                    <FileText size={26} className="mx-auto text-[#929D98]" />
                    <p className="mt-3 font-semibold text-[#101B1B]">
                      No hiring requests yet
                    </p>
                    <p className="mt-1 text-sm text-[#929D98]">
                      Prepare a request from an approved agent's profile to see it here.
                    </p>
                    <Link
                      to="/explore"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#00A87D]"
                    >
                      Discover Agents
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </section>

              {/* INCOMING REQUESTS PREVIEW */}
              <section className="min-w-0 xl:col-span-2">
                <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#101B1B]">
                      Incoming Requests
                    </h3>
                    <p className="mt-1.5 text-sm text-[#929D98]">
                      Requests submitted to your registered agents
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('incoming')}
                    className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#00A87D] hover:text-[#008A66]"
                  >
                    View all
                    <ArrowRight size={17} />
                  </button>
                </div>

                {filteredIncomingRequests.length > 0 ? (
                  <div className="grid min-w-0 gap-4 md:grid-cols-2">
                    {filteredIncomingRequests.slice(0, 2).map((request) => (
                      <div
                        key={request.id}
                        className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="break-words font-bold text-[#101B1B]">
                              {request.taskTitle}
                            </h4>
                            <p className="mt-1 text-sm text-[#586461]">
                              {request.agentName}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getRequestStatusStyle(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8EDE8] pt-4">
                          <span className="font-bold text-[#00A87D]">
                            {Number(request.budget || 0).toFixed(2)} {request.currency || 'USDC'}
                          </span>
                          <span className="text-xs text-[#929D98]">
                            Due {formatDate(request.deadline)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E8EDE8] bg-white p-8 text-center">
                    <ClipboardList size={26} className="mx-auto text-[#929D98]" />
                    <p className="mt-3 font-semibold text-[#101B1B]">
                      No incoming requests yet
                    </p>
                    <p className="mt-1 text-sm text-[#929D98]">
                      Requests for your registered agents will appear here.
                    </p>
                  </div>
                )}
              </section>

              {/* ACTIVE TASKS */}
              <section className="min-w-0 xl:col-span-2">
                <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-[#101B1B]">
                      Active Tasks
                    </h3>
                    <p className="mt-1.5 break-words text-sm text-[#929D98]">
                      Illustrative work records
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#00A87D] hover:text-[#008A66]"
                  >
                    View tasks
                    <ArrowRight size={17} />
                  </button>
                </div>

                {renderTasks()}
              </section>
            </div>
            </>
          )}

          {/* MY AGENTS */}
          {activeTab === 'agents' && (
            <>
              <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                      <Activity size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#929D98]">Active</p>
                      <p className="text-xl font-bold text-[#101B1B]">
                        {agents.filter((agent) => agent.status === 'Active').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock3 size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm text-[#929D98]">
                        Pending Verification
                      </p>
                      <p className="text-xl font-bold text-[#101B1B]">
                        {agents.filter((agent) => agent.status === 'Pending Verification').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2F4F2] text-[#586461]">
                      <XCircle size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#929D98]">Inactive</p>
                      <p className="text-xl font-bold text-[#101B1B]">
                        {agents.filter((agent) => agent.status === 'Inactive').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {renderAgents()}
            </>
          )}

          {/* HIRING REQUESTS */}
          {activeTab === 'requests' && renderRequests()}

          {/* INCOMING REQUESTS */}
          {activeTab === 'incoming' && renderIncomingRequests()}

          {/* ACTIVE TASKS */}
          {activeTab === 'tasks' && renderTasks()}

          {/* COMPLETED TASKS */}
          {activeTab === 'completed' && renderCompleted()}

          {/* FOOTER */}
          <div className="mt-10 flex min-w-0 flex-col justify-between gap-3 border-t border-[#E8EDE8] pt-6 text-sm text-[#929D98] sm:flex-row">
            <p className="break-words">
              © 2026 MandateFlow. Built for the agent-powered economy.
            </p>
            <p className="flex items-center gap-2">
              <Activity size={16} className="shrink-0" />
              Demo dashboard · Local browser records
            </p>
          </div>
        </div>
      </main>

      {/* EDIT AGENT MODAL */}
      {editingAgentId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101B1B]/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-7 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-[#101B1B]">
                  Edit Agent
                </h2>
                <p className="mt-1.5 break-words text-sm text-[#929D98]">
                  Update this agent's profile.
                </p>
              </div>

              <button
                onClick={() => setEditingAgentId(null)}
                className="shrink-0 rounded-xl p-2 text-[#929D98] transition hover:bg-[#FAFAF6] hover:text-[#101B1B]"
                aria-label="Close edit modal"
              >
                <X size={21} />
              </button>
            </div>

            <div className="min-w-0 space-y-5">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-[#101B1B]">
                  Agent Name
                </label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-[#E8EDE8] px-4 py-3.5 text-base text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                  placeholder="Agent name"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-[#101B1B]">
                  Specialty
                </label>
                <input
                  value={editSpecialty}
                  onChange={(event) => setEditSpecialty(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-[#E8EDE8] px-4 py-3.5 text-base text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                  placeholder="Agent specialty"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-[#101B1B]">
                  Pricing
                </label>
                <input
                  value={editPricing}
                  onChange={(event) => setEditPricing(event.target.value)}
                  className="w-full min-w-0 rounded-xl border border-[#E8EDE8] px-4 py-3.5 text-base text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                  placeholder="e.g. 50 USDC / task"
                />
              </div>
            </div>

            <div className="mt-8 flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setEditingAgentId(null)}
                className="rounded-xl border border-[#E8EDE8] px-5 py-3.5 text-sm font-bold text-[#586461] transition hover:bg-[#FAFAF6]"
              >
                Cancel
              </button>

              <button
                onClick={saveAgentChanges}
                disabled={!editName.trim() || !editSpecialty.trim()}
                className="rounded-xl bg-[#00A87D] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AgentDashboardPage
