import "dotenv/config";
import Fastify from "fastify";
import { linearRoutes } from "./routes/linear.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

const server = Fastify({ logger: true });

server.register(linearRoutes, { prefix: "/webhooks" });
server.register(whatsappRoutes, { prefix: "/webhooks" });

server.get("/health", async () => ({ status: "ok" }));

async function start(): Promise<void> {
  const port = Number(process.env.PORT) || 4002;
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
