# Solana prediction market backend

TypeScript **Node.js** service for a **prediction market** stack: **Solana RPC + Anchor program hooks**, **PostgreSQL** via **Prisma**, an off-chain **central limit order book (CLOB)** with **price–time priority**, and **REST APIs** meant for a web UI (Next.js, etc.).

This repository is a **backend template**. Replace the stub Anchor **IDL** and **PDA seeds** with the output of your deployed program (`anchor idl build`).

## Features

- **Smart contract integration**: `@solana/web3.js` + `@coral-xyz/anchor` `Program` loaded from `idl/prediction_market.json`; helpers to build **unsigned** versioned transactions for wallet signing.
- **UI integration**: JSON REST under `/api/v1/*`, CORS driven by `CORS_ORIGINS`, Helmet, structured logging (`pino`).
- **Database**: Prisma models for `Market`, `Order`, `Trade`, optional `OnChainSettlement` record-keeping.
- **Order book**: Off-chain matching (same outcome leg); aggregated depth snapshots for charts and ladders.
- **Ops**: Health check hitting DB + Solana slot; optional `ADMIN_SECRET` for sensitive routes.

## Quick layout

| Path | Role |
|------|------|
| `src/solana/` | RPC connection, Anchor program factory, PDA example, unsigned tx builder |
| `src/services/` | Markets, orders, matcher, order book aggregation |
| `src/api/` | Express app, routes, middleware |
| `prisma/schema.prisma` | PostgreSQL schema |
| `idl/prediction_market.json` | **Replace** with your real IDL |

## Environment

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string  
- `PREDICTION_MARKET_PROGRAM_ID` — deployed program id (base58)  
- `SOLANA_RPC_URL` or `SOLANA_CLUSTER` — RPC endpoint  

Optional:

- `SOLANA_AUTHORITY_SECRET_KEY` — base58 or JSON byte array; only if the server must sign transactions (most UIs sign in the browser).  
- `ADMIN_SECRET` — if set, `POST /api/v1/markets` and `POST /api/v1/markets/:id/resolve` require header `x-admin-secret`.  
- `CORS_ORIGINS` — comma-separated allowed browser origins.

## API (for the UI)

Base URL: `http://localhost:4000` (or your `PORT`).

- `GET /health` — DB + Solana slot sanity check  
- `GET /api/v1/markets` — list markets (`?status=ACTIVE` optional)  
- `POST /api/v1/markets` — create market (see admin note above)  
- `GET /api/v1/markets/:slugOrId` — market by **slug** or internal **id**  
- `GET /api/v1/markets/:slugOrId/orderbook?leg=YES|NO` — aggregated bids/asks  
- `GET /api/v1/markets/:slugOrId/trades` — recent trades (`?take=100`)  
- `POST /api/v1/orders` — place limit order (body includes `size` as **decimal string** for JSON safety)  
- `DELETE /api/v1/orders/:id` — cancel (`ownerPubkey` in JSON body or `?owner=` query)  
- `GET /api/v1/orders?owner=<pubkey>&marketId=&status=`  
- `POST /api/v1/solana/prepared/place-order` — returns `{ transactionBase64 }` for wallet `signAndSend`  
- `GET /api/v1/solana/on-chain-market/:address` — best-effort Anchor account fetch  

### Example: place off-chain order

```json
POST /api/v1/orders
{
  "marketId": "<cuid>",
  "ownerPubkey": "<base58>",
  "leg": "YES",
  "side": "BID",
  "priceBps": 6500,
  "size": "1000000"
}
```

`priceBps` is **0–10000** (10000 = 100%). `size` is in your chosen collateral smallest unit (e.g. USDC micro-units or lamports), consistent across the book.

### Example: UI flow for on-chain instruction

1. UI calls `POST /api/v1/solana/prepared/place-order` with `feePayer`, `market`, `user`, flags, `priceBps`, `size`.  
2. Deserialize `transactionBase64` with `@solana/web3.js` `VersionedTransaction.deserialize`.  
3. Wallet signs and submits (or sends to your relayer).  
4. After confirmation, optionally sync state: index logs in a worker or let the UI call your REST endpoints to reconcile.

Adjust **accounts** in `src/solana/settlement.ts` when your real program requires vaults, token accounts, or remaining accounts.

## Order matching rules

- Books are **per market** and **per leg** (`YES` / `NO`).  
- **BID** matches resting **ASK** on the same leg when `askPrice <= bidPrice`; **ASK** matches **BID** when `bidPrice >= askPrice`.  
- **Price–time priority**: best price first; at the same price, older order first.  
- **Maker** is always the resting order; **trade price** is the maker’s price.  

Cross-leg parity (YES at \(p\) vs NO at \(1-p\)) is **not** auto-combined here; you can add a conversion layer or a second matching pass if your product needs it.

## Scripts (after you install dependencies)

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Wire your program

1. Deploy your Anchor program and run `anchor idl build -o idl/prediction_market.json` (or copy the generated JSON).  
2. Set `PREDICTION_MARKET_PROGRAM_ID` in `.env`.  
3. Align `src/solana/pda.ts` seeds and `buildUnsignedPlaceOnChainOrderTx` **accounts** with your instruction definitions.  
4. Replace stub **discriminators** in the checked-in IDL — the sample file uses placeholders and will **not** match a real deployment until updated.

## Security notes

- Treat `SOLANA_AUTHORITY_SECRET_KEY` like a hot wallet: minimal SOL, rotate, use KMS or signing service in production.  
- Without `ADMIN_SECRET`, market **create** and **resolve** are open to anyone who can reach the API — use the secret or terminate TLS at a gateway with auth.  
- Validate and rate-limit `ownerPubkey` and order placement in production (this template trusts the declared pubkey).

## Contact Information

- Telegram: https://t.me/DevCutup
- Twitter: https://x.com/devcutup
