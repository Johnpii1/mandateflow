
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Mandateflow from '../../assets/images/logomd.png'

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    // email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      toast.error(
        'Username must be 3–20 characters and contain only letters, numbers, or underscores'
      )
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Registration API will be connected here.
      // Send fullName, username, and password to the backend.
      toast.info('Account registration is not connected yet')
    } catch {
      toast.error('Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-4 py-6">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#00A87D]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-[#E8EDE8] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex justify-center">
            <Link to="/">
              <img
                src={Mandateflow}
                alt="MandateFlow"
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
              <User size={21} />
            </div>

            <h1 className="text-xl font-bold text-[#111827]">
              Create your account
            </h1>

            <p className="mt-1.5 text-xs text-gray-500">
              Join MandateFlow and discover what AI agents can do for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Username
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  @
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>

              <p className="mt-1 text-[10px] text-gray-400">
                3–20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            {/* Email field temporarily disabled */}

            {/*
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>
            */}

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
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
              disabled={loading}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] py-3 text-sm font-semibold text-white transition hover:bg-[#008A66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8EDE8]" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] text-gray-400">
                ALREADY HAVE AN ACCOUNT?
              </span>
            </div>
          </div>

          <Link
            to="/sign-in"
            className="flex w-full items-center justify-center rounded-xl border border-[#DCE5DF] py-3 text-sm font-semibold text-gray-700 transition hover:border-[#00A87D] hover:bg-[#F3FBF7] hover:text-[#008A66]"
          >
            Sign In
          </Link>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck size={14} className="text-[#00A87D]" />
            Your account details are kept secure
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MandateFlow. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
