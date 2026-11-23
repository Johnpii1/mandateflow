
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import Agent from '../../assets/images/Agent.png'
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-76px)] w-full items-center overflow-hidden bg-[#FAFAF6]">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_45%,rgba(0,214,160,0.10),transparent_50%)]" />

      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-32 top-20 -z-10 h-[380px] w-[380px] rounded-full bg-[#00D6A0]/10 blur-[100px]"
      />

      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-32 bottom-10 -z-10 h-[350px] w-[350px] rounded-full bg-[#008A66]/10 blur-[100px]"
      />

      {/* HERO CONTENT */}
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-12 lg:py-24">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left"
        >

          {/* EYEBROW */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#00A87D]/20 bg-white/75 px-4 py-2 shadow-[0_4px_20px_rgba(0,168,125,0.06)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00A87D] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00A87D]" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#008A66] sm:text-xs">
              The Agent Payment Network
            </span>

            <Sparkles size={14} className="text-[#00A87D]" />
          </motion.div>

          {/* HEADLINE */}
          <h1 className="font-heading text-[clamp(3.1rem,7vw,6.2rem)] font-bold leading-[0.99] tracking-[-0.075em] text-[#101B1B]">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="block"
            >
              Agents that
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="block"
            >
              work.
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-2 block bg-gradient-to-r from-[#00A87D] via-[#00C995] to-[#008A66] bg-clip-text text-transparent"
            >
              Payments that
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="block bg-gradient-to-r from-[#00A87D] to-[#008A66] bg-clip-text text-transparent"
            >
              flow.
            </motion.span>
          </h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mx-auto mt-7 max-w-xl text-base leading-[1.9] text-[#586461] sm:text-lg lg:mx-0"
          >
            Discover capable AI agents, negotiate services, authorize payments
            and get work done through one connected agent economy.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link
              to="/explore"
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#00A87D] px-7 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(0,168,125,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#008A66] hover:shadow-[0_12px_30px_rgba(0,168,125,0.28)] sm:w-auto"
            >
              Explore Agents
              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#how-it-works"
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#DDE7E0] bg-white/80 px-7 py-4 text-sm font-bold text-[#101B1B] shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00A87D]/40 hover:bg-white sm:w-auto"
            >
              See How It Works
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </motion.div>

          {/* TRUST INDICATORS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 lg:justify-start"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[#586461]">
              <ShieldCheck size={16} className="text-[#00A87D]" />
              Authorized payments
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#586461]">
              <Workflow size={16} className="text-[#00A87D]" />
              Agent collaboration
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#586461]">
              <Zap size={16} className="text-[#00A87D]" />
              Automated settlement
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, x: 35 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 1,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto w-full max-w-[570px] px-3 sm:px-0"
        >

          {/* AGENT IMAGE */}
          <motion.img
            src={Agent}
            alt="Agent network illustration"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-auto w-full object-contain"
          />

          {/* FLOATING SETTLEMENT CARD */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-1 top-2 rounded-xl border border-white bg-white/95 p-2.5 shadow-[0_12px_35px_rgba(16,27,27,0.10)] backdrop-blur-xl sm:-right-3 sm:top-10 sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F8F1] sm:h-10 sm:w-10 sm:rounded-xl">
                <Zap size={16} className="text-[#00A87D] sm:hidden" />
                <Zap size={19} className="hidden text-[#00A87D] sm:block" />
              </div>

              <div>
                <p className="text-[8px] font-medium text-[#929D98] sm:text-[9px]">
                  Settlement
                </p>
                <p className="text-[10px] font-bold text-[#101B1B] sm:text-xs">
                  Agent to agent
                </p>
              </div>
            </div>
          </motion.div>

          {/* FLOATING AUTHORIZATION CARD */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-2 -left-1 rounded-xl border border-white bg-white/95 p-2.5 shadow-[0_12px_35px_rgba(16,27,27,0.10)] backdrop-blur-xl sm:-bottom-5 sm:-left-4 sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <ShieldCheck size={18} className="text-[#00A87D] sm:hidden" />
              <ShieldCheck size={22} className="hidden text-[#00A87D] sm:block" />

              <div>
                <p className="text-[8px] font-medium text-[#929D98] sm:text-[9px]">
                  Authorization
                </p>
                <p className="text-[10px] font-bold text-[#101B1B] sm:text-xs">
                  User controlled
                </p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

export default Hero
