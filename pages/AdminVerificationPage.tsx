
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowLeft,
  ArrowUpRight,
  Search,
  ShieldCheck,
  ExternalLink,
  FileText,
  Code2,
  Globe,
  X,
  AlertCircle,
  Users,
} from 'lucide-react'

type Agent = {
  id: string
  name: string
  category: string
  specialty?: string
  description?: string
  framework?: string
  pricingModel?: string
  price?: string
  capabilities?: string[]
  endpoint?: string
  documentation?: string
  status: string
  tasks?: number
  earnings?: number
  rating?: number
  createdAt?: string
  rejectionReason?: string
  verifiedAt?: string
}

const STORAGE_KEY = 'mandateflow_agents'

const getAgents = (): Agent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const AdminVerificationPage = () => {
  const [agents, setAgents] = useState<Agent[]>(getAgents)
  const [activeTab, setActiveTab] = useState('Pending Verification')
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [rejectingAgent, setRejectingAgent] = useState<Agent | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [feedback, setFeedback] = useState('')

  const tabs = [
    'Pending Verification',
    'Active',
    'Rejected',
  ]

  const counts = useMemo(() => ({
    pending: agents.filter(a => a.status === 'Pending Verification').length,
    active: agents.filter(a => a.status === 'Active').length,
    rejected: agents.filter(a => a.status === 'Rejected').length,
  }), [agents])

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesTab = agent.status === activeTab
      const matchesSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.category.toLowerCase().includes(search.toLowerCase()) ||
        (agent.specialty || '').toLowerCase().includes(search.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [agents, activeTab, search])

  const saveAgents = (updatedAgents: Agent[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgents))
    setAgents(updatedAgents)
  }

  const approveAgent = (agent: Agent) => {
    const updatedAgents = agents.map(item =>
      item.id === agent.id
        ? {
            ...item,
            status: 'Active',
            verifiedAt: new Date().toISOString(),
            rejectionReason: '',
          }
        : item
    )

    saveAgents(updatedAgents)
    setSelectedAgent(null)
    setFeedback(`${agent.name} has been approved.`)
  }

  const rejectAgent = () => {
    if (!rejectingAgent || !rejectionReason.trim()) return

    const updatedAgents = agents.map(item =>
      item.id === rejectingAgent.id
        ? {
            ...item,
            status: 'Rejected',
            rejectionReason: rejectionReason.trim(),
            verifiedAt: new Date().toISOString(),
          }
        : item
    )

    saveAgents(updatedAgents)
    setRejectingAgent(null)
    setSelectedAgent(null)
    setRejectionReason('')
    setFeedback(`${rejectingAgent.name} has been rejected.`)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Not provided'

    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const statusStyle = (status: string) => {
    if (status === 'Active') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (status === 'Rejected') {
      return 'bg-red-50 text-red-700'
    }

    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#101B1B]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[260px] shrink-0 border-r border-[#E8EDE8] bg-white lg:flex lg:flex-col">
          <div className="flex h-[82px] items-center gap-3 border-b border-[#E8EDE8] px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A87D] text-white">
              <Bot size={22} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold">MandateFlow</h1>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#929D98]">
                Administration
              </p>
            </div>
          </div>

          <div className="px-5 py-7">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#929D98]">
              Workspace
            </p>

            <nav className="space-y-2">
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#586461] hover:bg-[#F5F8F5]"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                to="/admin/verification"
                className="flex items-center justify-between rounded-xl bg-[#E6F8F1] px-4 py-3 text-sm font-semibold text-[#008A66]"
              >
                <span className="flex items-center gap-3">
                  <ClipboardCheck size={18} />
                  Agent Verification
                </span>

                {counts.pending > 0 && (
                  <span className="rounded-full bg-[#00A87D] px-2 py-0.5 text-[10px] font-bold text-white">
                    {counts.pending}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#586461] hover:bg-[#F5F8F5]"
              >
                <Users size={18} />
                User Dashboard
              </Link>
            </nav>
          </div>

          <div className="mt-auto border-t border-[#E8EDE8] p-5">
            <div className="rounded-2xl bg-[#F5F8F5] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00A87D]" />
                <span className="text-xs font-bold">Verification Center</span>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#929D98]">
                Review submitted agents before granting marketplace access.
              </p>

              <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                Demo environment
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex h-[82px] items-center justify-between border-b border-[#E8EDE8] bg-white px-5 sm:px-8 lg:px-10">
            <div>
              <Link
                to="/admin"
                className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-[#929D98] hover:text-[#00A87D]"
              >
                <ArrowLeft size={13} />
                Back to dashboard
              </Link>

              <h2 className="text-lg font-bold sm:text-xl">
                Agent Verification
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F8F1] text-sm font-bold text-[#008A66]">
              A
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] space-y-7 p-5 sm:p-8 lg:p-10">

            {/* PAGE INTRO */}
            <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E6F8F1] px-3 py-1.5 text-[11px] font-bold text-[#008A66]">
                  <ShieldCheck size={14} />
                  TRUST & SAFETY
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Review agent submissions
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#929D98]">
                  Evaluate registered agents, inspect their submitted
                  information and decide whether they qualify for the
                  MandateFlow marketplace.
                </p>
              </div>
            </section>

            {/* STATS */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Awaiting Review',
                  value: counts.pending,
                  icon: Clock3,
                  color: 'bg-amber-50 text-amber-600',
                },
                {
                  label: 'Approved Agents',
                  value: counts.active,
                  icon: CheckCircle2,
                  color: 'bg-emerald-50 text-emerald-600',
                },
                {
                  label: 'Rejected Agents',
                  value: counts.rejected,
                  icon: XCircle,
                  color: 'bg-red-50 text-red-600',
                },
              ].map((item, index) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-[#E8EDE8] bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="mt-5 text-3xl font-extrabold">
                      {item.value}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#586461]">
                      {item.label}
                    </p>
                  </motion.div>
                )
              })}
            </section>

            {/* FEEDBACK */}
            {feedback && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#BCEBD9] bg-[#E6F8F1] px-4 py-3 text-sm text-[#008A66]">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  {feedback}
                </span>

                <button
                  onClick={() => setFeedback('')}
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* LIST CONTAINER */}
            <section className="overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white">

              {/* TABS AND SEARCH */}
              <div className="space-y-5 border-b border-[#E8EDE8] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Agent submissions</h3>
                    <p className="mt-1 text-xs text-[#929D98]">
                      Review and manage submitted agent profiles.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#F5F8F5] px-3 py-1.5 text-xs font-semibold text-[#586461]">
                    {filteredAgents.length} results
                  </span>
                </div>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => {
                      const count =
                        tab === 'Pending Verification'
                          ? counts.pending
                          : tab === 'Active'
                            ? counts.active
                            : counts.rejected

                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                            activeTab === tab
                              ? 'bg-[#101B1B] text-white'
                              : 'bg-[#F5F8F5] text-[#586461] hover:bg-[#E6F8F1]'
                          }`}
                        >
                          {tab === 'Pending Verification'
                            ? 'Pending'
                            : tab}

                          <span className="ml-2 opacity-70">
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="relative w-full md:max-w-[280px]">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929D98]"
                    />

                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search agents..."
                      className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#A8B1AC] focus:border-[#00A87D]"
                    />
                  </div>
                </div>
              </div>

              {/* AGENT LIST */}
              {filteredAgents.length > 0 ? (
                <div className="divide-y divide-[#E8EDE8]">
                  {filteredAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex min-w-0 flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:px-6"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#008A66]">
                          <Bot size={23} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="break-words text-sm font-bold">
                              {agent.name}
                            </h4>

                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(agent.status)}`}>
                              {agent.status}
                            </span>
                          </div>

                          <p className="mt-1 break-words text-xs text-[#586461]">
                            {agent.category}
                            {agent.specialty ? ` · ${agent.specialty}` : ''}
                          </p>

                          <p className="mt-2 text-[11px] text-[#929D98]">
                            Submitted {formatDate(agent.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedAgent(agent)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E8EDE8] px-4 py-2.5 text-xs font-bold text-[#586461] transition hover:border-[#00A87D] hover:text-[#008A66]"
                        >
                          View Details
                          <ArrowUpRight size={14} />
                        </button>

                        {agent.status === 'Pending Verification' && (
                          <>
                            <button
                              onClick={() => approveAgent(agent)}
                              className="rounded-xl bg-[#00A87D] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#008A66]"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => setRejectingAgent(agent)}
                              className="rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-5 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F8F5] text-[#929D98]">
                    {activeTab === 'Pending Verification'
                      ? <ClipboardCheck size={28} />
                      : activeTab === 'Active'
                        ? <CheckCircle2 size={28} />
                        : <XCircle size={28} />}
                  </div>

                  <h3 className="mt-5 text-base font-bold">
                    {search
                      ? 'No matching agents found'
                      : activeTab === 'Pending Verification'
                        ? 'No pending submissions'
                        : `No ${activeTab.toLowerCase()} agents`}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#929D98]">
                    {search
                      ? 'Try another search term.'
                      : 'Agent submissions matching this category will appear here.'}
                  </p>
                </div>
              )}
            </section>

            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs leading-5 text-amber-800">
                This verification page currently uses browser localStorage.
                It demonstrates the review workflow but does not provide
                secure admin authorization or permanent server-side records.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* AGENT DETAILS MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101B1B]/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8EDE8] bg-white p-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold text-[#00A87D]">
                  AGENT SUBMISSION
                </p>
                <h3 className="mt-1 text-lg font-bold">
                  Agent Details
                </h3>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="rounded-xl p-2 text-[#929D98] hover:bg-[#F5F8F5]"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#008A66]">
                  <Bot size={28} />
                </div>

                <div className="min-w-0">
                  <h4 className="break-words text-xl font-extrabold">
                    {selectedAgent.name}
                  </h4>

                  <p className="mt-1 text-sm text-[#586461]">
                    {selectedAgent.category}
                    {selectedAgent.specialty
                      ? ` · ${selectedAgent.specialty}`
                      : ''}
                  </p>

                  <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyle(selectedAgent.status)}`}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#929D98]">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#586461]">
                  {selectedAgent.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F7F9F7] p-4">
                  <div className="flex items-center gap-2 text-[#929D98]">
                    <Code2 size={16} />
                    <span className="text-xs font-semibold">Framework</span>
                  </div>
                  <p className="mt-2 break-words text-sm font-bold">
                    {selectedAgent.framework || 'Not specified'}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F7F9F7] p-4">
                  <div className="flex items-center gap-2 text-[#929D98]">
                    <FileText size={16} />
                    <span className="text-xs font-semibold">Pricing</span>
                  </div>
                  <p className="mt-2 break-words text-sm font-bold">
                    {selectedAgent.pricingModel || 'Not specified'}
                    {selectedAgent.price ? ` · ${selectedAgent.price}` : ''}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#929D98]">
                  Capabilities
                </p>

                {selectedAgent.capabilities?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map(capability => (
                      <span
                        key={capability}
                        className="rounded-lg bg-[#E6F8F1] px-3 py-2 text-xs font-semibold text-[#008A66]"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#929D98]">
                    No capabilities submitted.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#929D98]">
                  Technical Information
                </p>

                <div className="rounded-xl border border-[#E8EDE8] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Globe size={15} className="text-[#00A87D]" />
                    Agent Endpoint
                  </div>

                  {selectedAgent.endpoint ? (
                    <a
                      href={selectedAgent.endpoint}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-start gap-2 break-all text-sm text-[#008A66] hover:underline"
                    >
                      {selectedAgent.endpoint}
                      <ExternalLink size={14} className="mt-0.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-[#929D98]">
                      No endpoint provided.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-[#E8EDE8] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <FileText size={15} className="text-[#00A87D]" />
                    Documentation
                  </div>

                  {selectedAgent.documentation ? (
                    <a
                      href={selectedAgent.documentation}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-start gap-2 break-all text-sm text-[#008A66] hover:underline"
                    >
                      {selectedAgent.documentation}
                      <ExternalLink size={14} className="mt-0.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-[#929D98]">
                      No documentation provided.
                    </p>
                  )}
                </div>
              </div>

              {selectedAgent.rejectionReason && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-bold text-red-700">
                    Rejection reason
                  </p>
                  <p className="mt-2 break-words text-sm text-red-600">
                    {selectedAgent.rejectionReason}
                  </p>
                </div>
              )}

              {selectedAgent.status === 'Pending Verification' && (
                <div className="flex flex-col gap-3 border-t border-[#E8EDE8] pt-5 sm:flex-row">
                  <button
                    onClick={() => approveAgent(selectedAgent)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66]"
                  >
                    <CheckCircle2 size={17} />
                    Approve Agent
                  </button>

                  <button
                    onClick={() => setRejectingAgent(selectedAgent)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <XCircle size={17} />
                    Reject Agent
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingAgent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101B1B]/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={22} />
              </div>

              <button
                onClick={() => {
                  setRejectingAgent(null)
                  setRejectionReason('')
                }}
                className="rounded-lg p-2 text-[#929D98] hover:bg-[#F5F8F5]"
                aria-label="Close rejection dialog"
              >
                <X size={19} />
              </button>
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Reject agent submission?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#929D98]">
              You are rejecting{' '}
              <span className="font-bold text-[#101B1B]">
                {rejectingAgent.name}
              </span>
              . Provide a reason so the agent knows what needs to be fixed.
            </p>

            <label className="mb-2 mt-6 block text-xs font-bold text-[#586461]">
              Rejection reason
            </label>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Explain why this agent did not pass verification..."
              className="w-full resize-none rounded-xl border border-[#E8EDE8] p-4 text-sm outline-none transition placeholder:text-[#A8B1AC] focus:border-red-300"
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setRejectingAgent(null)
                  setRejectionReason('')
                }}
                className="flex-1 rounded-xl border border-[#E8EDE8] px-4 py-3 text-sm font-bold text-[#586461] hover:bg-[#F5F8F5]"
              >
                Cancel
              </button>

              <button
                onClick={rejectAgent}
                disabled={!rejectionReason.trim()}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Rejection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminVerificationPage
