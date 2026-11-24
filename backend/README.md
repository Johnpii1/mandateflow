# MandateFlow API

Node.js, Express, TypeScript and MongoDB API for the MandateFlow application.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB (local instance or hosted MongoDB URI)

## Setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Update `.env` with a MongoDB URI and a strong random JWT secret (at least 32 characters). Add administrator wallet addresses to `ADMIN_WALLETS` as a comma-separated list. Never commit a real `.env` file.

## Run locally

```powershell
npm run dev
```

The API defaults to `http://localhost:5000`. Check `GET /api/health`.

## API overview

- `POST /api/auth/nonce` — issue a short-lived wallet sign-in challenge.
- `POST /api/auth/verify` — recover and verify the EIP-191 signature; returns a JWT.
- `GET /api/auth/me` — current authenticated account.
- `GET /api/agents` — approved marketplace agents.
- `GET /api/agents/mine` — agents owned by the connected account.
- `POST /api/agents` — submit an agent for admin review.
- `GET /api/agents/admin/review?status=Pending%20Verification` — admin review queue.
- `PATCH /api/agents/:id/review` — approve or reject a pending agent.
- `POST /api/requests` — create a hiring request for an active agent.
- `GET /api/requests/sent` — requests created by the current account.
- `GET /api/requests/inbox` — requests for agents owned by the current account.
- `PATCH /api/requests/:id/respond` — accept or decline as the agent owner.
- `POST /api/requests/:id/submit-work` — submit work as the assigned agent owner.
- `GET /api/requests/:id/submission` — read a submission as requester or agent owner.
- `PATCH /api/requests/:id/review-work` — approve work or request changes as requester.
- `POST /api/payments/intent` — create a payment record for an accepted request.
- `PATCH /api/payments/:id/transaction` — attach a transaction hash submitted by the payer.
- `GET /api/payments/mine` — payment records created by the current account.

Protected endpoints require `Authorization: Bearer <token>`.

## Security and payment notes

- Wallet login uses a random, five-minute nonce and EIP-191 message-signature recovery. A client-supplied wallet address alone is never treated as authentication.
- Admin access is granted only to wallet addresses configured in the server's `ADMIN_WALLETS` environment variable.
- Agent and request ownership is checked by the API on every protected operation.
- Agent images are represented by `imageUrl`; this API does not accept or persist base64 image payloads. Add an object-storage upload service before wiring uploaded image files into registration.
- Payment endpoints currently create a local payment intent record and store a transaction hash. They do **not** call HSP, validate an on-chain receipt, transfer tokens, or hold funds.
- HSP integration must follow the official HSP mandate, signature, observe and receipt-verification protocol. HSP is zero-custody; do not describe this API as escrow.
- Testnet chain ID 133 is the default development target; chain ID 177 is mainnet. Use testnet first and verify the official token configuration before enabling real transfers.
