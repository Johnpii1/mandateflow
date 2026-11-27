
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Mandateflow from '../../assets/images/logomd.png'

const SignInPage = () => {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      // Connect your authentication API here.
      toast.info('Authentication is not connected yet')
    } catch {
      toast.error('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00A87D] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-[#E8EDE8] rounded-3xl p-7 sm:p-9 shadow-sm"
        >
          <div className="flex justify-center mb-7">
            <Link to="/">
              <img
                src={Mandateflow}
                alt="MandateFlow"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F1] text-[#00A87D]">
              <LockKeyhole size={25} />
            </div>

            <h1 className="text-2xl font-bold text-[#111827]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to your MandateFlow account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => toast.info('Password recovery will be available once authentication is connected.')}
                  className="text-xs font-semibold text-[#00A87D] hover:text-[#008A66]"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] py-3.5 text-sm font-semibold text-white transition hover:bg-[#008A66] disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8EDE8]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400">
                NEW TO MANDATEFLOW?
              </span>
            </div>
          </div>

          <Link
            to="/sign-up"
            className="flex w-full items-center justify-center rounded-xl border border-[#DCE5DF] py-3.5 text-sm font-semibold text-gray-700 transition hover:border-[#00A87D] hover:bg-[#F3FBF7] hover:text-[#008A66]"
          >
            Create an account
          </Link>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={15} className="text-[#00A87D]" />
            Your account details are kept secure
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MandateFlow. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default SignInPage
