
import { Routes, Route } from 'react-router-dom'

import LandingPage from './frontend/pages/LandingPage'
import ExplorePage from './frontend/pages/ExplorePage'
import AgentDetailsPage from './frontend/pages/AgentDetailsPage'
import HireAgentPage from './frontend/pages/HireAgentPage'
import AgentDashboardPage from './frontend/pages/AgentDashboardPage'
import RegisterAgentPage from './frontend/pages/RegisterAgentPage'
import AdminDashboardPage from './frontend/pages/AdminDashboardPage'
import AdminVerificationPage from './frontend/pages/AdminVerificationPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/explore/:id" element={<AgentDetailsPage />} />
      <Route path="/hire/:id" element={<HireAgentPage />} />

      <Route path="/dashboard" element={<AgentDashboardPage />} />
      <Route path="/register-agent" element={<RegisterAgentPage />} />

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
