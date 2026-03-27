import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health";
import { marketsRouter } from "./routes/markets";
import { ordersRouter } from "./routes/orders";
import { solanaRouter } from "./routes/solana";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "512kb" }));
  app.use(pinoHttp({ logger }));

  app.use("/health", healthRouter);
  app.use("/api/v1/markets", marketsRouter);
  app.use("/api/v1/orders", ordersRouter);
  app.use("/api/v1/solana", solanaRouter);

  app.use(errorHandler);
  return app;
}
