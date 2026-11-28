
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Mandateflow from "../../../assets/images/logomd.png";
import { toast } from "sonner";
import { ArrowUpRight, Menu, X, Sparkles } from "lucide-react";
import LaunchAppModal from "../modals/LaunchAppModal";

const navLinks = [
  {
    name: "Home",
    href: "/",
    message: "Welcome to MandateFlow",
  },
  {
    name: "Explore",
    href: "#explore",
    message: "Exploring available AI agents...",
  },
  {
    name: "How It Works",
    href: "#how-it-works",
    message: "Discover how MandateFlow works...",
  },
  {
    name: "For Agents",
    href: "#for-agents",
    message: "Discover opportunities for your agent...",
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = location.hash.substring(1);

    const timer = window.setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setActiveSection(sectionId);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = ["explore", "how-it-works", "for-agents"];

    const handleScroll = () => {
      if (window.scrollY < 150) {
        setActiveSection("");
        return;
      }

      let currentSection = "";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);

        if (section && section.getBoundingClientRect().top <= 180) {
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavigation = (href: string, message: string) => {
    toast.success(message, {
      duration: 1800,
    });

    closeMenu();

    if (href === "/") {
      setActiveSection("");
      navigate("/");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (href.startsWith("#")) {
      const sectionId = href.substring(1);

      if (location.pathname === "/") {
        navigate(`/${href}`, { replace: true });

        window.setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          setActiveSection(sectionId);
        }, 50);

        return;
      }

      navigate(`/${href}`);
      return;
    }

    navigate(href);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return (
        location.pathname === "/" &&
        !activeSection &&
        !location.hash
      );
    }

    if (href.startsWith("#")) {
      return (
        location.pathname === "/" &&
        activeSection === href.substring(1)
      );
    }

    return location.pathname === href;
  };

  const openSignUp = () => {
    closeMenu();
    setAuthModalOpen(true);
  };

  const desktopLinkClass = (href: string) =>
    `rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
      isActive(href)
        ? "border-[#00A87D]/30 bg-[#E6F8F1] text-[#008A66]"
        : "border-transparent text-[#586461] hover:border-[#00A87D]/25 hover:bg-[#E6F8F1]/70 hover:text-[#008A66]"
    }`;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-[#E8EDE8] bg-[#FAFAF6]/95 shadow-[0_8px_30px_rgba(16,27,27,0.06)] backdrop-blur-2xl"
            : "border-b border-transparent bg-[#FAFAF6]/80 backdrop-blur-md"
        }`}
      >
        <nav className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            onClick={(event) => {
              event.preventDefault();
              handleNavigation("/", "Welcome to MandateFlow");
            }}
            className="group relative z-50 flex items-center"
            aria-label="MandateFlow home"
          >
            <img
              src={Mandateflow}
              alt="MandateFlow logo"
              className="h-auto w-20 object-contain transition-opacity duration-300 group-hover:opacity-75 sm:w-24 md:w-32"
            />
          </Link>

          <div className="hidden items-center gap-2 font-bold lg:flex">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.08,
                  duration: 0.5,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    handleNavigation(link.href, link.message)
                  }
                  className={desktopLinkClass(link.href)}
                >
                  {link.name}
                </button>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP SIGN UP BUTTON */}
          <div className="hidden items-center lg:flex">
            <motion.button
              type="button"
              onClick={openSignUp}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex items-center gap-2 overflow-hidden font-bold rounded-xl bg-[#00A87D] px-5 py-3 text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,168,125,0.14)] transition-all duration-300 hover:bg-[#008A66] hover:shadow-[0_6px_18px_rgba(0,168,125,0.22)]"
            >
              <span className="relative z-10">Sign Up</span>

              <ArrowUpRight
                size={16}
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />

              <motion.span
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.button>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8EDE8] bg-white text-[#101B1B] transition-colors hover:border-[#00A87D]/30 hover:bg-[#E6F8F1] lg:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={21} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={21} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 cursor-default bg-[#101B1B]/20 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 right-0 top-[68px] z-40 border-b border-[#E8EDE8] bg-[#FAFAF6] px-5 pb-7 pt-5 shadow-[0_20px_40px_rgba(16,27,27,0.08)] lg:hidden"
            >
              <div className="mx-auto flex max-w-xl flex-col">
                <div className="mb-5 flex items-center gap-2 border-b border-[#E8EDE8] pb-4">
                  <Sparkles size={15} className="text-[#00A87D]" />

                  <span className="text-xs font-semibold uppercase tracking-[2px] text-[#929D98]">
                    Navigation
                  </span>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  className="flex flex-col gap-2"
                >
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.name}
                      variants={{
                        hidden: { opacity: 0, x: -15 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleNavigation(link.href, link.message)
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                          isActive(link.href)
                            ? "border-[#00A87D]/30 bg-[#E6F8F1] text-[#008A66]"
                            : "border-transparent text-[#586461] hover:border-[#00A87D]/25 hover:bg-[#E6F8F1]/70 hover:text-[#008A66]"
                        }`}
                      >
                        {link.name}
                        <ArrowUpRight size={16} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* MOBILE SIGN UP BUTTON */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-5"
                >
                  <button
                    type="button"
                    onClick={openSignUp}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-3.5 text-sm font-bold text-white shadow-lg font-bold shadow-[#00A87D]/15 transition-all hover:bg-[#008A66] active:scale-[0.98]"
                  >
                    Sign Up
                    <ArrowUpRight size={17} />
                  </button>
                </motion.div>

                <p className="mt-5 text-center text-[11px] font-medium tracking-wide text-[#929D98]">
                  Intelligent agents. Seamless collaboration.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LaunchAppModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView="signup"
      />
    </>
  );
};

export default Navbar;
