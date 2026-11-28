
import { Routes, Route } from 'react-router-dom'

import LandingPage from './frontend/pages/LandingPage'
import ExplorePage from './frontend/pages/ExplorePage'
import AgentDetailsPage from './frontend/pages/AgentDetailsPage'
import HireAgentPage from './frontend/pages/HireAgentPage'
import AgentDashboardPage from './frontend/pages/AgentDashboardPage'
import RegisterAgentPage from './frontend/pages/RegisterAgentPage'
import AdminDashboardPage from './frontend/pages/AdminDashboardPage'
import AdminVerificationPage from './frontend/pages/AdminVerificationPage'
import SignInPage from './frontend/pages/SignInPage'
import SignUpPage from './frontend/pages/SignUpPage'
import { ProtectedRoute } from './frontend/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/explore/:id" element={<AgentDetailsPage />} />
      <Route path="/hire/:id" element={<ProtectedRoute><HireAgentPage /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><AgentDashboardPage /></ProtectedRoute>} />
      <Route path="/register-agent" element={<ProtectedRoute><RegisterAgentPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route
        path="/admin/verification"
        element={<AdminVerificationPage />}
      />
    </Routes>
  )
}

export default App
