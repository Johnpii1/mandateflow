
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Palette,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Bot,
  AlertCircle,
} from 'lucide-react'

import SecurityAgent from '../../assets/images/security-agent.png'
import DeveloperAgent from '../../assets/images/developer-agent-2.png'
import ResearchAgent from '../../assets/images/research-agent-1.png'
import DesignAgent from '../../assets/images/design-agent-3.png'

const AGENTS_STORAGE_KEY = 'mandateflow_agents'
const REQUESTS_STORAGE_KEY = 'mandateflow_hiring_requests'

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
  image?: string
  avatar?: string
  status?: string
}

type Agent = {
  id: string
  name: string
  category: string
  specialty: string
  description: string
  image: string
  icon: typeof Bot
  status: string
  pricing: string
  isRegistered: boolean
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
  status: 'Pending'
  createdAt: string
}

const demoAgents: Agent[] = [
  {
    id: 'security-agent',
    name: 'Security Agent',
    category: 'Security',
    specialty: 'Smart Contract Auditing',
    description:
      'Reviews smart contracts, identifies vulnerabilities, and provides actionable security recommendations.',
    image: SecurityAgent,
    icon: ShieldCheck,
    status: 'Demo',
    pricing: '120 USDC / task',
    isRegistered: false,
  },
  {
    id: 'developer-agent',
    name: 'Developer Agent',
    category: 'Development',
    specialty: 'Web3 Development',
    description:
      'Builds, reviews, and improves applications, smart contracts, and blockchain integrations.',
    image: DeveloperAgent,
    icon: Code2,
    status: 'Demo',
    pricing: '85 USDC / task',
    isRegistered: false,
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    category: 'Research',
    specialty: 'Blockchain Research',
    description:
      'Researches protocols, analyzes market information, and delivers structured reports.',
    image: ResearchAgent,
    icon: Sparkles,
    status: 'Demo',
    pricing: '45 USDC / task',
    isRegistered: false,
  },
  {
    id: 'design-agent',
    name: 'Design Agent',
    category: 'Design',
    specialty: 'Product and UI Design',
    description:
      'Creates user-friendly interfaces, product concepts, and polished design experiences.',
    image: DesignAgent,
    icon: Palette,
    status: 'Demo',
    pricing: '95 USDC / task',
    isRegistered: false,
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
    const stored = localStorage.getItem(AGENTS_STORAGE_KEY)

    if (!stored) return []

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Unable to load registered agents:', error)
    return []
  }
}

const getAgentPricing = (agent: SavedAgent) => {
  if (agent.pricing) return agent.pricing

  if (agent.pricingModel === 'Free' || !agent.price) {
    return 'Pricing not specified'
  }

  const model = (agent.pricingModel || 'Per task')
    .toLowerCase()
    .replace('per ', '')

  return `${agent.price} / ${model}`
}

const mapRegisteredAgent = (saved: SavedAgent): Agent => {
  const categoryDetails = getCategoryDetails(saved.category)

  return {
    id: saved.id,
    name: saved.name || 'Unnamed Agent',
    category: saved.category || 'Other',
    specialty: saved.specialty || saved.category || 'AI Agent',
    description:
      saved.description ||
      'This agent is registered on MandateFlow.',
    image: saved.image || saved.avatar || categoryDetails.image,
    icon: categoryDetails.icon,
    status: saved.status || 'Pending Verification',
    pricing: getAgentPricing(saved),
    isRegistered: true,
  }
}

const getLocalDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const saveHiringRequest = (request: HiringRequest) => {
  try {
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY)
    const existing: HiringRequest[] = stored
      ? JSON.parse(stored)
      : []

    if (!Array.isArray(existing)) {
      throw new Error('Invalid hiring request storage')
    }

    localStorage.setItem(
      REQUESTS_STORAGE_KEY,
      JSON.stringify([request, ...existing]),
    )

    return true
  } catch (error) {
    console.error('Unable to save hiring request:', error)
    return false
  }
}

const HireAgentPage = () => {
  const { id: agentId } = useParams()
  const navigate = useNavigate()

  const agent = useMemo(() => {
    if (!agentId) return undefined

    const registeredAgents = getSavedAgents().map(mapRegisteredAgent)
    const allAgents = [...registeredAgents, ...demoAgents]

    return allAgents.find((item) => item.id === agentId)
  }, [agentId])

  const [taskTitle, setTaskTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [requirements, setRequirements] = useState('')
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const today = getLocalDate()

  const canHire = Boolean(
    agent?.isRegistered && agent.status === 'Active',
  )

  if (!agent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-5">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
            <X size={28} />
          </div>

          <h1 className="mb-3 text-3xl font-bold text-[#101B1B]">
            Agent not found
          </h1>

          <p className="mb-7 text-[#586461]">
            The agent you are trying to hire could not be found.
          </p>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00A87D] px-6 py-3 font-semibold text-white transition hover:bg-[#008A66]"
          >
            Explore Agents
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    )
  }

  const Icon = agent.icon

  const validateTask = () => {
    if (!canHire) {
      setError('Only approved and active registered agents can receive hiring requests.')
      return false
    }

    if (!taskTitle.trim()) {
      setError('Please enter a task title.')
      return false
    }

    if (!description.trim()) {
      setError('Please describe the task you need completed.')
      return false
    }

    if (
      !budget ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) <= 0
    ) {
      setError('Enter a valid budget greater than zero.')
      return false
    }

    if (!deadline) {
      setError('Please select a deadline.')
      return false
    }

    if (deadline < today) {
      setError('Your deadline cannot be in the past.')
      return false
    }

    setError('')
    return true
  }

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateTask()) return

    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = () => {
    if (!validateTask()) {
      setStep(1)
      return
    }

    const request: HiringRequest = {
      id: `request-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      agentCategory: agent.category,
      taskTitle: taskTitle.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      budget: Number(budget),
      currency: 'USDC',
      deadline,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }

    const saved = saveHiringRequest(request)

    if (!saved) {
      setError('Unable to save your request. Please try again.')
      return
    }

    setError('')
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!canHire && !submitted) {
    const isDemo = !agent.isRegistered

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-[2rem] border border-[#E8EDE8] bg-white p-8 text-center shadow-sm sm:p-10"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-[#101B1B]">
            {isDemo ? 'Demo agent' : 'Agent not available'}
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#586461]">
            {isDemo
              ? 'This is a sample agent profile for demonstration. Hiring requests are available for approved registered agents.'
              : `This agent is currently ${agent.status.toLowerCase()}. Only agents approved by the MandateFlow admin can receive hiring requests.`}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/explore/${agent.id}`}
              className="flex flex-1 items-center justify-center rounded-xl border border-[#E8EDE8] px-5 py-3 text-sm font-semibold text-[#586461] transition hover:bg-[#FAFAF6]"
            >
              View Agent
            </Link>

            <Link
              to="/explore"
              className="flex flex-1 items-center justify-center rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#008A66]"
            >
              Explore Agents
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl rounded-[2rem] border border-[#E8EDE8] bg-white p-8 text-center shadow-xl shadow-black/[0.04] sm:p-12"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F8F1] text-[#00A87D]">
            <CheckCircle2 size={42} />
          </div>

          <span className="mb-3 inline-block rounded-full bg-[#E6F8F1] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#008A66]">
            Request saved
          </span>

          <h1 className="mb-4 text-3xl font-bold text-[#101B1B] sm:text-4xl">
            Your hiring request is prepared.
          </h1>

          <p className="mb-8 leading-7 text-[#586461]">
            Your request for {agent.name} has been saved locally. It is ready
            for the next stage of the hiring workflow.
          </p>

          <div className="mb-8 rounded-2xl bg-[#FAFAF6] p-5 text-left">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm text-[#929D98]">Task</span>
              <span className="max-w-[65%] truncate text-right font-semibold text-[#101B1B]">
                {taskTitle}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm text-[#929D98]">Agent</span>
              <span className="text-right font-semibold text-[#101B1B]">
                {agent.name}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-[#929D98]">Budget</span>
              <span className="font-semibold text-[#00A87D]">
                {Number(budget).toFixed(2)} USDC
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-[#929D98]">Deadline</span>
              <span className="font-semibold text-[#101B1B]">
                {deadline}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#929D98]">Request status</span>
              <span className="font-semibold text-amber-700">
                Pending
              </span>
            </div>
          </div>

          <p className="mb-7 text-xs leading-5 text-[#929D98]">
            Demo mode: the request is stored in this browser only. It has not
            been sent to the agent, and no payment has been made or authorized.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/explore"
              className="flex flex-1 items-center justify-center rounded-xl border border-[#E8EDE8] px-5 py-3 font-semibold text-[#101B1B] transition hover:bg-[#FAFAF6]"
            >
              Explore Agents
            </Link>

            <Link
              to="/dashboard"
              className="flex flex-1 items-center justify-center rounded-xl bg-[#00A87D] px-5 py-3 font-semibold text-white transition hover:bg-[#008A66]"
            >
              My Dashboard
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF6] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(`/explore/${agent.id}`)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#586461] transition hover:text-[#00A87D]"
        >
          <ArrowLeft size={18} />
          Back to agent
        </button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="mb-8">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E6F8F1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#008A66]">
                <Sparkles size={14} />
                Hire an Agent
              </span>

              <h1 className="mb-3 text-3xl font-bold leading-tight text-[#101B1B] sm:text-4xl">
                Give your next task
                <span className="block text-[#00A87D]">
                  to an AI agent.
                </span>
              </h1>

              <p className="max-w-2xl leading-7 text-[#586461]">
                Describe what you need, set your budget, and define when the
                work should be completed.
              </p>
            </div>

            {/* PROGRESS */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step === 1
                      ? 'bg-[#00A87D] text-white'
                      : 'bg-[#E6F8F1] text-[#008A66]'
                  }`}
                >
                  {step === 1 ? '1' : <Check size={17} />}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#101B1B]">
                    Task details
                  </p>
                  <p className="hidden text-xs text-[#929D98] sm:block">
                    Describe your request
                  </p>
                </div>
              </div>

              <div className="h-px flex-1 bg-[#DDE6DF]" />

              <div className="flex flex-1 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step === 2
                      ? 'bg-[#00A87D] text-white'
                      : 'bg-[#E8EDE8] text-[#929D98]'
                  }`}
                >
                  2
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#101B1B]">
                    Review request
                  </p>
                  <p className="hidden text-xs text-[#929D98] sm:block">
                    Confirm your details
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-[#E8EDE8] bg-white p-6 shadow-sm sm:p-8"
            >
              {step === 1 ? (
                <form onSubmit={handleContinue}>
                  <div className="mb-7">
                    <h2 className="mb-2 text-xl font-bold text-[#101B1B]">
                      Describe your task
                    </h2>
                    <p className="text-sm text-[#929D98]">
                      Give the agent enough information to understand what
                      needs to be done.
                    </p>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="taskTitle"
                      className="mb-2 block text-sm font-semibold text-[#101B1B]"
                    >
                      Task title
                    </label>

                    <input
                      id="taskTitle"
                      type="text"
                      value={taskTitle}
                      onChange={(event) => setTaskTitle(event.target.value)}
                      placeholder="e.g. Audit my smart contract"
                      maxLength={100}
                      className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold text-[#101B1B]"
                    >
                      Task description
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Explain what you need the agent to accomplish..."
                      rows={6}
                      maxLength={3000}
                      className="w-full resize-y rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm leading-6 text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />

                    <p className="mt-2 text-right text-xs text-[#929D98]">
                      {description.length}/3000
                    </p>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="requirements"
                      className="mb-2 block text-sm font-semibold text-[#101B1B]"
                    >
                      Additional requirements
                      <span className="ml-2 font-normal text-[#929D98]">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="requirements"
                      value={requirements}
                      onChange={(event) => setRequirements(event.target.value)}
                      placeholder="Add preferred tools, formats, references, or other requirements..."
                      rows={3}
                      maxLength={1500}
                      className="w-full resize-y rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm leading-6 text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />
                  </div>

                  <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="budget"
                        className="mb-2 block text-sm font-semibold text-[#101B1B]"
                      >
                        Your budget
                      </label>

                      <div className="flex items-center rounded-xl border border-[#E8EDE8] px-4 transition focus-within:border-[#00A87D]">
                        <Wallet size={18} className="text-[#929D98]" />

                        <input
                          id="budget"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={budget}
                          onChange={(event) => setBudget(event.target.value)}
                          placeholder="50.00"
                          className="w-full border-0 bg-transparent px-3 py-3 text-sm text-[#101B1B] outline-none"
                        />

                        <span className="text-sm font-semibold text-[#586461]">
                          USDC
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="deadline"
                        className="mb-2 block text-sm font-semibold text-[#101B1B]"
                      >
                        Completion deadline
                      </label>

                      <div className="flex items-center rounded-xl border border-[#E8EDE8] px-4 transition focus-within:border-[#00A87D]">
                        <Clock3 size={18} className="shrink-0 text-[#929D98]" />

                        <input
                          id="deadline"
                          type="date"
                          min={today}
                          value={deadline}
                          onChange={(event) => setDeadline(event.target.value)}
                          className="w-full min-w-0 border-0 bg-transparent px-3 py-3 text-sm text-[#101B1B] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-6 py-4 font-semibold text-white transition hover:bg-[#008A66]"
                  >
                    Review Request
                    <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <div>
                  <div className="mb-7">
                    <h2 className="mb-2 text-xl font-bold text-[#101B1B]">
                      Review your hiring request
                    </h2>
                    <p className="text-sm text-[#929D98]">
                      Make sure everything is correct before saving.
                    </p>
                  </div>

                  <div className="mb-6 rounded-2xl border border-[#E8EDE8] p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                      Task details
                    </p>

                    <h3 className="mb-3 text-lg font-bold text-[#101B1B]">
                      {taskTitle}
                    </h3>

                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#586461]">
                      {description}
                    </p>

                    {requirements.trim() && (
                      <div className="mt-5 border-t border-[#E8EDE8] pt-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                          Additional requirements
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#586461]">
                          {requirements}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#FAFAF6] p-5">
                      <p className="mb-2 text-xs font-semibold text-[#929D98]">
                        Proposed budget
                      </p>
                      <p className="text-2xl font-bold text-[#00A87D]">
                        {Number(budget).toFixed(2)}
                        <span className="ml-2 text-sm font-semibold">USDC</span>
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#FAFAF6] p-5">
                      <p className="mb-2 text-xs font-semibold text-[#929D98]">
                        Deadline
                      </p>
                      <p className="text-lg font-bold text-[#101B1B]">
                        {deadline}
                      </p>
                    </div>
                  </div>

                  <div className="mb-7 rounded-2xl border border-[#BCEBD9] bg-[#E6F8F1] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-[#008A66]"
                      />
                      <div>
                        <p className="mb-1 text-sm font-bold text-[#101B1B]">
                          Payment authorization comes later
                        </p>
                        <p className="text-xs leading-6 text-[#586461]">
                          Your budget is a proposed amount. No funds will be
                          transferred until a payment flow is implemented and
                          the required user authorization is obtained.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setError('')
                        setStep(1)
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] px-5 py-4 font-semibold text-[#101B1B] transition hover:bg-[#FAFAF6]"
                    >
                      <ArrowLeft size={18} />
                      Edit Details
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-4 font-semibold text-white transition hover:bg-[#008A66]"
                    >
                      Save Hiring Request
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* SELECTED AGENT SIDEBAR */}
          <aside>
            <div className="sticky top-8 rounded-[2rem] border border-[#E8EDE8] bg-white p-6 shadow-sm">
              <p className="mb-5 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                Selected agent
              </p>

              <div className="mb-5 overflow-hidden rounded-2xl bg-[#E6F8F1]">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="h-52 w-full object-contain p-4"
                />
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                  <Icon size={19} />
                </div>

                <span className="rounded-full bg-[#E6F8F1] px-3 py-1 text-xs font-semibold text-[#008A66]">
                  Verified Active
                </span>
              </div>

              <h2 className="mb-1 break-words text-xl font-bold text-[#101B1B]">
                {agent.name}
              </h2>

              <p className="mb-4 text-sm font-medium text-[#00A87D]">
                {agent.specialty}
              </p>

              <p className="mb-6 text-sm leading-7 text-[#586461]">
                {agent.description}
              </p>

              <div className="border-t border-[#E8EDE8] pt-5">
                <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#929D98]">Category</span>
                  <span className="text-right font-semibold text-[#101B1B]">
                    {agent.category}
                  </span>
                </div>

                <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#929D98]">Agent status</span>
                  <span className="font-semibold text-[#008A66]">
                    {agent.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#929D98]">Listed pricing</span>
                  <span className="text-right font-semibold text-[#101B1B]">
                    {agent.pricing}
                  </span>
                </div>
              </div>

              <Link
                to={`/explore/${agent.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] px-4 py-3 text-sm font-semibold text-[#586461] transition hover:border-[#00A87D] hover:text-[#00A87D]"
              >
                View Agent Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default HireAgentPage
