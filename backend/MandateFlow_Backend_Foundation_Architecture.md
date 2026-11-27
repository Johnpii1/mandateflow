# MandateFlow Backend Foundation Architecture

**Purpose:** A practical implementation blueprint for the first six
backend foundations: database configuration, user authentication, agent
identity, agent management APIs, marketplace discovery, and payment
mandates.

**Recommended stack:** Node.js, TypeScript, Express, MongoDB/Mongoose,
Zod, and a dedicated HSP/blockchain integration layer. Use the current
official HSP documentation as the source of truth for mandate schemas,
signing, execution, settlement, and receipt verification.

> Core principle: the backend coordinates the application, but must not
> become the authority that can unilaterally spend a user's funds.
> Payment authorization must follow the wallet/HSP authorization model
> and any required on-chain enforcement.

------------------------------------------------------------------------

## 1. Overall architecture

MandateFlow has three main layers:

1.  **Frontend (React):** account UI, wallet connection, agent
    marketplace, task/payment screens, mandate review and transaction
    status.
2.  **Backend (Express):** authentication, business rules, agent and
    marketplace APIs, mandate preparation, HSP integration, receipt
    processing and database access.
3.  **Payment/blockchain layer:** wallet signatures, HSP authorization
    and settlement, HSK Chain transactions, and MandateFlow smart
    contracts where they provide distinct on-chain functionality.

MongoDB and the blockchain are separate dependencies of the backend.
MongoDB stores application records; it is not the source of truth for
on-chain settlement.

### Request flow

``` text
React frontend
   | HTTPS + session/token
   v
Express routes
   v
Authentication + validation middleware
   v
Controller (HTTP input/output)
   v
Service (business rules)
   |                         |
   v                         v
Mongoose models              HSP / blockchain adapter
   |                         |
   v                         v
MongoDB                   HSP / HSK Chain
```

Routes should not contain database queries or complex business logic.
Controllers should be thin. Services own business rules. Models define
persistence and indexes. External integrations belong behind adapters.

## 2. Recommended folder structure

Build this incrementally; do not create empty files for every future
feature at once.

``` text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── cors.ts
│   ├── common/
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── errorHandler.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts
│   │   │   ├── validate.ts
│   │   │   └── rateLimit.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── utils/
│   │       ├── asyncHandler.ts
│   │       └── pagination.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.validation.ts
│   │   ├── agents/
│   │   │   ├── agent.model.ts
│   │   │   ├── agent.routes.ts
│   │   │   ├── agent.controller.ts
│   │   │   ├── agent.service.ts
│   │   │   ├── agent.validation.ts
│   │   │   └── agent.types.ts
│   │   ├── marketplace/
│   │   │   ├── marketplace.routes.ts
│   │   │   ├── marketplace.controller.ts
│   │   │   ├── marketplace.service.ts
│   │   │   └── marketplace.validation.ts
│   │   └── mandates/
│   │       ├── mandate.model.ts
│   │       ├── mandate.routes.ts
│   │       ├── mandate.controller.ts
│   │       ├── mandate.service.ts
│   │       ├── mandate.validation.ts
│   │       ├── mandate.types.ts
│   │       └── mandate-status.ts
│   ├── services/
│   │   ├── blockchain/
│   │   │   ├── chain.config.ts
│   │   │   └── wallet-verification.service.ts
│   │   └── hsp/
│   │       ├── hsp.client.ts
│   │       └── hsp.types.ts
│   └── routes/
│       └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

This is a **modular monolith**: one deployable backend with clear
feature boundaries. It is easier to build than microservices and can be
split later if scale or team structure requires it.

------------------------------------------------------------------------

## 3. Foundation 1 --- Database connection and configuration

### Purpose

Centralize environment configuration and establish one reusable MongoDB
connection. MongoDB stores users, agent profiles, marketplace metadata,
mandate records and payment status. It does not prove that a blockchain
transaction settled.

### Files and responsibilities

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `src/config/env.ts`                 Read and validate environment
                                      variables with Zod

  `src/config/database.ts`            Connect to MongoDB using Mongoose

  `src/server.ts`                     Await database connection before
                                      listening

  `src/app.ts`                        Configure Express middleware and
                                      mount routes

  `.env`                              Local secrets and connection
                                      strings; never commit

  `.env.example`                      Required variable names with safe
                                      placeholders

  `.gitignore`                        Exclude `.env`, `node_modules` and
                                      build output
  -----------------------------------------------------------------------

Example `.env.example`:

``` dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mandateflow
SESSION_SECRET=replace_with_a_long_random_secret
```

Use a managed MongoDB URI in deployment. Store production secrets in the
hosting provider's secret manager, not in Git.

### How they connect

``` text
.env -> config/env.ts -> config/database.ts
                              |
                              v
                         server.ts
                              |
                    connect successfully
                              |
                              v
                           app.ts
```

`env.ts` should validate required values and export a typed config
object. `database.ts` should export `connectDatabase()`. `server.ts`
should load config, await the connection, then start Express. Handle
graceful shutdown on `SIGINT` and `SIGTERM`.

### Completion criteria

-   Server does not accept requests before required database connection
    succeeds.
-   Missing/invalid `MONGODB_URI` causes a clear startup failure.
-   Credentials are never logged or committed.
-   A health endpoint reports API and database availability without
    leaking internals.

------------------------------------------------------------------------

## 4. Foundation 2 --- User model and authentication

### Account identity versus wallet identity

A **user account** identifies a person within MandateFlow. It owns their
profile, agents, marketplace activity and settings.

A **wallet** identifies a blockchain account capable of signing messages
and authorizing transactions. Connecting a wallet is separate from
creating an application account. A user can explore the marketplace
before connecting a wallet, but payment-related actions require the
appropriate verified wallet.

Recommended initial approach: email/password account plus optional
wallet linking. Social login can be added later. For wallet
authentication, use a signed nonce challenge and verify it server-side;
follow SIWE/EIP-4361 conventions where appropriate.

### Files and responsibilities

  -------------------------------------------------------------------------
  File                                  Responsibility
  ------------------------------------- -----------------------------------
  `modules/users/user.model.ts`         User schema, references and indexes

  `modules/users/user.service.ts`       Create, retrieve and update user
                                        records

  `modules/users/user.controller.ts`    HTTP handlers for profile
                                        operations

  `modules/users/user.routes.ts`        Profile endpoints

  `modules/users/user.validation.ts`    Validate profile inputs

  `modules/auth/auth.routes.ts`         Register, login, logout, nonce and
                                        wallet verification routes

  `modules/auth/auth.controller.ts`     Authentication HTTP handlers

  `modules/auth/auth.service.ts`        Password/session/token and wallet
                                        challenge logic

  `modules/auth/auth.validation.ts`     Validate auth inputs

  `common/middleware/authenticate.ts`   Authenticate requests and attach
                                        user identity

  `common/types/express.d.ts`           Type the authenticated user on
                                        Express requests
  -------------------------------------------------------------------------

### Suggested User document

``` text
User
- _id
- email (optional if wallet-only login is supported)
- passwordHash (only if password auth is used)
- displayName
- avatarUrl
- wallets[]
    - address
    - chainId
    - isPrimary
    - verifiedAt
- authProviders[]
- role
- status
- createdAt
- updatedAt
```

Store only password hashes, never plaintext passwords. Use a modern
password-hashing algorithm such as Argon2id. Normalize email addresses
and enforce uniqueness when present. Normalize EVM addresses
consistently. Never store wallet private keys or seed phrases.

### Wallet-linking flow

1.  Authenticated user requests a wallet-link nonce.
2.  Backend generates a cryptographically random, short-lived,
    single-use nonce and associates it with the user and purpose.
3.  Frontend asks the wallet to sign a structured message containing
    domain, address, chain ID, nonce and time fields.
4.  Backend verifies the signature and all message fields.
5.  Backend atomically consumes the nonce and links the verified
    address.
6.  Backend records when and on which chain the wallet was verified.

A signature proves control of an address for the signed message. It does
not give the backend permission to spend funds. Smart-contract wallets
may require contract-aware signature verification such as ERC-1271.

### Suggested endpoints

  -------------------------------------------------------------------------------------------
  Method            Endpoint                              Access            Purpose
  ----------------- ------------------------------------- ----------------- -----------------
  POST              `/api/v1/auth/register`               Public            Create account

  POST              `/api/v1/auth/login`                  Public            Authenticate

  POST              `/api/v1/auth/logout`                 Authenticated     End session

  GET               `/api/v1/auth/me`                     Authenticated     Current identity

  POST              `/api/v1/auth/wallet/nonce`           Authenticated     Create wallet
                                                                            challenge

  POST              `/api/v1/auth/wallet/verify`          Authenticated     Verify/link
                                                                            wallet

  GET               `/api/v1/users/me`                    Authenticated     Get profile

  PATCH             `/api/v1/users/me`                    Authenticated     Update profile

  DELETE            `/api/v1/users/me/wallets/:address`   Authenticated     Unlink wallet,
                                                                            subject to
                                                                            safeguards
  -------------------------------------------------------------------------------------------

### How files connect

``` text
auth.routes -> validation -> auth.controller -> auth.service -> user.model -> MongoDB
Protected route -> authenticate middleware -> req.user -> feature service
```

The `auth` module proves identity. The `users` module manages the user
resource. Keep these responsibilities separate.

### Completion criteria

Users can register/login; protected routes reject anonymous requests;
wallets can only be linked after server-side signature verification;
nonces are single-use and expire; users cannot access another user's
profile or wallet links.

------------------------------------------------------------------------

## 5. Foundation 3 --- Agent model and agent identity

### What is an agent?

An agent is a software actor that provides a service, requests work or
performs tasks. It is not simply another human account.

Keep four concepts separate:

-   **Owner:** human or organization accountable for the agent.
-   **Agent ID:** stable MandateFlow identifier.
-   **Agent wallet:** optional blockchain address associated with the
    agent.
-   **Agent API credential:** authenticates programmatic API calls; it
    is not a wallet private key.

### Files and responsibilities

  --------------------------------------------------------------------------
  File                                   Responsibility
  -------------------------------------- -----------------------------------
  `modules/agents/agent.model.ts`        Agent schema and indexes

  `modules/agents/agent.types.ts`        TypeScript types and enums

  `modules/agents/agent.validation.ts`   Validate agent inputs

  `modules/agents/agent.service.ts`      Agent business rules and ownership
                                         checks

  `modules/agents/agent.controller.ts`   HTTP handlers

  `modules/agents/agent.routes.ts`       Agent endpoints

  `common/middleware/authenticate.ts`    Authenticate the owner
  --------------------------------------------------------------------------

### Suggested Agent document

``` text
Agent
- _id
- ownerId                 // reference to User
- name
- slug
- description
- avatarUrl
- category
- capabilities[]
- serviceDescription
- pricing
    - model               // fixed, hourly, per-task, etc.
    - amount
    - token
    - chainId
- walletAddress (optional)
- endpointUrl (optional)
- status                  // draft, active, suspended, archived
- verificationStatus
- metadataUri (optional)
- isDiscoverable
- createdAt
- updatedAt
```

An agent can be listed before it is payment-enabled. Require a verified
wallet/payment identity before payment-related activity. `ownerId`
references the user who registered it.

### Agent identity and credentials

-   Generate an immutable agent ID at creation.
-   If agents call APIs programmatically, issue revocable and rotatable
    API credentials.
-   Store only a secure hash of long-lived API secrets where practical;
    show a newly created secret once.
-   Rate-limit credentials and audit their use.
-   Do not treat an agent name, URL or wallet address alone as proof of
    identity.
-   If associating a wallet, verify control with a signed challenge and
    require owner authorization.

### Relationship

``` text
User (1) ---------------- (many) Agent
  _id                         ownerId
  email                       agentId
  wallets                     name
                              capabilities
                              status
                              walletAddress
```

Start with one owner per agent. If team/organization ownership is later
required, introduce organizations and memberships rather than
overloading `ownerId`.

### Completion criteria

An authenticated user can register an agent; every agent has an
immutable ID and owner; owners alone can manage their agents;
credentials can be rotated/revoked; wallet association is optional
initially and verified when used.

------------------------------------------------------------------------

## 6. Foundation 4 --- Agent registration and management APIs

The Agent model defines what an agent is. The Agent API defines how
users create, view and manage agents.

### Files affected

-   `modules/agents/agent.routes.ts`
-   `modules/agents/agent.controller.ts`
-   `modules/agents/agent.service.ts`
-   `modules/agents/agent.validation.ts`
-   `modules/agents/agent.model.ts`
-   `common/middleware/authenticate.ts`

### Suggested endpoints

  -------------------------------------------------------------------------------------------------------------------------
  Method            Endpoint                                              Access                 Purpose
  ----------------- ----------------------------------------------------- ---------------------- --------------------------
  POST              `/api/v1/agents`                                      Authenticated          Register agent

  GET               `/api/v1/agents`                                      Public/authenticated   List discoverable agents

  GET               `/api/v1/agents/:agentId`                             Public/authenticated   Agent details

  GET               `/api/v1/users/me/agents`                             Authenticated          List owned agents

  PATCH             `/api/v1/agents/:agentId`                             Owner/authorized       Update profile

  PATCH             `/api/v1/agents/:agentId/status`                      Owner/authorized       Activate/suspend/archive

  POST              `/api/v1/agents/:agentId/credentials`                 Owner/authorized       Issue/rotate credential

  DELETE            `/api/v1/agents/:agentId/credentials/:credentialId`   Owner/authorized       Revoke credential

  POST              `/api/v1/agents/:agentId/wallet/nonce`                Owner/authorized       Start wallet verification

  POST              `/api/v1/agents/:agentId/wallet/verify`               Owner/authorized       Verify wallet
  -------------------------------------------------------------------------------------------------------------------------

### Registration flow

``` text
User signs in
   -> frontend submits agent profile
   -> POST /api/v1/agents
   -> authenticate middleware identifies user
   -> validation checks input
   -> agent controller calls agent service
   -> service applies rules and sets ownerId from req.user
   -> agent model saves document
   -> API returns safe public representation
```

Never trust an `ownerId` supplied in the request body. Derive ownership
from the authenticated identity. This prevents a user from registering
or modifying agents under another person's identity.

Example request:

``` json
{
  "name": "Research Assistant",
  "description": "An agent that performs structured market research.",
  "category": "research",
  "capabilities": ["market-research", "report-writing"],
  "serviceDescription": "Produces research reports from defined briefs.",
  "pricing": {
    "model": "per-task",
    "amount": "10",
    "token": "USDC",
    "chainId": 177
  }
}
```

The example is illustrative; validate token address, decimals and chain
configuration against trusted network configuration. Store monetary
values as exact decimal strings or integer base units, never JavaScript
floating-point values.

### Layer responsibilities

-   **Route:** URL, method and middleware.
-   **Validation:** body, params and query validation.
-   **Controller:** HTTP status and response; calls service.
-   **Service:** ownership checks, business rules and persistence
    orchestration.
-   **Model:** schema, references, timestamps and indexes.

### Completion criteria

Users can create/manage their own agents; public responses omit private
fields; lists support pagination; invalid capabilities/status/pricing
are rejected; API credentials are never returned in ordinary agent
responses.

------------------------------------------------------------------------

## 7. Foundation 5 --- Marketplace functionality

### Purpose

The marketplace makes eligible agents discoverable so users can compare
providers and select one for work.

Registration creates an agent profile. Marketplace functionality
publishes and searches eligible profiles. Task assignment, negotiation,
escrow and work verification should eventually live in their own modules
rather than turning the marketplace service into a catch-all.

### Files affected

-   `modules/marketplace/marketplace.routes.ts`
-   `modules/marketplace/marketplace.controller.ts`
-   `modules/marketplace/marketplace.service.ts`
-   `modules/marketplace/marketplace.validation.ts`
-   Reads from `modules/agents/agent.model.ts`
-   May read safe public owner information from
    `modules/users/user.model.ts`

### Initial capabilities

1.  Browse active agents.
2.  Search by name, description or service.
3.  Filter by category and capability.
4.  Filter by supported chain/token and price range.
5.  Sort by newest or price.
6.  View public agent profile and service terms.
7.  Select an agent and submit a task request when the task module is
    available.

Show the basis for reputation/rating. Distinguish verified completed
work from self-reported claims.

### Suggested endpoints

  ---------------------------------------------------------------------------------------------
  Method            Endpoint                                Access            Purpose
  ----------------- --------------------------------------- ----------------- -----------------
  GET               `/api/v1/marketplace/agents`            Public            Browse agents

  GET               `/api/v1/marketplace/agents/:agentId`   Public            Listing details

  GET               `/api/v1/marketplace/categories`        Public            Categories

  GET               `/api/v1/marketplace/featured`          Public            Featured agents,
                                                                              if supported
  ---------------------------------------------------------------------------------------------

Example:

``` text
GET /api/v1/marketplace/agents?category=research&capability=report-writing&chainId=177&page=1&limit=20&sort=newest
```

Only return active and discoverable agents. Validate filters and cap
maximum page size. Use a public projection that excludes private owner
data, credentials and internal fields.

### Data and indexes

The first version can query the Agent collection directly. Add
`isDiscoverable` and `publishedAt` to the Agent schema if
draft/published listings are needed.

Potential indexes, based on actual query patterns: - `status` +
`isDiscoverable` - `category` - `capabilities` - `publishedAt` - text
index over approved searchable fields

Do not add indexes indiscriminately; they have write and storage costs.

### Completion criteria

Users can search and filter agents; pagination works; private fields are
not exposed; suspended, archived or unpublished agents do not appear as
available.

------------------------------------------------------------------------

## 8. Foundation 6 --- Payment mandate module

### Purpose and boundary

The mandate module coordinates payment authorization for agent work. It
represents the requested payment, authorization state and settlement
evidence.

For the hackathon, integrate with the official HSP flow. Do not assume a
custom Solidity contract or a plain ERC-20 transfer is equivalent to
HSP's required mandate, signature, gateway, settlement and receipt
workflow.

Before implementing the HSP adapter, confirm the current official
specification for: - mandate schema and required fields; - signature
format and signing domain; - nonce and deadline rules; - supported
tokens and chain IDs; - authorization and execution APIs/SDK methods; -
settlement receipt format and verification procedure; - webhook or
polling behavior; - error and retry semantics.

Do not invent HSP endpoint names or cryptographic rules. Implement the
adapter from the current official documentation.

### Files affected

  ------------------------------------------------------------------------------------------
  File                                                   Responsibility
  ------------------------------------------------------ -----------------------------------
  `modules/mandates/mandate.model.ts`                    Persist mandate metadata and
                                                         lifecycle state

  `modules/mandates/mandate.types.ts`                    Internal types

  `modules/mandates/mandate-status.ts`                   Allowed states and transitions

  `modules/mandates/mandate.validation.ts`               Validate requests

  `modules/mandates/mandate.service.ts`                  Business rules and orchestration

  `modules/mandates/mandate.controller.ts`               HTTP handlers

  `modules/mandates/mandate.routes.ts`                   API endpoints

  `services/hsp/hsp.client.ts`                           HSP API/SDK adapter

  `services/hsp/hsp.types.ts`                            Types matching documented HSP
                                                         payloads/responses

  `services/blockchain/chain.config.ts`                  Chain and supported-token
                                                         configuration

  `services/blockchain/wallet-verification.service.ts`   Wallet signature verification,
                                                         where needed

  `agents/agent.model.ts` and `users/user.model.ts`      Resolve agent, payer and wallet
                                                         relationships
  ------------------------------------------------------------------------------------------

### Suggested Mandate document

``` text
Mandate
- _id
- mandateId
- payerUserId
- payerWallet
- agentId
- recipientWallet
- taskId (optional initially)
- chainId
- tokenAddress
- tokenSymbol (display metadata)
- amountBaseUnits       // exact integer string
- nonce
- deadline
- mandatePayload        // normalized non-secret fields
- mandateHash
- signatureStatus
- signatureReference   // no secrets
- executionStatus
- transactionHash
- hspReceiptReference
- verificationStatus
- failureCode
- createdAt
- updatedAt
```

Only persist a signature if the HSP specification and security
requirements call for it. Never store private keys, seed phrases or
wallet credentials. A database record is not proof that a mandate was
authorized or settled.

Token amounts must use exact base units. For example, 10 USDC is
represented in units according to the token's decimals; do not assume
the on-chain integer is `10`.

### Illustrative lifecycle

``` text
DRAFT
  -> PENDING_SIGNATURE
  -> AUTHORIZED
  -> SUBMITTED
  -> SETTLED
  -> VERIFIED
```

Possible exception/terminal states: `REJECTED`, `EXPIRED`, `REVOKED`,
`FAILED`, `VERIFICATION_FAILED`.

These are proposed MandateFlow application states, not claims about
HSP's exact status vocabulary. Map official HSP statuses explicitly. The
service must validate every state transition; a client must never be
able to set a mandate directly to `VERIFIED`.

### Business workflow

``` text
1. Agent/user requests payment
2. Backend checks task, payer, recipient and policy
3. Backend prepares mandate using official HSP schema
4. Frontend shows payer recipient, token, amount, chain and expiry
5. Payer signs through the required wallet flow
6. Authorization is submitted through the documented HSP flow
7. HSP-supported execution/settlement occurs
8. Transaction is observed
9. HSP receipt is retrieved and verified
10. Backend records verified result and notifies parties
```

The exact placement of wallet signing, gateway calls and transaction
submission must follow HSP documentation. This is the business
lifecycle, not an assumed API sequence.

### Suggested endpoints

  -----------------------------------------------------------------------------------------------
  Method            Endpoint                                  Access            Purpose
  ----------------- ----------------------------------------- ----------------- -----------------
  POST              `/api/v1/mandates`                        Authenticated     Create payment
                                                                                request/draft

  GET               `/api/v1/mandates/:mandateId`             Authorized        View mandate
                                                              parties           

  GET               `/api/v1/mandates`                        Authenticated     List relevant
                                                                                mandates

  POST              `/api/v1/mandates/:mandateId/authorize`   Payer             Submit
                                                                                authorization
                                                                                data per HSP flow

  POST              `/api/v1/mandates/:mandateId/execute`     Authorized        Initiate
                                                              workflow          execution if
                                                                                required by HSP

  POST              `/api/v1/mandates/:mandateId/revoke`      Payer             Request
                                                                                revocation where
                                                                                supported

  GET               `/api/v1/mandates/:mandateId/receipt`     Authorized        Retrieve
                                                              parties           settlement
                                                                                evidence
  -----------------------------------------------------------------------------------------------

If HSP supports webhooks, verify webhook signatures, reject replays and
make processing idempotent. If not, use controlled
polling/reconciliation.

### Idempotency and replay protection

-   Use idempotency keys for mandate creation/execution where
    appropriate.
-   Enforce unique mandate IDs and relevant payer/nonce/domain
    constraints.
-   Treat duplicate callbacks or transaction observations as the same
    event.
-   A frontend retry does not prove the previous transaction failed.
-   Confirm status through HSP/on-chain verification.

MongoDB uniqueness is useful application-level protection, but it cannot
replace cryptographic nonce and replay protection enforced by the
authorization/payment system.

### Policy checks

The backend can preflight: - payer is authenticated and wallet is
verified; - agent is active and eligible; - recipient is allowed by user
policy; - amount is within configured limits; - token and chain are
supported; - task/payment request is valid and not already paid.

But backend-only checks are not a secure spending boundary. Restrictions
that must survive backend compromise must be enforced by wallet
authorization, HSP or appropriate on-chain controls.

### Completion criteria

Mandate creation follows HSP schema; payer sees exact payment details
before signing; backend cannot sign for payer; execution follows HSP
flow; settlement is not marked verified from a frontend claim or
transaction hash alone; receipts are verified; duplicate requests do not
trigger duplicate processing; only authorized parties can access a
mandate.

------------------------------------------------------------------------

## 9. How the six foundations connect

``` text
DATABASE CONFIGURATION
  -> makes MongoDB available to models

USER + AUTHENTICATION
  -> identifies the human owner and verifies wallet control

AGENT MODEL + IDENTITY
  -> creates agents owned by authenticated users

AGENT MANAGEMENT API
  -> lets owners register, update and manage agents

MARKETPLACE
  -> makes eligible agents discoverable and selectable

PAYMENT MANDATE MODULE
  -> prepares, authorizes, executes and verifies payments via HSP
```

### Example end-to-end scenario

1.  Alice creates a MandateFlow account.
2.  Alice connects and verifies her wallet.
3.  Alice registers a research agent.
4.  Her agent is published in the marketplace.
5.  Bob discovers the agent and requests a research task.
6.  The parties agree on the service and price.
7.  MandateFlow prepares a payment mandate for Bob to review.
8.  Bob authorizes it through the required wallet/HSP flow.
9.  Payment settles through the HSP-supported process.
10. MandateFlow verifies the settlement receipt and updates the
    task/payment record.

A separate `tasks` and likely `offers` module will eventually be needed
for task creation, negotiation, delivery and work verification. Those
are outside the six foundations, but the mandate can contain an optional
`taskId` to integrate later.

------------------------------------------------------------------------

## 10. Shared engineering rules

### Separation of concerns

-   Routes define URL, method and middleware.
-   Validation checks request bodies, parameters and query strings.
-   Controllers handle HTTP input/output.
-   Services implement business rules and coordinate dependencies.
-   Models define persistence, references and indexes.
-   Adapters isolate HSP and blockchain RPC dependencies.

### Authorization

Authentication answers "Who is making this request?" Authorization
answers "May this identity perform this action on this resource?" Every
owner-specific operation must check ownership or explicit permission. An
unguessable MongoDB ID is not access control.

### Money and chain data

Use integer base units or exact decimal representations, never
JavaScript floating-point arithmetic for token amounts. Validate chain
IDs, token addresses and decimals against trusted configuration.

### Secrets and logging

-   Ignore `.env` in Git.
-   Commit `.env.example` only with placeholders.
-   Never store private keys or seed phrases.
-   Protect API credentials.
-   Redact authorization headers and sensitive payloads from logs.

### Errors and tests

Use a shared error class and centralized error handler. Return
predictable responses and appropriate HTTP statuses. Do not expose stack
traces in production.

Test: - unit: service rules, validation and state transitions; -
integration: routes, auth, authorization and database behavior; -
contract: MandateFlow Solidity contracts; - HSP: documented test/sandbox
facilities; - end-to-end: success, expiry, rejection, failure, retry and
duplicate callback paths.

------------------------------------------------------------------------

## 11. Implementation order and deliverables

  -----------------------------------------------------------------------
  Milestone               Build                   Deliverable
  ----------------------- ----------------------- -----------------------
  1                       Environment, Express    Server starts safely;
                          app, MongoDB connection health check works

  2                       User model and          Register/login and
                          authentication          protected `/auth/me`

  3                       Wallet verification     User proves wallet
                                                  ownership with one-time
                                                  signature

  4                       Agent model and         User creates an owned
                          identity                agent

  5                       Agent management APIs   CRUD, status management
                                                  and ownership tests

  6                       Marketplace             Public discovery,
                                                  filtering and
                                                  pagination

  7                       Mandate model and state Safe mandate draft and
                          machine                 lifecycle rules

  8                       HSP adapter             Integration based on
                                                  verified official docs

  9                       Payment lifecycle       Authorization,
                                                  settlement and receipt
                                                  verification

  10                      Security and end-to-end Demonstrable,
                          testing                 failure-tested payment
                                                  workflow
  -----------------------------------------------------------------------

### First implementation checkpoint

Start with only these files:

``` text
src/
├── app.ts
├── server.ts
└── config/
    ├── env.ts
    └── database.ts
```

Checkpoint is complete when: - environment variables are validated; -
MongoDB connects successfully; - Express starts only after database
initialization; - a health endpoint responds; - errors are handled
centrally; - secrets are excluded from Git.

Then implement authentication and user identity before agent
registration. Marketplace and payment features depend on these
foundations.

------------------------------------------------------------------------

## 12. Decisions to confirm before implementation

1.  **Sign-in:** email/password, social login, wallet-only, or
    combination? Recommended first version: email/password plus optional
    verified wallet linking.
2.  **Agent ownership:** one human owner initially, or shared
    organization ownership? Recommended: one owner initially.
3.  **Agent wallet:** optional at registration; required before payment
    activity.
4.  **Marketplace listing:** query Agent collection initially; add a
    separate Listing model only if agents need multiple independently
    managed offerings.
5.  **Payment custody:** non-custodial user authorization versus
    escrow/vault. Do not introduce custody unless required and properly
    designed.
6.  **HSP integration:** confirm exact mandate fields, signing format,
    APIs, execution path and receipt verification from current official
    documentation.
7.  **Task lifecycle:** add dedicated task/offer modules when
    marketplace-to-work workflows are built. Keep `taskId` optional in
    the mandate until then.

**Final recommendation:** Build MandateFlow as a modular
TypeScript/Express backend with MongoDB for application data, verified
wallet identity for blockchain actions, and a dedicated HSP adapter for
payment operations. Keep smart contracts focused on functionality that
genuinely needs on-chain verification or enforcement. This avoids
duplicating HSP's payment infrastructure while giving MandateFlow clear,
testable responsibilities.
