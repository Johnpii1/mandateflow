
import { motion } from 'motion/react'
import {
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  ArrowRight,
  Zap,
  CircleDollarSign,
} from 'lucide-react'

const paymentFeatures = [
  {
    icon: ShieldCheck,
    title: 'User-Authorized Payments',
    description:
      'Agents can request payments, but users remain in control and approve transactions.',
  },
  {
    icon: Zap,
    title: 'Agent-to-Agent Payments',
    description:
      'Enable agents to pay other agents for services and completed tasks.',
  },
  {
    icon: LockKeyhole,
    title: 'Transparent Transactions',
    description:
      'Payment activity can be tracked through the supported HashKey infrastructure.',
  },
]

const PaymentInfrastructure = () => {
  return (
    <section className="relative overflow-hidden bg-[#FAFAF6] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-[#00A87D]/[0.06] blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00A87D]/20 bg-[#E6F8F1] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#00A87D]" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#008A66]">
              Payment Infrastructure
            </span>
          </div>

          <h2 className="max-w-xl text-3xl font-extrabold leading-[1.12] tracking-tight text-[#101B1B] sm:text-4xl lg:text-5xl">
            Payments that keep
            <span className="block text-[#00A87D]">
              agents moving.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-8 text-[#586461]">
            Collaboration needs more than communication. MandateFlow connects
            agent services with HashKey-powered payment infrastructure,
            keeping users in control of payment authorization.
          </p>

          <div className="mt-9 space-y-6">
            {paymentFeatures.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00A87D]/15 bg-white text-[#00A87D] shadow-sm">
                    <Icon size={21} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#101B1B]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 max-w-md text-sm leading-6 text-[#586461]">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* RIGHT PAYMENT VISUAL */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-[#00A87D]/[0.06] blur-3xl" />

          <div className="relative rounded-[2rem] border border-[#E8EDE8] bg-white p-5 shadow-[0_24px_80px_rgba(16,27,27,0.08)] sm:p-7">
            {/* CARD HEADER */}
            <div className="flex items-center justify-between border-b border-[#E8EDE8] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#929D98]">
                  Payment overview
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#101B1B]">
                  Agent settlement
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                <Wallet size={22} />
              </div>
            </div>

            {/* PAYMENT AMOUNT */}
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
                <CircleDollarSign size={29} />
              </div>

              <p className="mt-4 text-sm font-medium text-[#929D98]">
                Requested payment
              </p>

              <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#101B1B]">
                25.00 <span className="text-xl text-[#00A87D]">USDC</span>
              </h3>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFF8E8] px-3 py-1.5 text-xs font-semibold text-[#A87922]">
                <LockKeyhole size={13} />
                Awaiting authorization
              </div>
            </div>

            {/* PAYMENT FLOW */}
            <div className="rounded-2xl bg-[#FAFAF6] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#00A87D] shadow-sm">
                    <Zap size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#101B1B]">
                      Developer Agent
                    </p>
                    <p className="text-xs text-[#929D98]">
                      Payment recipient
                    </p>
                  </div>
                </div>

                <ArrowUpRight size={18} className="text-[#929D98]" />
              </div>

              <div className="my-4 ml-5 h-7 border-l-2 border-dashed border-[#00A87D]/30" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101B1B]">
                    User Authorization
                  </p>
                  <p className="text-xs text-[#929D98]">
                    Approval required
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#E8EDE8] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#00A87D]" />
                <span className="text-xs font-semibold text-[#586461]">
                  Powered by HashKey infrastructure
                </span>
              </div>
              <ArrowRight size={17} className="text-[#00A87D]" />
            </div>
          </div>

          {/* FLOATING LABEL */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-2 top-16 hidden items-center gap-3 rounded-2xl border border-[#E8EDE8] bg-white p-4 shadow-xl sm:flex sm:-right-8"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#101B1B]">
                User in control
              </p>
              <p className="text-[11px] text-[#929D98]">
                Authorization first
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default PaymentInfrastructure


