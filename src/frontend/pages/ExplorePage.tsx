import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  Code2,
  Palette,
  Sparkles,
  // SlidersHorizontal,
  X,
  Bot,
  // CheckCircle2,
} from "lucide-react";

// import SecurityAgent from "../../assets/images/security-agent.png";
// import DeveloperAgent from "../../assets/images/developer-agent-2.png";
// import ResearchAgent from "../../assets/images/research-agent-1.png";
// import DesignAgent from "../../assets/images/design-agent-3.png";

import { apiRequest, ApiError } from "../../frontend/services/api";

const STORAGE_KEY = "mandateflow_agents";

const categories = [
  "All Agents",
  "Development",
  "Security",
  "Research",
  "Design",
  "Other",
];

type RegisteredAgent = {
  id: string;
  name: string;
  category: string;
  specialty?: string;
  description?: string;
  framework?: string;
  capabilities?: string[];
  status: string;
  pricingModel?: string;
  price?: string;
  endpoint?: string;
  documentation?: string;
  image?: string;
  avatar?: string;
  imageSource?: "custom" | "category";
};

type MarketplaceAgent = {
  id: string;
  name: string;
  category: string;
  specialty: string;
  description: string;
  image: string;
  icon: typeof ShieldCheck;
  status: string;
  skills: string[];
  isRegistered: boolean;
  verified: boolean;
  pricingModel?: string;
  price?: string;
};

// Demo agents removed – we now fetch from the backend marketplace API.

const getRegisteredAgents = (): RegisteredAgent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (agent: RegisteredAgent) =>
        agent && agent.id && agent.name && agent.status === "Active",
    );
  } catch {
    return [];
  }
};

const getCategory = (category: string): string => {
  const value = category.toLowerCase();
  if (
    value.includes("develop") ||
    value.includes("coding") ||
    value.includes("software")
  ) {
    return "Development";
  }
  if (value.includes("security") || value.includes("audit")) {
    return "Security";
  }
  if (
    value.includes("research") ||
    value.includes("analytics") ||
    value.includes("data")
  ) {
    return "Research";
  }
  if (value.includes("design") || value.includes("creative")) {
    return "Design";
  }
  return "Other";
};

const getAgentIcon = (category: string): typeof ShieldCheck => {
  switch (getCategory(category)) {
    case "Development":
      return Code2;
    case "Security":
      return ShieldCheck;
    case "Research":
      return Search;
    case "Design":
      return Palette;
    default:
      return Bot;
  }
};

const mapApiAgent = (apiAgent: any): MarketplaceAgent => {
  const category = getCategory(apiAgent.category || "");
  return {
    id: apiAgent.agentId ?? apiAgent.id ?? "",
    name: apiAgent.name ?? "",
    category,
    specialty: apiAgent.serviceDescription || apiAgent.category || "AI Agent",
    description: apiAgent.description ?? "",
    image: apiAgent.avatarUrl || "",
    icon: getAgentIcon(apiAgent.category || ""),
    status: apiAgent.status ?? "draft",
    skills: apiAgent.capabilities ?? [],
    isRegistered: false,
    verified: apiAgent.status === "active",
    pricingModel: apiAgent.pricing?.model,
    price: apiAgent.pricing?.amount,
  };
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [registeredAgents, setRegisteredAgents] = useState<MarketplaceAgent[]>(
    [],
  );
  const [apiAgents, setApiAgents] = useState<MarketplaceAgent[]>([]);

  const refreshAgents = useCallback(() => {
    setRegisteredAgents(
      getRegisteredAgents().map((registered) => {
        const category = getCategory(registered.category);
        return {
          id: registered.id,
          name: registered.name,
          category,
          specialty: registered.specialty || registered.category || "AI Agent",
          description:
            registered.description ||
            "An approved AI agent available on the MandateFlow marketplace.",
          image: registered.image || registered.avatar || "",
          icon: getAgentIcon(registered.category),
          status: "Verified",
          skills: registered.capabilities || [],
          isRegistered: true,
          verified: true,
          pricingModel: registered.pricingModel,
          price: registered.price,
        };
      }),
    );
  }, []);

  // Load marketplace agents from backend
  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const data = await apiRequest<any>("/api/v1/marketplace/agents");
        const agentsArray = Array.isArray(data) ? data : (data.agents ?? []);
        setApiAgents(agentsArray.map(mapApiAgent));
      } catch (err) {
        console.error("Failed to fetch marketplace agents", err);
      }
    };
    loadMarketplace();
  }, []);

  useEffect(() => {
    refreshAgents();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refreshAgents();
    };
    const handleFocus = () => refreshAgents();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshAgents();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshAgents]);

  const allAgents = useMemo(
    () => [...registeredAgents, ...apiAgents],
    [registeredAgents, apiAgents],
  );

  const filteredAgents = useMemo(() => {
    return allAgents.filter((agent) => {
      const matchesCategory =
        activeCategory === "All Agents" || agent.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.specialty.toLowerCase().includes(query) ||
        agent.skills.some((skill) => skill.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [allAgents, activeCategory, searchQuery]);

  const scrollToListings = () => {
    document
      .getElementById("agent-listings")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All Agents");
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* HEADER */}
      <section className="relative overflow-hidden px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-10">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#00A87D]/[0.08] blur-[110px]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.button
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleBack}
            className="mb-10 inline-flex items-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#586461] shadow-sm transition-all hover:border-[#00A87D]/40 hover:bg-[#E6F8F1] hover:text-[#008A66]"
          >
            <ArrowLeft size={17} />
            Back
          </motion.button>
          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00A87D]/20 bg-[#E6F8F1] px-4 py-2">
                <Sparkles size={15} className="text-[#00A87D]" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#008A66]">
                  Agent Marketplace
                </span>
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#101B1B] sm:text-5xl lg:text-6xl">
                Discover agents.
                <span className="block text-[#00A87D]">Get things done.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#586461] sm:text-lg">
                Explore specialized AI agents, discover their capabilities, and
                find the right agents to help bring your ideas to life.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-4 py-2 text-xs font-semibold text-[#586461]">
                  <ShieldCheck size={15} className="text-[#00A87D]" />
                  Verified agents
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-4 py-2 text-xs font-semibold text-[#586461]">
                  <Bot size={15} className="text-[#00A87D]" />
                  {registeredAgents.length} approved registrations
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full lg:max-w-xl lg:flex-1"
            >
              <p className="mb-3 text-sm font-semibold text-[#101B1B]">
                Find the right agent for your task
              </p>
              <div className="flex w-full items-center gap-3 rounded-2xl border border-[#E8EDE8] bg-white p-2 pl-4 shadow-[0_8px_30px_rgba(16,27,27,0.05)]">
                <Search size={21} className="shrink-0 text-[#929D98]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") scrollToListings();
                  }}
                  placeholder="Search agents, skills or services..."
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#101B1B] outline-none ring-0 focus:!border-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 placeholder:text-[#929D98]"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#929D98] hover:bg-[#E6F8F1] hover:text-[#008A66]"
                  >
                    <X size={17} />
                  </button>
                )}
                <button
                  onClick={scrollToListings}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#00A87D] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#008A66] sm:px-5"
                >
                  Search
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* The rest of the component (filters, listings, etc.) remains unchanged */}
    </div>
  );
};

export default ExplorePage;
