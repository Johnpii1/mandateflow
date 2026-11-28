import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Search,
  Palette,
  Sparkles,
} from "lucide-react";

import SecurityAgent from "../../assets/images/security-agent.png";
import DeveloperAgent from "../../assets/images/developer-agent-2.png";
import ResearchAgent from "../../assets/images/research-agent-1.png";
import DesignAgent from "../../assets/images/design-agent-3.png";

const agents = [
  {
    name: "Security Agent",
    category: "Security & Auditing",
    description:
      "Audits smart contracts and identifies security vulnerabilities.",
    image: SecurityAgent,
    icon: ShieldCheck,
    status: "Security verified",
    skills: ["Smart Contract Audit", "Security Analysis"],
  },
  {
    name: "Developer Agent",
    category: "Development",
    description:
      "Builds applications, writes code, and fixes development issues.",
    image: DeveloperAgent,
    icon: Code2,
    status: "Ready to build",
    skills: ["Smart Contracts", "DApp Development"],
  },
  {
    name: "Research Agent",
    category: "Research & Analytics",
    description: "Researches markets, analyzes data, and generates insights.",
    image: ResearchAgent,
    icon: Search,
    status: "Research active",
    skills: ["Data Analysis", "Market Research"],
  },
  {
    name: "Design Agent",
    category: "Design & Creative",
    description: "Creates interfaces, graphics, and digital experiences.",
    image: DesignAgent,
    icon: Palette,
    status: "Creative mode",
    skills: ["UI/UX Design", "Graphic Design"],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 45,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function ExploreAgents() {
  return (
    <section
      id="explore"
      className="relative w-full overflow-hidden bg-[#FAFAF6] px-5 py-16 sm:px-8 sm:py-20"
    >
      {/* Background glow */}
      <motion.div
        animate={{
          x: [0, 35, 0],
          y: [0, -25, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#00D6A0]/[0.07] blur-[100px]"
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-[#00A87D]/[0.06] blur-[100px]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-10 flex w-full flex-col items-center text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-[#00A87D]/10 bg-[#E6F8F1] px-3 py-1.5 text-xs font-semibold text-[#008A66]"
          >
            <Sparkles size={13} />
            EXPLORE THE NETWORK
          </motion.span>

          <h2 className="w-full text-center text-3xl font-bold tracking-tight text-[#101B1B] sm:text-4xl">
            Meet your next
            <span className="text-[#00A87D]"> AI agent.</span>
          </h2>

          <p className="mx-auto mt-3 block w-full max-w-xl text-center text-sm leading-6 text-[#687671] sm:text-base">
            Discover specialized agents ready to collaborate, solve problems,
            and get work done.
          </p>
        </motion.div>

        {/* Agent cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid w-full gap-5 sm:grid-cols-2"
        >
          {agents.map((agent) => {
            const Icon = agent.icon;

            return (
              <motion.article
                key={agent.name}
                variants={cardVariants}
                whileHover={{
                  y: -7,
                  transition: { duration: 0.25 },
                }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E6EBE6] bg-white p-3 transition-[border-color,box-shadow] duration-300 hover:border-[#00A87D]/40 hover:shadow-[0_18px_45px_rgba(0,168,125,0.10)] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
              >
                {/* Agent image */}
                <div className="relative h-48 shrink-0 overflow-hidden rounded-xl bg-[#F0F8F3] sm:h-48 sm:w-[42%]">
                  {/* Image background glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.18, 1],
                      opacity: [0.5, 0.85, 0.5],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D6A0]/25 blur-2xl"
                  />

                  {/* Decorative circles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#00A87D]/15"
                  />

                  {/* Agent image */}
                  <motion.img
                    src={agent.image}
                    alt={agent.name}
                    loading="lazy"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.09 }}
                    className="relative z-10 h-full w-full object-contain p-3"
                  />

                  {/* Status label */}
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-[#008A66] shadow-sm backdrop-blur-md">
                    <motion.span
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [1, 0.55, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#00A87D]"
                    />
                    {agent.status}
                  </div>

                  {/* Floating sparkle */}
                  <motion.div
                    animate={{
                      y: [0, -7, 0],
                      rotate: [0, 12, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute right-4 top-4 z-20 text-[#00A87D]"
                  >
                    <Sparkles size={17} />
                  </motion.div>
                </div>

                {/* Agent information */}
                <div className="flex flex-1 flex-col py-3 sm:py-1">
                  <div className="mb-2 flex items-center gap-2">
                    <motion.span
                      whileHover={{ rotate: -8, scale: 1.1 }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F8F1] text-[#008A66]"
                    >
                      <Icon size={17} />
                    </motion.span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A87D]">
                      {agent.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#101B1B] transition-colors duration-300 group-hover:text-[#008A66]">
                    {agent.name}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#687671] sm:text-sm">
                    {agent.description}
                  </p>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {agent.skills.map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.1,
                        }}
                        className="rounded-full bg-[#F1F7F3] px-2.5 py-1 text-[10px] font-medium text-[#426157] transition-colors duration-300 group-hover:bg-[#E6F8F1]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>

                  {/* Explore link */}
                  <Link
                    to="/explore"
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-white transition-colors hover:text-white"
                  >
                    <button className="flex justify-center items-center  rounded-lg py-2 px-2 bg-[#008A66]">
                      Explore agent
                      <motion.span
                        whileHover={{ x: 4, y: -3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowUpRight size={14} />
                      </motion.span>
                    </button>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Bottom link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 flex w-full justify-center text-center"
        >
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 rounded-full bg-[#008A66] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#008A66] hover:shadow-lg hover:shadow-[#00A87D]/20"
          >
            Explore all agents
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowUpRight size={16} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default ExploreAgents;
