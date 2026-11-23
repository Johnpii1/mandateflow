
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Users,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Menu,
} from 'lucide-react'

type Agent = {
  id: string
  name: string
  category: string
  specialty?: string
  status: string
  framework?: string
  createdAt?: string
}

const getAgents = (): Agent[] => {
  try {
    const stored = localStorage.getItem('mandateflow_agents')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const AdminDashboardPage = () => {
  const agents = useMemo(() => getAgents(), [])

  const pendingAgents = agents.filter(
    (agent) => agent.status === 'Pending Verification'
  )

  const approvedAgents = agents.filter(
    (agent) => agent.status === 'Active'
  )

  const rejectedAgents = agents.filter(
    (agent) => agent.status === 'Rejected'
  )

  const stats = [
    {
      label: 'Total Registered',
      value: agents.length,
      description: 'All submitted agents',
      icon: Bot,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending Reviews',
      value: pendingAgents.length,
      description: 'Awaiting verification',
      icon: Clock3,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Approved Agents',
      value: approvedAgents.length,
      description: 'Successfully verified',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Rejected Agents',
      value: rejectedAgents.length,
      description: 'Not approved',
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
    },
  ]

  const recentAgents = [...agents]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5)

  const formatDate = (date?: string) => {
    if (!date) return 'Date unavailable'

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700'
      case 'Rejected':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-amber-50 text-amber-700'
    }
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
              <h1 className="text-lg font-extrabold tracking-tight">
                MandateFlow
              </h1>
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
                className="flex items-center gap-3 rounded-xl bg-[#E6F8F1] px-4 py-3 text-sm font-semibold text-[#008A66]"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                to="/admin/verification"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#586461] transition hover:bg-[#F5F8F5] hover:text-[#00A87D]"
              >
                <span className="flex items-center gap-3">
                  <ClipboardCheck size={18} />
                  Agent Verification
                </span>

                {pendingAgents.length > 0 && (
                  <span className="rounded-full bg-[#00A87D] px-2 py-0.5 text-[10px] font-bold text-white">
                    {pendingAgents.length}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#586461] transition hover:bg-[#F5F8F5] hover:text-[#00A87D]"
              >
                <Users size={18} />
                User Dashboard
              </Link>
            </nav>

            <p className="mb-4 mt-10 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#929D98]">
              System
            </p>

            <nav className="space-y-2">
              <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#586461] transition hover:bg-[#F5F8F5]">
                <Activity size={18} />
                Activity Overview
              </div>

              <div className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#586461] transition hover:bg-[#F5F8F5]">
                <Settings size={18} />
                Settings
              </div>
            </nav>
          </div>

          <div className="mt-auto border-t border-[#E8EDE8] p-5">
            <div className="rounded-2xl bg-[#F5F8F5] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00A87D]" />
                <span className="text-xs font-bold">Admin Workspace</span>
              </div>

              <p className="text-xs leading-5 text-[#929D98]">
                Manage agent registrations and verification activity.
              </p>

              <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                Demo environment
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">

          {/* TOPBAR */}
          <header className="flex h-[82px] items-center justify-between border-b border-[#E8EDE8] bg-white px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 text-[#586461] hover:bg-[#F5F8F5] lg:hidden">
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-[#929D98]">
                  Administration / Overview
                </p>
                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  Admin Dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button
                className="relative rounded-xl border border-[#E8EDE8] p-2.5 text-[#586461] hover:bg-[#F5F8F5]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {pendingAgents.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#00A87D]" />
                )}
              </button>

              <div className="flex items-center gap-3 border-l border-[#E8EDE8] pl-3 sm:pl-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F8F1] text-sm font-bold text-[#008A66]">
                  A
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-bold">Administrator</p>
                  <p className="text-[11px] text-[#929D98]">
                    Platform Manager
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-8 p-5 sm:p-8 lg:p-10">

            {/* WELCOME */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between gap-5 rounded-[24px] bg-[#101B1B] p-6 text-white sm:flex-row sm:items-center sm:p-9"
            >
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#9BEBD3]">
                  <span className="h-2 w-2 rounded-full bg-[#00D6A0]" />
                  Admin Control Center
                </div>

                <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                  Welcome to your
                  <span className="text-[#00D6A0]"> command center.</span>
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  Monitor agent registrations, review verification requests
                  and manage the MandateFlow agent ecosystem.
                </p>
              </div>

              <Link
                to="/admin/verification"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66]"
              >
                Review Pending Agents
                <ArrowUpRight size={17} />
              </Link>
            </motion.section>

            {/* STATISTICS */}
            <section>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Platform Overview</h3>
                  <p className="mt-1 text-sm text-[#929D98]">
                    Registration and verification statistics
                  </p>
                </div>

                <span className="hidden rounded-full border border-[#E8EDE8] bg-white px-3 py-1.5 text-xs font-medium text-[#586461] sm:inline-flex">
                  Live local data
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon

                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="min-w-0 rounded-2xl border border-[#E8EDE8] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                          <Icon size={21} />
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="text-[#C3CCC6]"
                        />
                      </div>

                      <p className="mt-5 text-3xl font-extrabold tracking-tight">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {stat.label}
                      </p>

                      <p className="mt-1 text-xs text-[#929D98]">
                        {stat.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            {/* MAIN GRID */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">

              {/* RECENT REGISTRATIONS */}
              <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EDE8] p-5 sm:p-6">
                  <div>
                    <h3 className="font-bold">Recent Registrations</h3>
                    <p className="mt-1 text-xs text-[#929D98]">
                      Latest agent submissions
                    </p>
                  </div>

                  <Link
                    to="/admin/verification"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00A87D] hover:text-[#008A66]"
                  >
                    View all
                    <ChevronRight size={15} />
                  </Link>
                </div>

                {recentAgents.length > 0 ? (
                  <div className="divide-y divide-[#E8EDE8]">
                    {recentAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex min-w-0 flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#008A66]">
                            <Bot size={21} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-sm font-bold">
                              {agent.name}
                            </p>
                            <p className="mt-1 break-words text-xs text-[#929D98]">
                              {agent.category} · {formatDate(agent.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${statusStyle(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F8F5] text-[#929D98]">
                      <Bot size={25} />
                    </div>

                    <h4 className="mt-4 text-sm font-bold">
                      No registered agents yet
                    </h4>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-[#929D98]">
                      New agent registrations will appear here when users
                      submit their profiles.
                    </p>
                  </div>
                )}
              </div>

              {/* VERIFICATION QUEUE */}
              <div className="min-w-0 rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Verification Queue</h3>
                    <p className="mt-1 text-xs text-[#929D98]">
                      Agents requiring attention
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ClipboardCheck size={20} />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-[#FFF9EC] p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#9B7A3B]">
                        Awaiting review
                      </p>

                      <p className="mt-2 text-4xl font-extrabold text-[#76551C]">
                        {pendingAgents.length}
                      </p>
                    </div>

                    <Clock3 size={27} className="text-[#C99B45]" />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#9B7A3B]">
                    {pendingAgents.length === 0
                      ? 'There are currently no pending verification requests.'
                      : `${pendingAgents.length} agent${pendingAgents.length === 1 ? '' : 's'} waiting for admin review.`}
                  </p>
                </div>

                <Link
                  to="/admin/verification"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#008A66]"
                >
                  Open Verification Queue
                  <ArrowUpRight size={17} />
                </Link>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#586461]">Approved</span>
                    <span className="font-bold">{approvedAgents.length}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF2EE]">
                    <div
                      className="h-full rounded-full bg-[#00A87D]"
                      style={{
                        width: `${agents.length ? (approvedAgents.length / agents.length) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#586461]">Rejected</span>
                    <span className="font-bold">{rejectedAgents.length}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF2EE]">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{
                        width: `${agents.length ? (rejectedAgents.length / agents.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* BOTTOM INFO */}
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#E8EDE8] bg-white p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#008A66]">
                  <ShieldCheck size={21} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold">
                    Agent Verification
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-[#929D98]">
                    Review agent capabilities, submitted endpoints and
                    documentation before approving marketplace access.
                  </p>

                  <Link
                    to="/admin/verification"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#00A87D]"
                  >
                    Start reviewing
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#E8EDE8] bg-white p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Activity size={21} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold">
                    Platform Monitoring
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-[#929D98]">
                    Monitor registration activity and verification progress
                    from one central workspace.
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#929D98]">
                    <Search size={14} />
                    Overview only
                  </span>
                </div>
              </div>
            </section>

            <footer className="flex flex-col justify-between gap-2 border-t border-[#E8EDE8] pt-6 text-xs text-[#929D98] sm:flex-row">
              <p>© 2026 MandateFlow. Admin Workspace.</p>
              <p>Frontend demonstration · Local storage data</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardPage
