
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUp } from 'lucide-react'

import Navbar from '../../frontend/components/Layout/Navbar'
import Hero from '../../frontend/components/Hero'
import ExploreAgents from '../../frontend/components/ExploreAgents'
import HowItWorks from '../../frontend/components/HowItWorks'
import ForAgents from '../../frontend/components/ForAgents'
import AgentCollaboration from '../../frontend/components/AgentCollaboration'
import PaymentInfrastructure from '../../frontend/components/PaymentInfrastructure'
import TrustReputation from '../../frontend/components/TrustReputation'
import Footer from '../../frontend/components/Layout/Footer'

const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div>
      <Navbar />

      <main className="min-h-screen w-full overflow-hidden bg-[#FAFAF6]">
        <Hero />
        <ExploreAgents />
        <HowItWorks />
        <ForAgents />
        <AgentCollaboration />
        <PaymentInfrastructure />
        <TrustReputation />
      </main>

      <Footer />

      {/* BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            whileHover={{ y: -5, scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            title="Back to top"
            className="fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#00A87D] text-white shadow-[0_8px_25px_rgba(0,168,125,0.3)] transition-colors hover:bg-[#008A66] sm:bottom-8 sm:right-8"
          >
            <ArrowUp size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandingPage
