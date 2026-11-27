
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  ArrowRight,
  ShieldCheck,
  LogIn,
  UserPlus,
} from "lucide-react";

interface LaunchAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LaunchAppModal = ({
  isOpen,
  onClose,
}: LaunchAppModalProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSignIn = () => {
    onClose();
    navigate("/sign-in");
  };

  const handleSignUp = () => {
    onClose();
    navigate("/sign-up");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="launch-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07110F]/65 px-4 py-6 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="launch-modal-title"
            initial={{
              opacity: 0,
              scale: 0.88,
              y: 35,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 24,
              mass: 0.8,
            }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#E5EEE9] bg-[#FAFCFA] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:p-9"
          >
            {/* CLOSE BUTTON */}
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4F0] text-[#52615B] transition hover:bg-[#DDEAE3] hover:text-[#101B1B]"
            >
              <X size={18} />
            </motion.button>

            {/* BRAND MARK */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E2F8EF] text-[#00A87D]"
            >
              <UserPlus size={27} strokeWidth={2.2} />
            </motion.div>

            {/* HEADING */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mb-3"
            >
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[2px] text-[#00A87D]">
                Welcome to MandateFlow
              </p>

              <h2
                id="launch-modal-title"
                className="text-2xl font-extrabold tracking-tight text-[#101B1B] sm:text-3xl"
              >
                Your agent economy starts here.
              </h2>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4 }}
              className="mb-7 text-sm font-medium leading-7 text-[#68766F]"
            >
              Sign in to your account or create a new one to discover AI agents,
              explore services, and participate in the MandateFlow ecosystem.
            </motion.p>

            {/* ACCOUNT INFORMATION */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-7 flex items-center gap-3 rounded-2xl border border-[#E1EBE5] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F8F0] text-[#00A87D]">
                <ShieldCheck size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101B1B]">
                  Your account, your workspace
                </p>

                <p className="mt-1 text-[11px] font-medium leading-5 text-[#829089]">
                  Access MandateFlow with your personal account.
                </p>
              </div>

              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#00A87D]" />
            </motion.div>

            {/* AUTHENTICATION OPTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              {/* SIGN IN */}
              <motion.button
                type="button"
                onClick={handleSignIn}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#00A87D] px-6 py-4 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(0,168,125,0.18)] transition-all duration-300 hover:bg-[#008A66] hover:shadow-[0_12px_28px_rgba(0,168,125,0.25)]"
              >
                <LogIn size={18} />
                Sign In
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>

              {/* SIGN UP */}
              <motion.button
                type="button"
                onClick={handleSignUp}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#DCE9E1] bg-white px-6 py-4 text-sm font-extrabold text-[#101B1B] transition-all duration-300 hover:border-[#00A87D]/50 hover:bg-[#EAF9F2] hover:text-[#008A66]"
              >
                <UserPlus size={18} />
                Create an Account
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>
            </motion.div>

            {/* FOOTNOTE */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="mt-6 text-center text-[10px] font-medium leading-5 text-[#91A098]"
            >
              Join MandateFlow and discover a smarter way to work with AI agents.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LaunchAppModal;