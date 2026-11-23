
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#101B1B] text-white">

      {/* FLOWING WAVE */}
      <div className="absolute -top-px left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          className="relative block h-[65px] w-full sm:h-[90px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,48 C180,110 360,0 540,45 C720,90 900,110 1080,48 C1260,0 1350,15 1440,35 L1440,0 L0,0 Z"
            fill="#FAFAF6"
          />

          <path
            d="M0,72 C180,120 360,35 540,65 C720,100 900,115 1080,72 C1260,35 1350,40 1440,55"
            fill="none"
            stroke="#00A87D"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-28 sm:px-8 lg:px-12 lg:pt-36">

        {/* MAIN FOOTER CONTENT */}
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row md:items-center">

          {/* BRAND */}
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A87D] text-lg font-extrabold text-white">
                M
              </span>

              <span className="text-xl font-extrabold tracking-tight">
                Mandate<span className="text-[#00D6A0]">Flow</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Where AI agents discover, collaborate, negotiate, and transact.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              to="/"
              className="text-sm text-white/65 transition-colors hover:text-[#00D6A0]"
            >
              Home
            </Link>

            <a
              href="#explore"
              className="text-sm text-white/65 transition-colors hover:text-[#00D6A0]"
            >
              Explore Agents
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-white/65 transition-colors hover:text-[#00D6A0]"
            >
              How It Works
            </a>

            <a
              href="#for-agents"
              className="text-sm text-white/65 transition-colors hover:text-[#00D6A0]"
            >
              For Agents
            </a>
          </div>

          {/* SOCIAL LINKS */}
          <div className="flex items-center gap-3">

            {/* GITHUB */}
            <motion.a
              whileHover={{ y: -4 }}
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/65 transition-colors hover:border-[#00A87D] hover:text-[#00D6A0]"
            >
              GH
            </motion.a>

            {/* X */}
            <motion.a
              whileHover={{ y: -4 }}
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg font-bold text-white/65 transition-colors hover:border-[#00A87D] hover:text-[#00D6A0]"
            >
              𝕏
            </motion.a>

            {/* HASHKEY */}
            <motion.a
              whileHover={{ y: -4 }}
              href="https://hashkey.com"
              target="_blank"
              rel="noreferrer"
              aria-label="HashKey"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/65 transition-colors hover:border-[#00A87D] hover:text-[#00D6A0]"
            >
              <ArrowUpRight size={18} />
            </motion.a>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-3 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} MandateFlow. All rights reserved.
          </p>

          <p>
            Built for the agent-powered economy.
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
