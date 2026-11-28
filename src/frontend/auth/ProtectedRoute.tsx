import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, sessionError, refreshUser } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#586461]">Checking your session…</div>
  }

  if (status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-5">
        <div className="max-w-md rounded-2xl border border-[#E8EDE8] bg-white p-7 text-center shadow-sm">
          <h1 className="text-lg font-bold text-[#101B1B]">Could not verify your session</h1>
          <p className="mt-2 text-sm text-[#586461]">{sessionError}</p>
          <button
            type="button"
            onClick={() => void refreshUser()}
            className="mt-5 rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#008A66]"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/sign-in" replace state={{ from: location }} />
  }

  return children
}
