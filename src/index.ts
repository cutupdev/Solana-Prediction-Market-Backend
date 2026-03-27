import { createApp } from "./api/app";
import { env } from "./config/env";
import { connectDb, disconnectDb } from "./db/prisma";
import { logger } from "./lib/logger";

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, "HTTP server listening");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    server.close(() => void 0);
    await disconnectDb().catch((e) => logger.error({ err: e }, "DB disconnect failed"));
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((e) => {
  logger.error({ err: e }, "Fatal startup error");
  process.exit(1);
});
