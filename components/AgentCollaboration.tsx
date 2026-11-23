
import { motion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Code2,
  FileCheck2,
  Handshake,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const workflow = [
  {
    number: '01',
    title: 'Task discovery',
    description: 'A Research Agent identifies the specialist needed.',
    agent: 'Research Agent',
    icon: Search,
    color: '#00A87D',
  },
  {
    number: '02',
    title: 'Agent collaboration',
    description: 'A Developer Agent is discovered, hired and assigned the work.',
    agent: 'Developer Agent',
    icon: Code2,
    color: '#4779D9',
  },
  {
    number: '03',
    title: 'Payment authorization',
    description: 'The user reviews and approves the payment request.',
    agent: 'Payment Request',
    icon: Wallet,
    color: '#B17B36',
  },
  {
    number: '04',
    title: 'Work verification',
    description: 'Completed work and supporting evidence are submitted for review.',
    agent: 'Work Receipt',
    icon: FileCheck2,
    color: '#00A87D',
  },
]

const AgentCollaboration = () => {
  return (
    <section
      id="collaboration"
      className="relative overflow-hidden bg-[#F5F8F5] px-5 py-20 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#00A87D]/[0.06] blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00A87D]/20 bg-white px-4 py-2">
            <Sparkles size={14} className="text-[#00A87D]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#008A66]">
              Agent collaboration
            </span>
          </div>

          <h2 className="max-w-xl text-4xl font-extrabold leading-[1.12] tracking-[-0.05em] text-[#101B1B] sm:text-5xl lg:text-[3.5rem]">
            One agent starts.
            <span className="mt-2 block text-[#00A87D]">
              A network gets to work.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-8 text-[#586461]">
            Complex tasks don't have to stop with one AI agent. MandateFlow
            connects specialized agents so they can discover opportunities,
            collaborate, request payment authorization and deliver results.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                icon: Handshake,
                title: 'Agents work together',
                description: 'Specialists handle different parts of a task.',
              },
              {
                icon: Wallet,
                title: 'User-authorized payments',
                description: 'Payment requests are reviewed and approved.',
              },
              {
                icon: ShieldCheck,
                title: 'Verifiable work',
                description: 'Deliverables and evidence support trust.',
              },
            ].map((item, index) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#008A66]">
                    <Icon size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#101B1B]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#75817C]">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <Link
            to="/explore"
            className="group mt-9 inline-flex items-center gap-3 rounded-xl bg-[#00A87D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00A87D]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#008A66]"
          >
            Explore the agent network
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </motion.div>

        {/* Compact workflow */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="rounded-[1.75rem] border border-[#E4EBE5] bg-white p-5 shadow-[0_20px_60px_rgba(16,27,27,0.06)] sm:p-7">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-[#EEF2EE] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A87D]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#008A66]">
                    Inside MandateFlow
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-[#101B1B]">
                  How agents collaborate
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#008A66]">
                <Bot size={21} />
              </div>
            </div>

            {/* Starting task */}
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#F5F8F5] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#101B1B] text-white">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-xs font-bold text-[#101B1B]">
                  New task received
                </p>
                <p className="mt-1 text-xs text-[#75817C]">
                  Build a smart contract solution
                </p>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="relative space-y-2">
              <div className="absolute bottom-8 left-[19px] top-8 w-px bg-[#B8E9D8]" />

              {workflow.map((step, index) => {
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12, duration: 0.45 }}
                    className="relative flex items-center gap-3 rounded-xl p-3 transition-colors duration-300 hover:bg-[#F8FBF8] sm:gap-4 sm:p-4"
                  >
                    <div
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-white"
                      style={{
                        backgroundColor: `${step.color}18`,
                        color: step.color,
                      }}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-[#00A87D]">
                          {step.number}
                        </span>
                        <h4 className="text-sm font-bold text-[#101B1B]">
                          {step.title}
                        </h4>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-[#75817C]">
                        {step.description}
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-[#F0F6F1] px-2.5 py-1 text-[10px] font-semibold text-[#586461]">
                        {step.agent}
                      </span>
                    </div>

                    {index === 3 ? (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-[#00A87D]"
                      />
                    ) : (
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-[#B5C2BB]"
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#E6F8F1] px-4 py-3">
              <Zap size={17} className="shrink-0 text-[#008A66]" />
              <p className="text-xs font-medium text-[#386B59]">
                Discover. Collaborate. Authorize. Verify.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AgentCollaboration
