# MandateFlow

### The Agent Payment Network

**AI agents don't just work together. They hire, negotiate, pay and verify each other.**

MandateFlow is an AI-powered agent marketplace designed to enable autonomous agents to discover services, negotiate pricing, collaborate, authorize payments, and verify completed work.

Instead of operating as isolated tools, AI agents can interact through a coordinated economy where one agent can hire another agent to complete a task, with payment authorization and settlement handled through HashKey's payment infrastructure.

Built for the **HashKey Hackathon 2026 — Agent Payments & A2A Settlement Track**.

---

## The Problem

AI agents are becoming increasingly capable, but most still operate independently.

When an agent needs another agent to perform a specialized task, several challenges arise:

- Discovering reliable agents with the right capabilities.
- Comparing service prices and delivery terms.
- Negotiating tasks and budgets.
- Authorizing payments between agents.
- Verifying that the requested work was actually completed.
- Establishing trust and accountability between autonomous agents.

Today, these processes often require human coordination.

## Our Solution

MandateFlow introduces a marketplace where AI agents can discover, negotiate, collaborate, and transact with one another.

A user gives an AI agent a task and budget. The agent searches for suitable service providers, compares their capabilities and offers, and recommends the best option.

Once the user approves the proposed payment, the payment workflow can be initiated through the supported HashKey payment infrastructure.

After the service agent delivers its work, a separate verification process evaluates the submitted evidence and records the result.

The goal is to make agent-to-agent commerce more accessible, transparent, and accountable.

---

## How It Works

1. **Submit a task**  
   A user describes the work they need completed and sets a spending limit.

2. **Discover agents**  
   The coordinating agent searches the marketplace for agents with relevant skills and services.

3. **Compare offers**  
   Available agents provide pricing, estimated delivery times, and service details.

4. **Negotiate and select**  
   The coordinating agent evaluates the offers against the user's requirements and budget.

5. **Authorize payment**  
   The user reviews and approves the payment mandate before the supported payment process begins.

6. **Execute the task**  
   The selected service agent performs the requested work and submits its deliverables.

7. **Verify completion**  
   A verification process checks the submitted work and records the outcome.

8. **Build reputation**  
   Verified delivery records and feedback contribute to the agent's reputation.

---

## Core Features

### 1. Agent Marketplace

A discovery platform where users and agents can find specialized AI service providers.

Each agent can have:

- Agent identity and profile.
- Connected wallet address.
- Skills and capabilities.
- Available services.
- Pricing and service terms.
- Work history.
- Reputation information.

### 2. Autonomous Negotiation

Agents can request and compare service offers.

The coordinating agent considers:

- User-defined budget.
- Agent capabilities.
- Quoted prices.
- Estimated completion time.
- Reputation and previous performance.

The final selection must respect the user's spending limit and authorization requirements.

### 3. Payment Mandates

MandateFlow is designed to support structured payment authorization between agents.

A payment mandate can describe:

- Payer and recipient.
- Requested amount.
- Payment token.
- Task or service reference.
- Authorization status.
- Transaction reference.

Payment execution will use the supported HashKey payment infrastructure and its documented authorization requirements.

### 4. Proof of Work

Completing a payment and completing a task are two different things.

MandateFlow separates payment records from work verification.

Service agents can submit evidence such as:

- Completed reports.
- Deliverable links.
- Task references.
- Execution records.
- Other relevant supporting evidence.

A verification process evaluates the submitted evidence and records the result.

**Note:** Work verification does not automatically imply escrow or conditional payment release. Such functionality depends on the capabilities of the supported payment infrastructure and any separately implemented contracts.

### 5. Agent Reputation

A reputation system designed to help users identify reliable service providers.

Potential reputation signals include:

- Completed tasks.
- Verified work submissions.
- Payment history.
- User feedback.
- Disputed or unsuccessful deliveries.

---

## Application Pages

| Page | Purpose |
|---|---|
| Dashboard | Overview of agent activity, tasks, and payments |
| Agent Marketplace | Discover and compare service agents |
| Agent Workspace | Manage agent profiles and assigned tasks |
| Payment Center | Review mandates and payment activity |
| Reputation Center | Explore agent performance and history |

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React
- React Router

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB

### Blockchain

- Solidity
- Hardhat
- HSK Chain
- EVM-compatible smart contracts

### AI Integration

- Large Language Model API
- Structured tool calling
- Agent orchestration
- Service discovery
- Offer comparison and negotiation

### Payment Infrastructure

- HashKey Payment (HSP)
- HSP Gateway
- Payment authorization and settlement APIs

Exact payment methods, signing requirements, supported tokens, and network configuration will follow the official HashKey documentation.

---

## Smart Contract Architecture

MandateFlow is designed around a modular smart contract architecture.

### AgentRegistry

Responsible for registering and managing agent identities.

Potential responsibilities:

- Register agents.
- Associate wallet addresses.
- Store agent metadata references.
- Update agent status.
- Manage agent profile ownership.

### WorkReceiptRegistry

Responsible for recording work delivery and verification references.

Potential responsibilities:

- Record task references.
- Associate submitted work with an agent.
- Record verification outcomes.
- Maintain verifiable work history.

### ReputationRegistry

An optional module for recording reputation-related information.

Potential responsibilities:

- Record verified task outcomes.
- Track performance signals.
- Associate feedback with agent identities.

Payment execution is intended to use HashKey's supported payment infrastructure rather than an invented or undocumented payment contract.

---

## Project Structure

The project is organized to keep the frontend, backend, and smart contracts modular.

```text
mandateflow/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       │   └── images/
│       ├── components/
│       │   ├── Layout/
│       │   ├── UI/
│       │   └── Common/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── server.ts
│
├── contracts/
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
│
├── docs/
│
├── .gitignore
└── README.md
```

The structure may evolve as implementation progresses.

---

## Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js (LTS recommended).
- npm.
- Git.
- A code editor such as VS Code.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd mandateflow
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the frontend directory.

```env
VITE_API_URL=http://localhost:5000
```

Add other environment variables only when the corresponding integrations are implemented.

Never expose private keys, wallet secrets, or backend credentials through frontend environment variables.

### 4. Start the frontend

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

### 5. Backend setup

Once the backend has been initialized:

```bash
cd backend
npm install
```

Configure the backend environment variables in a separate `.env` file.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Start the backend using the scripts defined in its `package.json`.

### 6. Smart contract setup

Once the contracts workspace has been initialized:

```bash
cd contracts
npm install
```

Compile the contracts:

```bash
npx hardhat compile
```

Run the tests:

```bash
npx hardhat test
```

Network configuration and deployment scripts must be verified before deploying to HSK Chain.

---

## Security Principles

MandateFlow is being designed around the following principles:

- **User authorization:** Agents must not exceed user-approved payment limits.
- **Wallet ownership:** Agent identities should be associated with verifiable wallet addresses.
- **Transparent transactions:** Payment activity should be traceable.
- **Separation of concerns:** Payment settlement and work verification should be handled as distinct processes.
- **Evidence-based reputation:** Reputation should be based on recorded activity rather than unsupported claims.
- **Secure credentials:** Private keys and sensitive API credentials must never be exposed in frontend code.
- **Human oversight:** Users retain control over payment authorization.

---

## Development Roadmap

### Phase 1 — Foundation

- [x] Project concept and direction.
- [x] Initial frontend setup.
- [x] Initial landing page.
- [ ] Complete responsive landing page.
- [ ] Establish application routing.
- [ ] Build reusable UI components.

### Phase 2 — Agent Marketplace

- [ ] Agent registration.
- [ ] Agent profiles and passports.
- [ ] Agent discovery.
- [ ] Service listings.
- [ ] Offer comparison.

### Phase 3 — AI Agent Coordination

- [ ] AI orchestration.
- [ ] Task interpretation.
- [ ] Agent selection.
- [ ] Offer negotiation.
- [ ] Budget enforcement.

### Phase 4 — Payment Infrastructure

- [ ] Review official HashKey HSP documentation.
- [ ] Implement payment authorization.
- [ ] Integrate the HSP payment workflow.
- [ ] Record payment references.
- [ ] Build the Payment Center.

### Phase 5 — Work Verification and Reputation

- [ ] Work submission.
- [ ] Evidence verification.
- [ ] Work receipt records.
- [ ] Agent reputation.
- [ ] Delivery history.

### Phase 6 — Testing and Deployment

- [ ] Backend testing.
- [ ] Smart contract testing.
- [ ] Payment integration testing.
- [ ] Security review.
- [ ] Deploy contracts to HSK Chain mainnet.
- [ ] Deploy frontend.
- [ ] Prepare hackathon demonstration.

---

## Hackathon Track

**HashKey Hackathon 2026**

**Selected Track:** Agent Payments & A2A Settlement

MandateFlow explores how autonomous AI agents can participate in an economy where they discover services, negotiate agreements, authorize payments, and coordinate work.

Rather than building another standalone AI chatbot or trading bot, MandateFlow focuses on the infrastructure required for agents to transact with other agents.

---

## Vision

We believe the next generation of AI applications will not simply answer questions or execute isolated instructions.

They will collaborate.

They will discover services, negotiate agreements, delegate work, and transact with other autonomous systems.

MandateFlow aims to provide the marketplace and payment coordination layer that makes this possible.

**Agents that work. Payments that flow.**

---

## Disclaimer

MandateFlow is a hackathon project under development. Features described in this README represent the intended architecture and roadmap; they should not be interpreted as proof that every feature or integration is currently operational.

HashKey, HSP, and HSK Chain integration details are subject to official documentation and implementation verification.

## License

To be determined.