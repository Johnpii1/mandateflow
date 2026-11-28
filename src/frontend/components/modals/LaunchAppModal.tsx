
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  ArrowRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../services/api";
import { useAuth } from "../../auth/AuthContext";

interface LaunchAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup";
}

type AuthView = "signin" | "signup";

const LaunchAppModal = ({
  isOpen,
  onClose,
  initialView = "signup",
}: LaunchAppModalProps) => {
  const [activeView, setActiveView] = useState<AuthView>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
  }, [isOpen, initialView, onClose]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signInData.email.trim() || !signInData.password) {
      toast.error("Please complete all fields.");
      return;
    }

    setSignInLoading(true);
    try {
      await login(signInData.email.trim().toLowerCase(), signInData.password);
      toast.success("You are signed in.");
      onClose();
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !signUpData.name.trim() ||
      !signUpData.email.trim() ||
      !signUpData.password ||
      !signUpData.confirmPassword
    ) {
      toast.error("Please complete all fields.");
      return;
    }

    if (signUpData.password.length < 10 || signUpData.password.length > 128) {
      toast.error("Your password must contain 10 to 128 characters.");
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }

    setSignUpLoading(true);
    try {
      await register(signUpData.email.trim().toLowerCase(), signUpData.password, signUpData.name.trim());
      toast.success("Account created. You are signed in.");
      onClose();
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to create your account. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E2EAE5] bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#101B1B] outline-none transition-all placeholder:text-[#A1ADA6] focus:border-[#00A87D] focus:ring-4 focus:ring-[#00A87D]/10";

  const labelClass =
    "mb-2 block text-xs font-bold text-[#34433C]";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#07110F]/70 px-4 py-6 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 25,
            }}
            className="relative my-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#E5EEE9] bg-[#FAFCFA] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-9"
          >
            {/* CLOSE BUTTON */}
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4F0] text-[#52615B] transition hover:bg-[#DDEAE3]"
            >
              <X size={18} />
            </motion.button>

            {/* BRAND ICON */}
            <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#E2F8EF] p-3 text-[#00A87D]">
              {activeView === "signup" ? (
                <UserPlus size={25} />
              ) : (
                <LogIn size={25} />
              )}
            </div>

            {/* HEADING */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2px] text-[#00A87D]">
                  <Sparkles size={13} />
                  Welcome to MandateFlow
                </p>

                <h2
                  id="auth-modal-title"
                  className="text-2xl font-extrabold tracking-tight text-[#101B1B] sm:text-3xl"
                >
                  {activeView === "signup"
                    ? "Create your account."
                    : "Welcome back."}
                </h2>

                <p className="mt-3 text-sm font-medium leading-6 text-[#68766F]">
                  {activeView === "signup"
                    ? "Join the MandateFlow ecosystem and discover a smarter way to work with AI agents."
                    : "Sign in to access your workspace, manage your agents, and continue where you left off."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ACCOUNT SECURITY */}
            <div className="my-6 flex items-center gap-3 rounded-2xl border border-[#E1EBE5] bg-white p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F8F0] text-[#00A87D]">
                <ShieldCheck size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101B1B]">
                  Your account, your workspace
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#829089]">
                  Secure access to your MandateFlow account.
                </p>
              </div>
            </div>

            {/* AUTH FORMS */}
            <AnimatePresence mode="wait">
              {activeView === "signup" ? (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  {/* FULL NAME */}
                  <div>
                    <label className={labelClass}>Full Name</label>

                    <div className="relative">
                      <User
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={signUpData.name}
                        onChange={(event) =>
                          setSignUpData((previous) => ({
                            ...previous,
                            name: event.target.value,
                          }))
                        }
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className={labelClass} htmlFor="modal-signup-email">Email address</label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        id="modal-signup-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signUpData.email}
                        onChange={(event) =>
                          setSignUpData((previous) => ({
                            ...previous,
                            email: event.target.value,
                          }))
                        }
                        className={inputClass}
                        maxLength={254}
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className={labelClass}>Password</label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(event) =>
                          setSignUpData((previous) => ({
                            ...previous,
                            password: event.target.value,
                          }))
                        }
                        className={`${inputClass} pr-12`}
                        minLength={10}
                        maxLength={128}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A69E] hover:text-[#00A87D]"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <p className="mt-1.5 text-[10px] font-medium text-[#98A69E]">
                      Use 10 to 128 characters.
                    </p>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className={labelClass}>Confirm Password</label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(event) =>
                          setSignUpData((previous) => ({
                            ...previous,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className={`${inputClass} pr-12`}
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A69E] hover:text-[#00A87D]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signUpLoading}
                    className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#00A87D] px-6 py-4 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(0,168,125,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008A66] hover:shadow-[0_12px_28px_rgba(0,168,125,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {signUpLoading ? "Creating account…" : "Create Account"}

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </motion.form>
              ) : (
                /* SIGN IN FORM */
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-5"
                >
                  {/* USERNAME */}
                  <div>
                    <label className={labelClass}>Username</label>

                    <div className="relative">
                      <User
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        id="modal-signin-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signInData.email}
                        onChange={(event) =>
                          setSignInData((previous) => ({
                            ...previous,
                            email: event.target.value,
                          }))
                        }
                        className={inputClass}
                        required
                        maxLength={254}
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className={labelClass}>Password</label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A69E]"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(event) =>
                          setSignInData((previous) => ({
                            ...previous,
                            password: event.target.value,
                          }))
                        }
                        className={`${inputClass} pr-12`}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A69E] hover:text-[#00A87D]"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#00A87D] px-6 py-4 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(0,168,125,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008A66] hover:shadow-[0_12px_28px_rgba(0,168,125,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {signInLoading ? "Signing in…" : "Sign In"}

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* SWITCH AUTH VIEW */}
            <div className="mt-6 border-t border-[#E8EDE8] pt-5 text-center">
              <p className="text-xs font-medium text-[#829089]">
                {activeView === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}

                <button
                  type="button"
                  onClick={() => {
                    setActiveView((previous) =>
                      previous === "signup" ? "signin" : "signup"
                    );
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="ml-1.5 font-extrabold text-[#008A66] transition-colors hover:text-[#00A87D]"
                >
                  {activeView === "signup" ? "Sign In" : "Create Account"}
                </button>
              </p>
            </div>

            <p className="mt-5 text-center text-[10px] font-medium leading-5 text-[#A0AAA4]">
              Intelligent agents. Seamless collaboration.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LaunchAppModal;
