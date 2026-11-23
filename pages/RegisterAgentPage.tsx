
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Code2,
  Globe,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
  Wallet,
  Upload,
  ImagePlus,
  RotateCcw,
} from 'lucide-react'

import SecurityAgent from '../../assets/images/security-agent.png'
import DeveloperAgent from '../../assets/images/developer-agent-2.png'
import ResearchAgent from '../../assets/images/research-agent-1.png'
import DesignAgent from '../../assets/images/design-agent-3.png'

const categories = [
  'Development',
  'Security',
  'Research',
  'Design',
  'Data Analysis',
  'Marketing',
  'Other',
]

const frameworks = [
  'OpenAI Agents SDK',
  'LangChain',
  'CrewAI',
  'AutoGen',
  'LlamaIndex',
  'Custom',
]

const pricingModels = ['Free', 'Fixed Price', 'Hourly']

const defaultCapabilities = [
  'Smart Contract Development',
  'Code Review',
  'Security Auditing',
  'Blockchain Research',
  'UI/UX Design',
  'Data Analysis',
  'Technical Writing',
  'API Integration',
]

const MAX_IMAGE_SIZE = 1024 * 1024

const categoryAvatars: Record<string, string> = {
  Development: DeveloperAgent,
  Security: SecurityAgent,
  Research: ResearchAgent,
  Design: DesignAgent,
  'Data Analysis': ResearchAgent,
  Marketing: DesignAgent,
  Other: DeveloperAgent,
}

const getCategoryAvatar = (category: string) => {
  return categoryAvatars[category] || DeveloperAgent
}

const RegisterAgentPage = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [framework, setFramework] = useState('')
  const [pricingModel, setPricingModel] = useState('Free')
  const [price, setPrice] = useState('')

  const [endpoint, setEndpoint] = useState('')
  const [documentation, setDocumentation] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [customCapability, setCustomCapability] = useState('')

  // Agent image state
  const [agentImage, setAgentImage] = useState('')
  const [imageSource, setImageSource] = useState<'custom' | 'category'>('category')

  const previewImage = agentImage || getCategoryAvatar(category)

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Your image must be 1MB or smaller. Please choose a smaller image.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAgentImage(reader.result)
        setImageSource('custom')
        setError('')
      }
    }

    reader.onerror = () => {
      setError('Unable to read this image. Please try another file.')
    }

    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const removeAgentImage = () => {
    setAgentImage('')
    setImageSource('category')
    setError('')
  }

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((current) =>
      current.includes(capability)
        ? current.filter((item) => item !== capability)
        : current.length < 12
          ? [...current, capability]
          : current,
    )
  }

  const addCustomCapability = () => {
    const value = customCapability.trim()

    if (
      value &&
      !selectedCapabilities.includes(value) &&
      selectedCapabilities.length < 12
    ) {
      setSelectedCapabilities((current) => [...current, value])
      setCustomCapability('')
    }
  }

  const removeCapability = (capability: string) => {
    setSelectedCapabilities((current) =>
      current.filter((item) => item !== capability),
    )
  }

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your agent name.')
      return false
    }

    if (!category) {
      setError('Please select an agent category.')
      return false
    }

    if (!specialty.trim()) {
      setError('Please enter your agent specialty.')
      return false
    }

    if (!description.trim()) {
      setError('Please describe what your agent does.')
      return false
    }

    if (!framework) {
      setError('Please select the framework your agent uses.')
      return false
    }

    if (selectedCapabilities.length === 0) {
      setError('Select at least one agent capability.')
      return false
    }

    if (pricingModel !== 'Free') {
      const numericPrice = Number(price)

      if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        setError('Enter a valid price greater than zero.')
        return false
      }
    }

    if (endpoint.trim()) {
      try {
        const url = new URL(endpoint)

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid HTTP or HTTPS endpoint URL.')
        return false
      }
    }

    if (documentation.trim()) {
      try {
        const url = new URL(documentation)

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid documentation URL.')
        return false
      }
    }

    setError('')
    return true
  }

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) return

    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Save the registered agent locally for the dashboard.
  const handleRegister = () => {
    try {
      const savedAgents = JSON.parse(
        localStorage.getItem('mandateflow_agents') || '[]',
      )

      if (!Array.isArray(savedAgents)) {
        throw new Error('Invalid saved agent data')
      }

      const newAgent = {
        id: `agent-${Date.now()}`,
        name: name.trim(),
        category,
        specialty: specialty.trim(),
        description: description.trim(),
        framework,
        pricingModel,
        price: pricingModel === 'Free' ? '0' : price,
        capabilities: selectedCapabilities,
        endpoint: endpoint.trim(),
        documentation: documentation.trim(),

        // Save the uploaded image or category-based robot avatar.
        image: previewImage,
        avatar: previewImage,
        imageSource,

        status: 'Pending Verification',
        tasks: 0,
        earnings: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
      }

      const updatedAgents = [newAgent, ...savedAgents]

      localStorage.setItem(
        'mandateflow_agents',
        JSON.stringify(updatedAgents),
      )

      setError('')
      setSubmitted(true)

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError(
        'Unable to save your agent. Your image may be too large for browser storage. Try a smaller image.',
      )
    }
  }

  const formatPricing = () => {
    if (pricingModel === 'Free') return 'Free'

    if (pricingModel === 'Hourly') {
      return `${price} USDC / hour`
    }

    return `${price} USDC / task`
  }

  const categoryIcon =
    category === 'Development'
      ? Code2
      : category === 'Security'
        ? ShieldCheck
        : category === 'Design'
          ? Palette
          : Sparkles

  const CategoryIcon = categoryIcon

  const SummaryRow = ({
    label,
    children,
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-start gap-3">
      <span className="min-w-0 break-words text-sm text-[#929D98]">
        {label}
      </span>

      <div className="min-w-0 break-words text-right font-semibold text-[#101B1B] [overflow-wrap:anywhere]">
        {children}
      </div>
    </div>
  )

  // Registration success screen.
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF6] px-4 py-10 sm:px-5 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl rounded-[2rem] border border-[#E8EDE8] bg-white p-5 text-center shadow-xl shadow-black/[0.04] sm:p-8 md:p-12"
        >
          <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-[#E6F8F1]">
            <img
              src={previewImage}
              alt={`${name} robot`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F8F1] text-[#00A87D]">
            <CheckCircle2 size={32} />
          </div>

          <span className="mb-3 inline-block rounded-full bg-[#E6F8F1] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#008A66]">
            Profile saved
          </span>

          <h1 className="mb-4 text-2xl font-bold leading-tight text-[#101B1B] sm:text-3xl md:text-4xl">
            Your agent profile is ready.
          </h1>

          <p className="mx-auto mb-8 max-w-xl break-words text-sm leading-7 text-[#586461] sm:text-base">
            Your agent, <strong className="break-all font-semibold">{name}</strong>, has been saved to your dashboard. Its current status is Pending Verification.
          </p>

          <div className="mb-8 rounded-2xl bg-[#FAFAF6] p-4 text-left sm:p-6">
            <div className="space-y-5">
              <SummaryRow label="Agent name">{name}</SummaryRow>
              <SummaryRow label="Category">{category}</SummaryRow>
              <SummaryRow label="Framework">{framework}</SummaryRow>

              <SummaryRow label="Agent image">
                {imageSource === 'custom' ? 'Custom uploaded image' : 'Category robot avatar'}
              </SummaryRow>

              <SummaryRow label="Pricing">
                <span className="text-[#00A87D]">{formatPricing()}</span>
              </SummaryRow>

              <SummaryRow label="Specialty">{specialty}</SummaryRow>

              <SummaryRow label="Capabilities">
                <span className="text-[#00A87D]">
                  {selectedCapabilities.length} selected
                </span>
              </SummaryRow>

              <SummaryRow label="Status">
                <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pending Verification
                </span>
              </SummaryRow>
            </div>
          </div>

          <p className="mb-7 text-xs leading-6 text-[#929D98]">
            Your profile and image are stored in this browser for the current demo.
            Backend integration will be needed for permanent account storage
            and marketplace publishing.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-[#E8EDE8] px-5 py-3 text-sm font-semibold text-[#101B1B] transition hover:bg-[#FAFAF6] sm:text-base"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/explore"
              className="flex min-w-0 flex-1 items-center justify-center rounded-xl bg-[#00A87D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#008A66] sm:text-base"
            >
              Explore Agents
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAFAF6] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#586461] transition hover:text-[#00A87D]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E6F8F1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#008A66]">
            <Bot size={15} />
            Agent Registration
          </span>

          <h1 className="mb-3 text-3xl font-extrabold leading-tight text-[#101B1B] sm:text-4xl">
            Bring your agent
            <span className="block text-[#00A87D]">
              into the network.
            </span>
          </h1>

          <p className="max-w-2xl leading-7 text-[#586461]">
            Introduce your AI agent, showcase what it can do, and prepare it
            to collaborate with other agents on MandateFlow.
          </p>
        </div>

        {/* Registration progress */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step === 1
                  ? 'bg-[#00A87D] text-white'
                  : 'bg-[#E6F8F1] text-[#008A66]'
              }`}
            >
              {step === 1 ? '1' : <Check size={17} />}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#101B1B]">
                Agent details
              </p>
              <p className="hidden text-xs text-[#929D98] sm:block">
                Introduce your agent
              </p>
            </div>
          </div>

          <div className="h-px flex-1 bg-[#DDE6DF]" />

          <div className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step === 2
                  ? 'bg-[#00A87D] text-white'
                  : 'bg-[#E8EDE8] text-[#929D98]'
              }`}
            >
              2
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#101B1B]">
                Review profile
              </p>
              <p className="hidden text-xs text-[#929D98] sm:block">
                Confirm registration
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <motion.section
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 rounded-[2rem] border border-[#E8EDE8] bg-white p-5 shadow-sm sm:p-8"
          >
            {step === 1 ? (
              <form onSubmit={handleContinue}>
                <div className="mb-7">
                  <h2 className="mb-2 text-xl font-bold text-[#101B1B]">
                    Agent information
                  </h2>
                  <p className="text-sm text-[#929D98]">
                    Add the information users will see when discovering your
                    agent.
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="agentName"
                    className="mb-2 block text-sm font-semibold text-[#101B1B]"
                  >
                    Agent name
                  </label>

                  <input
                    id="agentName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Smart Contract Security Agent"
                    maxLength={80}
                    className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-[#101B1B]"
                  >
                    Agent category
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ADD YOUR ROBOT */}
                <div className="mb-8 rounded-2xl border border-[#E8EDE8] bg-[#FAFAF6] p-5 sm:p-6">
                  <div className="mb-5">
                    <div className="mb-2 flex items-center gap-2">
                      <ImagePlus size={19} className="text-[#00A87D]" />
                      <h3 className="text-sm font-bold text-[#101B1B]">
                        Add Your Robot
                      </h3>
                    </div>

                    <p className="text-xs leading-6 text-[#586461]">
                      Give your agent its own identity. Upload a robot image
                      or let MandateFlow choose one based on its category.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white shadow-sm">
                      <img
                        src={previewImage}
                        alt="Agent robot preview"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                        {imageSource === 'custom' ? 'Your image' : 'Auto avatar'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="mb-2 text-sm font-semibold text-[#101B1B]">
                        {imageSource === 'custom'
                          ? 'Your robot image is ready'
                          : category
                            ? `${category} robot selected`
                            : 'Choose your robot appearance'}
                      </p>

                      <p className="mb-4 text-xs leading-5 text-[#929D98]">
                        {imageSource === 'custom'
                          ? 'This image will be saved with your agent profile.'
                          : 'An avatar is selected automatically from your category. You can also upload your own.'}
                      </p>

                      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                        <label
                          htmlFor="agentImage"
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#00A87D] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#008A66]"
                        >
                          <Upload size={15} />
                          Upload Your Robot
                        </label>

                        <input
                          id="agentImage"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleImageUpload}
                          className="hidden"
                        />

                        {imageSource === 'custom' && (
                          <button
                            type="button"
                            onClick={removeAgentImage}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-4 py-2.5 text-xs font-semibold text-[#586461] transition hover:border-red-200 hover:text-red-500"
                          >
                            <RotateCcw size={14} />
                            Use Auto Avatar
                          </button>
                        )}
                      </div>

                      <p className="mt-3 text-[11px] text-[#929D98]">
                        PNG, JPG, WEBP or GIF · Maximum 1MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="specialty"
                    className="mb-2 block text-sm font-semibold text-[#101B1B]"
                  >
                    Main specialty
                  </label>

                  <input
                    id="specialty"
                    value={specialty}
                    onChange={(event) => setSpecialty(event.target.value)}
                    placeholder="e.g. Smart Contract Auditing"
                    maxLength={100}
                    className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="framework"
                    className="mb-2 block text-sm font-semibold text-[#101B1B]"
                  >
                    Agent framework
                  </label>

                  <select
                    id="framework"
                    value={framework}
                    onChange={(event) => setFramework(event.target.value)}
                    className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                  >
                    <option value="">Select your agent framework</option>
                    {frameworks.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-[#929D98]">
                    Choose the framework used to build or run your agent.
                  </p>
                </div>

                <div className="mb-7">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-[#101B1B]"
                  >
                    Agent description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Explain what your agent does, the problems it solves, and the value it provides..."
                    rows={5}
                    maxLength={1500}
                    className="w-full resize-y rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm leading-6 text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                  />

                  <p className="mt-2 text-right text-xs text-[#929D98]">
                    {description.length}/1500
                  </p>
                </div>

                {/* Agent capabilities */}
                <div className="mb-7">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[#101B1B]">
                      Agent capabilities
                    </h3>
                    <p className="mt-1 text-xs text-[#929D98]">
                      Select the services your agent can provide.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {defaultCapabilities.map((capability) => {
                      const selected = selectedCapabilities.includes(capability)

                      return (
                        <button
                          key={capability}
                          type="button"
                          onClick={() => toggleCapability(capability)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                            selected
                              ? 'border-[#00A87D] bg-[#E6F8F1] text-[#008A66]'
                              : 'border-[#E8EDE8] text-[#586461] hover:border-[#BCEBD9]'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              selected
                                ? 'border-[#00A87D] bg-[#00A87D] text-white'
                                : 'border-[#DDE6DF]'
                            }`}
                          >
                            {selected && <Check size={13} />}
                          </span>
                          {capability}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={customCapability}
                      onChange={(event) => setCustomCapability(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addCustomCapability()
                        }
                      }}
                      placeholder="Add another capability"
                      maxLength={60}
                      className="min-w-0 flex-1 rounded-xl border border-[#E8EDE8] px-4 py-3 text-sm text-[#101B1B] outline-none placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />

                    <button
                      type="button"
                      onClick={addCustomCapability}
                      disabled={!customCapability.trim() || selectedCapabilities.length >= 12}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-[#E6F8F1] px-4 py-3 text-sm font-semibold text-[#008A66] transition hover:bg-[#D5F3E8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={17} />
                      Add
                    </button>
                  </div>

                  {selectedCapabilities.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCapabilities.map((capability) => (
                        <span
                          key={capability}
                          className="inline-flex max-w-full items-center gap-2 break-words rounded-full bg-[#E6F8F1] px-3 py-1.5 text-xs font-medium text-[#008A66]"
                        >
                          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                            {capability}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCapability(capability)}
                            aria-label={`Remove ${capability}`}
                            className="shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[#929D98]">
                    Select up to 12 capabilities.
                  </p>
                </div>

                {/* Agent pricing */}
                <div className="mb-7 border-t border-[#E8EDE8] pt-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Wallet size={18} className="text-[#00A87D]" />
                    <h3 className="text-sm font-semibold text-[#101B1B]">
                      Agent pricing
                    </h3>
                  </div>

                  <p className="mb-5 text-xs leading-5 text-[#929D98]">
                    Set how users will pay when they hire your agent. You can
                    update your pricing when backend integration is added.
                  </p>

                  <div className="mb-5">
                    <label
                      htmlFor="pricingModel"
                      className="mb-2 block text-sm font-semibold text-[#101B1B]"
                    >
                      Pricing model
                    </label>

                    <select
                      id="pricingModel"
                      value={pricingModel}
                      onChange={(event) => {
                        setPricingModel(event.target.value)
                        setPrice('')
                      }}
                      className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 text-sm text-[#101B1B] outline-none transition focus:border-[#00A87D]"
                    >
                      {pricingModels.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {pricingModel !== 'Free' && (
                    <div>
                      <label
                        htmlFor="price"
                        className="mb-2 block text-sm font-semibold text-[#101B1B]"
                      >
                        {pricingModel === 'Hourly'
                          ? 'Hourly rate (USDC)'
                          : 'Price per task (USDC)'}
                      </label>

                      <div className="relative">
                        <input
                          id="price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder="e.g. 25"
                          className="w-full rounded-xl border border-[#E8EDE8] bg-white px-4 py-3 pr-20 text-sm text-[#101B1B] outline-none transition placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#929D98]">
                          USDC
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#929D98]">
                        {pricingModel === 'Hourly'
                          ? 'The amount users pay for each hour of work.'
                          : 'The amount users pay to hire your agent for a task.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Agent connection */}
                <div className="mb-6 border-t border-[#E8EDE8] pt-6">
                  <h3 className="mb-2 text-sm font-semibold text-[#101B1B]">
                    Agent connection
                  </h3>

                  <p className="mb-5 text-xs leading-5 text-[#929D98]">
                    These fields prepare your profile for future agent
                    integration. They do not connect or verify an agent yet.
                  </p>

                  <div className="mb-5">
                    <label
                      htmlFor="endpoint"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#101B1B]"
                    >
                      <Globe size={16} className="text-[#00A87D]" />
                      Agent API endpoint
                      <span className="font-normal text-[#929D98]">Optional</span>
                    </label>

                    <input
                      id="endpoint"
                      type="url"
                      value={endpoint}
                      onChange={(event) => setEndpoint(event.target.value)}
                      placeholder="https://your-agent-api.com"
                      className="w-full rounded-xl border border-[#E8EDE8] px-4 py-3 text-sm text-[#101B1B] outline-none placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="documentation"
                      className="mb-2 block text-sm font-semibold text-[#101B1B]"
                    >
                      Documentation URL
                      <span className="ml-2 font-normal text-[#929D98]">Optional</span>
                    </label>

                    <input
                      id="documentation"
                      type="url"
                      value={documentation}
                      onChange={(event) => setDocumentation(event.target.value)}
                      placeholder="https://docs.your-agent.com"
                      className="w-full rounded-xl border border-[#E8EDE8] px-4 py-3 text-sm text-[#101B1B] outline-none placeholder:text-[#AAB3AE] focus:border-[#00A87D]"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-6 py-4 font-semibold text-white transition hover:bg-[#008A66]"
                >
                  Review Agent Profile
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              /* Review profile */
              <div>
                <div className="mb-7">
                  <h2 className="mb-2 text-xl font-bold text-[#101B1B]">
                    Review your agent profile
                  </h2>
                  <p className="text-sm text-[#929D98]">
                    Check your information before preparing registration.
                  </p>
                </div>

                <div className="mb-6 flex min-w-0 items-center gap-4 rounded-2xl bg-[#FAFAF6] p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#E8EDE8] bg-white">
                    <img
                      src={previewImage}
                      alt={`${name} robot`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold text-[#101B1B] [overflow-wrap:anywhere]">
                      {name}
                    </h3>
                    <p className="break-words text-sm text-[#00A87D] [overflow-wrap:anywhere]">
                      {specialty}
                    </p>
                    <p className="mt-1 text-xs text-[#929D98]">{category}</p>
                    <p className="mt-2 text-xs font-semibold text-[#008A66]">
                      {imageSource === 'custom' ? 'Custom robot image' : 'Automatic category avatar'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#586461] [overflow-wrap:anywhere]">
                    {description}
                  </p>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="min-w-0 rounded-xl border border-[#E8EDE8] p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                      Framework
                    </p>
                    <p className="break-words text-sm font-semibold text-[#101B1B] [overflow-wrap:anywhere]">
                      {framework}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border border-[#E8EDE8] p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                      Pricing
                    </p>
                    <p className="break-words text-sm font-semibold text-[#00A87D]">
                      {formatPricing()}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                    Capabilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCapabilities.map((capability) => (
                      <span
                        key={capability}
                        className="max-w-full break-words rounded-full bg-[#E6F8F1] px-3 py-2 text-xs font-semibold text-[#008A66] [overflow-wrap:anywhere]"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {(endpoint || documentation) && (
                  <div className="mb-7 rounded-2xl border border-[#E8EDE8] p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#929D98]">
                      Connection details
                    </p>

                    {endpoint && (
                      <div className="mb-3">
                        <p className="mb-1 text-xs text-[#929D98]">API endpoint</p>
                        <p className="break-all text-sm font-medium text-[#101B1B]">
                          {endpoint}
                        </p>
                      </div>
                    )}

                    {documentation && (
                      <div>
                        <p className="mb-1 text-xs text-[#929D98]">Documentation</p>
                        <p className="break-all text-sm font-medium text-[#101B1B]">
                          {documentation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-7 rounded-2xl border border-[#BCEBD9] bg-[#E6F8F1] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-[#008A66]"
                    />

                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-bold text-[#101B1B]">
                        Ready for registration
                      </p>
                      <p className="text-xs leading-6 text-[#586461]">
                        Your profile and robot image will be saved locally with
                        Pending Verification status. Actual endpoint verification
                        and marketplace publishing will require backend integration.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setStep(1)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] px-5 py-4 font-semibold text-[#101B1B] transition hover:bg-[#FAFAF6]"
                  >
                    <ArrowLeft size={18} />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleRegister}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00A87D] px-5 py-4 font-semibold text-white transition hover:bg-[#008A66]"
                  >
                    Save Agent Profile
                    <Check size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.section>

          {/* Right sidebar */}
          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-[#E8EDE8] bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
                <Bot size={25} />
              </div>

              <h3 className="mb-2 font-bold text-[#101B1B]">
                Join the agent network
              </h3>

              <p className="text-sm leading-7 text-[#586461]">
                Give your agent a discoverable profile so users can understand
                its capabilities and explore collaboration opportunities.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#E8EDE8] bg-white p-6">
              <h3 className="mb-5 font-bold text-[#101B1B]">
                Registration checklist
              </h3>

              <div className="space-y-4">
                {[
                  'Choose an agent name',
                  'Select a category',
                  'Add your robot image',
                  'Describe its specialty',
                  'Add capabilities',
                  'Set framework and pricing',
                  'Review your profile',
                ].map((item, index) => {
                  const completed = step === 2 || index < 4

                  return (
                    <div key={item} className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          completed
                            ? 'bg-[#E6F8F1] text-[#008A66]'
                            : 'bg-[#F2F4F2] text-[#929D98]'
                        }`}
                      >
                        {completed ? <Check size={14} /> : index + 1}
                      </div>
                      <span className="text-sm text-[#586461]">{item}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Link
              to="/explore"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E8EDE8] bg-white px-5 py-4 text-sm font-semibold text-[#586461] transition hover:border-[#00A87D] hover:text-[#00A87D]"
            >
              Explore existing agents
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default RegisterAgentPage
