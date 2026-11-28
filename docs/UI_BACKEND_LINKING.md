# MandateFlow UI–Backend Linking Guide

## Purpose and audit summary

This guide describes how the current React UI should connect to the current Express backend, from account creation through agent selection and task offers. It distinguishes working backend endpoints from proposed endpoints so the UI does not call functionality that does not exist yet.

The frontend is a Vite/React prototype. Its account forms are placeholders, agent/task records are primarily kept in `localStorage`, and it includes sample agents and dashboard metrics. The backend has working account, wallet-linking, agent profile, marketplace, and mandate-draft APIs. There is no frontend API client yet, no task or offer backend, and the HSP client is not called by the mandate routes.

The Solidity contracts described in the README have not been written. This guide treats the current app as an off-chain marketplace and workflow. HSP is intended to handle settlement through its existing payment infrastructure; do not represent an unwritten MandateFlow contract as deployed, or assume HSP itself supplies escrow or work verification.

## Current state by feature

| Feature | Frontend | Backend | Link status / discrepancy |
|---|---|---|---|
| Sign up | `SignUpPage` collects full name, username, password, and confirmation; submit is a placeholder. Email input is disabled. | `POST /api/v1/auth/register` requires `email`, `password` (10–128 chars), and `displayName`. No username field. | Not linked. The UI form cannot satisfy the API until email is enabled and username is removed, made optional, or added to the backend. Frontend currently permits 8-character passwords; backend requires 10. |
| Sign in | `SignInPage` accepts username and password; submit is a placeholder. | `POST /api/v1/auth/login` accepts email and password. | Not linked. Change the UI identifier to email or implement username support in the backend. |
| Routing/auth state | Sign-in and sign-up components exist, but `src/App.tsx` does not register `/sign-in` or `/sign-up`. Protected-route handling is absent. | Auth routes exist; protected routes require a bearer session token. | Add routes and a shared auth provider/guard. Current dashboard, register-agent, and admin pages are reachable without authentication. |
| User profile | No connected profile screen. | `GET /api/v1/auth/me` returns the current user and linked wallets. There is no profile `PATCH`, wallet unlink endpoint, or user role field. | Partial. Use `/auth/me` to hydrate the account; profile editing and admin roles need backend work. |
| Wallet linking | No wallet connector or signing flow is wired in the UI. Frontend dependencies do not include a wallet SDK. | `POST /api/v1/auth/wallet/nonce` and `/verify` link an EOA using a short-lived, single-use signed message. | Not linked. Add a wallet connector/signing library and wallet UI. Current verification supports EOAs; contract wallets need ERC-1271 verification. |
| Agent registration | `RegisterAgentPage` saves to `localStorage`. Fields include specialty, framework, price model, endpoint, docs URL, capabilities, and an image data URL. | `POST /api/v1/agents` accepts profile, service description, capabilities, pricing, optional `endpointUrl` and URL `avatarUrl`. It creates agents as `draft` and undiscoverable. | Not linked. Field mapping is needed; free pricing is unsupported; framework/docs fields have no backend fields; data-URL images fail URL validation; chain ID is required but absent from the UI. |
| Agent moderation | Admin pages use browser storage and statuses `Pending Verification`, `Active`, `Rejected`. | Agents use `draft`, `active`, `suspended`, `archived`. There are no admin roles or moderation endpoints; owners can activate/suspend/archive their own agents. | Discrepant and insecure as an admin workflow. The current admin page is local-only and is not protected by backend authorization. Decide whether owners self-publish or add authenticated admin moderation before linking it. |
| Agent dashboard | Uses sample agents, tasks, earnings, ratings and local hiring requests; local custom events refresh browser storage. | `GET /api/v1/users/me/agents` lists owned agents; agent PATCH/status endpoints update profile and status. No task, earnings, or reputation endpoints. | Agent profile management can be linked. Task/reputation/earnings widgets must remain explicitly demo/empty until APIs exist. |
| Marketplace | `ExplorePage` merges static sample agents with locally registered agents and filters in the browser. Details page reads the same local data. | Public `GET /api/v1/marketplace/agents` supports search/filter/sort/page; `GET /categories`; `GET /agents/:agentId` returns only active, discoverable agents. | Not linked. Replace storage/demo merge for real records with API data. Keep sample agents clearly labeled and never submit them to hire or payment APIs. |
| Hire/task request | `HireAgentPage` saves a local hiring request with title, description, requirements, numeric budget, currency, deadline, and `Pending` status. Dashboard can accept/reject it locally. | No task or offer model/routes exist. `POST /api/v1/mandates` creates a draft using only an agent ID and payer wallet; optional `taskId` is not checked against a task or offer. | Not linked. A hiring request is not yet a task offer, and local acceptance is not a backend decision. Build task/offer APIs before wiring these interactions. |
| Mandates | No payment/mandate screen or wallet signature flow is connected. | Authenticated draft create/list/detail endpoints exist. Drafts return `paymentReady: false`; no authorize, execute, revoke, or receipt routes. | Partial backend only. Never show a draft as paid, authorized, escrowed, or settled. |
| HSP | No HSP client in browser (which is correct for API keys). | `HspClient` has provisional register/get/observe/chains methods but is not called by mandate services. | Not integrated. Current client types/routes have not been verified against the DoraHacks guide supplied by the user; see [HSP boundary](#hsp-integration-and-the-contract-boundary). |
| Contracts | README describes possible `AgentRegistry`, `WorkReceiptRegistry`, and `ReputationRegistry`. | No `contracts/` workspace or deployed MandateFlow contract exists. | Planned only. No UI should claim an agent, task, or work receipt is on-chain yet. |

## Local development connection

The backend defaults to port `5000`; the Vite app normally runs on `5173`. Configure the frontend with a public API base URL:

```dotenv
# frontend .env.local
VITE_API_URL=http://localhost:5000
```

Configure the backend CORS origin to the exact UI origin:

```dotenv
# backend .env
CLIENT_ORIGIN=http://localhost:5173
```

The backend exposes `/health` (not under `/api/v1`). API requests use the `/api/v1` prefix. The current `vite.config.ts` has no development proxy; call the full `VITE_API_URL` origin or add a Vite proxy consistently. Never put `HSP_API_KEY`, wallet private keys, or other server credentials in `VITE_*` variables.

## Frontend API client conventions

Add a small client in `src/frontend/services/api.ts` and typed module services (auth, agents, marketplace, tasks, mandates). It should:

1. Prefix paths with `import.meta.env.VITE_API_URL`.
2. Send `Content-Type: application/json` for JSON bodies.
3. Attach `Authorization: Bearer <session token>` to protected requests.
4. Parse JSON errors: validation errors may be `{ error, details }`; application errors use `{ error }`.
5. Preserve HTTP status so the UI can distinguish `400` validation, `401` session, `403` permission, `404` unavailable/not found, `409` conflict, and `5xx` service failures.
6. Expose loading, empty, and error states instead of silently falling back to local demo records.

The backend returns a bearer token that expires after seven days. It does not currently issue an HttpOnly cookie or refresh token. For the first integration, keep auth state in a central provider and avoid spreading the token through component/local storage. If reload-persistent login is required, add a deliberate secure cookie/refresh design to the backend before persisting bearer credentials in browser storage.

## Existing API contracts

### Account creation and sign-in

`POST /api/v1/auth/register`

```json
{
  "email": "alice@example.com",
  "password": "at-least-10-characters",
  "displayName": "Alice Example"
}
```

Returns `201` with `{ "user": { "id", "email", "displayName", "createdAt" }, "token", "expiresAt" }`.

`POST /api/v1/auth/login` takes `{ "email", "password" }` and returns the same session shape. `GET /api/v1/auth/me` requires the bearer token and returns `{ "user": { ...profile, "wallets": [] } }`. `POST /api/v1/auth/logout` requires the bearer token and returns `204`.

UI work: enable email in sign-up, map `fullName` to `displayName`, resolve the username mismatch, raise the client password minimum to 10, then add `/sign-up` and `/sign-in` routes to `App.tsx`.

### Wallet linking

1. Authenticated UI calls `POST /api/v1/auth/wallet/nonce` with `{ "address": "0x…", "chainId": 133 }` (or the chosen supported chain).
2. The wallet signs the returned exact `message` as an EIP-191 personal message.
3. UI sends `{ "nonce": "…", "signature": "0x…" }` to `POST /api/v1/auth/wallet/verify`.
4. UI refreshes `GET /api/v1/auth/me` and displays the linked verified wallet.

Do not collect a seed phrase or private key. Chain/token support is not yet controlled by a trusted backend chain registry; do not let user-entered chain IDs become payment authorization policy.

### Agent creation and management

`POST /api/v1/agents` requires a session and accepts:

```json
{
  "name": "Research Assistant",
  "description": "Structured market research.",
  "category": "research",
  "capabilities": ["market-research", "report-writing"],
  "serviceDescription": "Produces research reports from defined briefs.",
  "pricing": {
    "model": "per-task",
    "amount": "10.25",
    "token": "USDC",
    "chainId": 133
  },
  "endpointUrl": "https://agent.example/api"
}
```

`agentId` and `ownerId` are assigned by the backend; never send `ownerId`. The returned agent is `draft` and undiscoverable. Use `GET /api/v1/users/me/agents?page=1&limit=20`, `PATCH /api/v1/agents/:agentId`, and `PATCH /api/v1/agents/:agentId/status` for current owner operations. Only valid status transitions are accepted.

Recommended UI mapping before sending:

| UI field | Backend field / handling |
|---|---|
| `name` | `name` |
| `description` | `description` |
| `specialty` | Combine with service details into `serviceDescription`; backend has no `specialty` field. |
| Category labels such as `Data Analysis` | Normalize to lowercase slug such as `data-analysis`; backend rejects spaces and uppercase in category/capability values. |
| Capability labels such as `Smart Contract Development` | Normalize to `smart-contract-development`. |
| `Fixed Price` / `Hourly` | Map to `fixed` / `hourly`. The backend also accepts `per-task`. |
| Free pricing | Not supported by current backend validation. Hide/disable it or add a documented zero-price model on both sides. |
| Price | Send an exact decimal string; do not convert through JavaScript `Number`. |
| Token and chain | UI currently has no chain selector. Supply values from trusted backend configuration, not arbitrary text. |
| Endpoint | `endpointUrl` |
| Documentation URL | No backend field; add it to the model/API or keep it out of persisted agent profile for now. |
| Framework | No backend field; add it to the model/API or omit it. |
| Uploaded image data URL | `avatarUrl` requires a URL. Add an upload/storage service and send its URL, or use the built-in category image only in the UI. |
| `Pending Verification` | Backend creation is `draft`/`unverified`. No admin-review API exists. Do not equate this with an admin-accepted state. |

Use the returned `agentId` (UUID) for routes and React record identity, not the current locally generated `agent-${Date.now()}` value or a Mongo `_id`.

### Marketplace and detail views

`GET /api/v1/marketplace/agents` supports `search`, `category`, `capability`, `chainId`, `token`, `priceMin`, `priceMax`, `sort`, `page`, and `limit`. Price filters/sorts require both token and chain. `GET /api/v1/marketplace/categories` supplies available categories. `GET /api/v1/agents/:agentId` returns a public detail only when the agent is active and discoverable.

The marketplace returns `agentId`, profile/service fields, pricing, status and timestamps. Public projections omit `ownerId` and `endpointUrl`. The UI currently expects `id`, `specialty`, `image`, `skills`, `verified`, and formatted `price`; map these in a frontend adapter and treat absent ratings/tasks/reputation as unavailable, not as real zero-history evidence. Remove or visibly label hard-coded demo agents so they cannot be mistaken for backend listings.

## Task request and offers: required backend work

The existing hire screen describes a useful request form, but today it only writes a `Pending` record to `localStorage`. There is no `/tasks` or `/offers` route, schema, authorization rule, negotiation state machine, notification, or agent-side offer submission endpoint. Dashboard accept/reject buttons only mutate local storage.

Implement a task/offer module before connecting those buttons. A minimal first version could use:

| Proposed endpoint | Purpose | Status |
|---|---|---|
| `POST /api/v1/tasks` | Submit title, brief, requirements, exact max budget, token/chain, deadline, and target agent or capability filters. | Not implemented |
| `GET /api/v1/tasks` | List tasks visible to the requester or assigned/eligible agents. | Not implemented |
| `GET /api/v1/tasks/:taskId` | Read a task after party/eligibility authorization. | Not implemented |
| `POST /api/v1/tasks/:taskId/offers` | An authorized provider agent submits exact price, token/chain, delivery estimate, terms, and expiry. | Not implemented |
| `GET /api/v1/tasks/:taskId/offers` | Requester compares offers for their task. | Not implemented |
| `PATCH /api/v1/offers/:offerId` | Requester accepts/rejects; provider may withdraw or submit a separately versioned counter-offer. | Not implemented |

Suggested persisted records:

- **Task:** immutable `taskId`, requester user, optional requester agent, requested agent/capability, title, brief, requirements, max budget as decimal string, token address/symbol, chain ID, deadline, status, selected offer ID, timestamps.
- **Offer:** immutable `offerId`, task ID, provider agent and owner, exact offered amount, token/chain, estimated completion, terms, expiration, revision/parent offer, status, timestamps.
- **Task states:** `OPEN`, `OFFER_SELECTED`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `DISPUTED` (final names/transitions should be agreed before implementation).
- **Offer states:** `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `SUPERSEDED`.

Enforce ownership and offer/task consistency in services. Only the requester can accept an offer, only an agent owner can submit on behalf of that agent, and accepting one offer must atomically select it and close or invalidate competing offers. Use exact decimal strings/base units; do not use `Number(budget)` as the persisted payment amount.

Once an offer is accepted, create the mandate from that accepted offer’s exact amount/token/chain and task ID. Current `POST /api/v1/mandates` copies the agent’s default list price and does not validate its optional `taskId`; it is therefore not yet the correct endpoint for an accepted quote.

## End-to-end linking sequence

1. **Sign up:** UI posts email, password, and display name; store the returned user/session in the auth provider and navigate only after success.
2. **Sign in / restore session:** use email/password; call `/auth/me` when the app starts if a session token is available. Add protected-route guards for dashboard, agent registration, and account actions.
3. **Connect wallet:** connect an EVM wallet in the browser, request a backend nonce, ask the wallet to sign the exact challenge, verify it, and refresh `/auth/me`. A connected wallet address alone is not verified.
4. **Register agent:** map the UI form to the backend schema, POST it with the bearer token, keep the returned `agentId`, and show `draft` status. Agent API credentials and agent wallet linking are not implemented.
5. **Publish/manage agent:** owner updates profile/status using agent endpoints. Decide whether owner self-activation is acceptable; current backend has no admin moderation or role system.
6. **Explore/select:** query marketplace pages/filters from the API and fetch details by `agentId`. Keep demo content separate from real records.
7. **Create task and offers:** first implement the proposed task/offer APIs above, then replace `localStorage` request persistence and local dashboard accept/reject with those APIs.
8. **Accept offer:** backend atomically records selected offer, price, and task. This accepted offer becomes the source of truth for a payment request.
9. **Prepare payment:** currently only an application DRAFT can be created; it is not ready for signing. Do not show a payment as authorized/settled until the HSP steps below are implemented and verified.
10. **Work delivery and reputation:** task delivery/evidence verification/reputation APIs and on-chain records are not implemented. Keep them out of success claims until the relevant backend and any chosen contract are built.

## HSP integration and the contract boundary

The current backend HSP files are `backend/src/services/hsp/hsp.client.ts` and `hsp.types.ts`. They contain a provisional Coordinator REST wrapper and provisional HSP v1 TypeScript shapes. The client exposes registration, lookup, observation, and chain lookup methods; **no current route calls it**. `HSP_COORDINATOR_URL` and `HSP_API_KEY` are optional backend-only settings. Never send the API key to the browser.

The guide URL supplied for HSP is [DoraHacks Agentic Payment Guide](https://dorahacks.io/hackathon/hskchainseoul/agentic-payment-guide). It could not be fetched by the available browser tool during this review, so the current wrapper’s exact endpoints and mandate types remain unverified. Treat the existing wrapper as a scaffold, not a working HSP integration. Before wiring payment:

1. Confirm the DoraHacks/HSP guide’s current Cart Mandate and Payment Mandate schemas, wallet signing domain, gateway submission, supported chain/token addresses and decimals, status/retry semantics, and receipt verification procedure.
2. Update the adapter/types against that source and run a sandbox contract/smoke flow.
3. Add API operations for preparing an HSP-compatible mandate, accepting the user’s external wallet signature, submitting it to HSP, tracking settlement, and verifying receipts. The backend must never sign on behalf of the payer.
4. Store the returned HSP/payment references and map provider statuses explicitly. Never mark `VERIFIED` from a browser claim or transaction hash alone.
5. Keep the mandate associated with the accepted task offer; enforce idempotency and party access checks across retries/callbacks.

No custom MandateFlow contract exists yet. HSP/Gateway may provide the settlement path, but that does not create MandateFlow escrow, task completion proofs, agent registry, reputation registry, or conditional release. Decide separately whether any of those need a contract after confirming HSP’s capabilities. A normal UI↔API integration can proceed for accounts, agent profiles, discovery, and later task/offer records without pretending those records are on-chain.

## Recommended link order

1. Reconcile the signup/signin forms and register their routes.
2. Add the shared API client, auth provider, and route guards.
3. Link wallet challenge/sign/verify UI.
4. Replace agent `localStorage` registration/listing with the agent APIs and resolve the field mismatches above.
5. Replace marketplace demo/local data with marketplace APIs.
6. Implement task and offer backend modules, then connect hire/dashboard flows.
7. Review the supplied HSP guide, correct the adapter, and only then build the authorization/settlement UI.
8. Decide which reputation/work receipts need contracts; write and review contracts before showing on-chain claims.
