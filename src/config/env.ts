import { config as loadEnv } from "dotenv";
import { z } from "zod";
import path from "path";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SOLANA_CLUSTER: z.enum(["mainnet-beta", "devnet", "testnet", "custom"]).default("devnet"),
  SOLANA_RPC_URL: z.string().url().optional(),
  PREDICTION_MARKET_PROGRAM_ID: z.string().min(1),
  PREDICTION_MARKET_IDL_PATH: z.string().optional(),
  SOLANA_AUTHORITY_SECRET_KEY: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  ADMIN_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const msg = parsed.error.flatten().fieldErrors;
  console.error("Invalid environment:", msg);
  throw new Error("Environment validation failed");
}

const e = parsed.data;

export const env = {
  nodeEnv: e.NODE_ENV,
  port: e.PORT,
  logLevel: e.LOG_LEVEL,
  databaseUrl: e.DATABASE_URL,
  solanaCluster: e.SOLANA_CLUSTER,
  solanaRpcUrl:
    e.SOLANA_RPC_URL ??
    (e.SOLANA_CLUSTER === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : e.SOLANA_CLUSTER === "testnet"
        ? "https://api.testnet.solana.com"
        : "https://api.devnet.solana.com"),
  predictionMarketProgramId: e.PREDICTION_MARKET_PROGRAM_ID,
  predictionMarketIdlPath: e.PREDICTION_MARKET_IDL_PATH
    ? path.resolve(e.PREDICTION_MARKET_IDL_PATH)
    : path.resolve(process.cwd(), "idl", "prediction_market.json"),
  solanaAuthoritySecretKey: e.SOLANA_AUTHORITY_SECRET_KEY,
  corsOrigins: e.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? ["http://localhost:3000"],
  adminSecret: e.ADMIN_SECRET,
} as const;
