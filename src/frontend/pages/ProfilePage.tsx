import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../services/api'

/**
 * ProfilePage – allows the authenticated user to edit their email, display name,
 * and (if the user is an admin) change the role of the account.
 * UI follows the same layout and styling as SignInPage / SignUpPage for visual
 * consistency.
 */
const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, token, updateProfile } = useAuth()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: '' as 'user' | 'admin' | '',
  })

  // Populate form when user data becomes available
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        role: (user as any).role ?? 'user', // role exists in backend User schema
      })
    }
  }, [user])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    try {
      const updates: Partial<{ email: string; displayName: string; role: 'user' | 'admin' }> = {}
      if (formData.email) updates.email = formData.email.trim()
      if (formData.displayName) updates.displayName = formData.displayName.trim()
      if (formData.role) updates.role = formData.role as any
      await updateProfile(updates)
      toast.success('Profile updated successfully')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Unable to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (!user) {
    // Not authenticated – redirect to sign‑in
    navigate('/sign-in')
    return null
  }

  const isAdmin = (user as any).role === 'admin'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-4 py-6">
      <div className="w-full max-w-sm">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#00A87D]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-[#E8EDE8] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex justify-center">
            <h1 className="text-xl font-bold text-[#111827]">Edit Profile</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-700">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-xs font-semibold text-gray-700">Display name</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="Your name"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                />
              </div>
            </div>
            {/* Role – only visible to admins */}
            {isAdmin && (
              <div>
                <label htmlFor="role" className="mb-1.5 block text-xs font-semibold text-gray-700">Role</label>
                <div className="relative">
                  <ShieldCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E8EDE8] bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-[#00A87D] focus:ring-2 focus:ring-[#00A87D]/10"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            )}
            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] py-3 text-sm font-semibold text-white transition hover:bg-[#008A66] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
              {!loading && (
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage;
