
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Mandateflow from '../../assets/images/logomd.png'
import { ApiError } from '../services/api'
import { useAuth } from '../auth/AuthContext'

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email.trim() || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      await login(formData.email.trim().toLowerCase(), formData.password)
      toast.success('You are signed in.')
      const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
      const returnTo = from?.pathname
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : '/dashboard'
      navigate(returnTo, { replace: true })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to sign in. Please try again.')
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
              <LockKeyhole size={21} />
            </div>

            <h1 className="text-xl font-bold text-[#111827]">
              Welcome back
            </h1>

            <p className="mt-1.5 text-xs text-gray-500">
              Sign in to continue to your MandateFlow account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                  maxLength={254}
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-gray-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      'Password recovery is not available yet.'
                    )
                  }
                  className="text-xs font-semibold text-[#00A87D] hover:text-[#008A66]"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] py-3 text-sm font-semibold text-white transition hover:bg-[#008A66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}

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
                NEW TO MANDATEFLOW?
              </span>
            </div>
          </div>

          <Link
            to="/sign-up"
            className="flex w-full items-center justify-center rounded-xl border border-[#DCE5DF] py-3 text-sm font-semibold text-gray-700 transition hover:border-[#00A87D] hover:bg-[#F3FBF7] hover:text-[#008A66]"
          >
            Create an account
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

export default SignInPage
