import "dotenv/config";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { linearRoutes } from "./routes/linear.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

// 1 MB body cap — Meta WhatsApp payloads are KB-sized; anything bigger is
// suspicious and a likely abuse vector (slow-loris / memory exhaustion).
const BODY_LIMIT_BYTES = 1024 * 1024;

const server = Fastify({
  logger: true,
  bodyLimit: BODY_LIMIT_BYTES,
  connectionTimeout: 30_000,
  keepAliveTimeout: 5_000,
});

// Capture raw request body alongside the parsed JSON so HMAC verification
// can hash the exact bytes Meta / Linear signed. Without this, JSON.stringify
// of the parsed body would differ from the wire bytes and verification fails.
server.addContentTypeParser(
  "application/json",
  { parseAs: "buffer" },
  (req, body, done) => {
    (req as { rawBody?: Buffer }).rawBody = body as Buffer;
    if ((body as Buffer).length === 0) {
      done(null, {});
      return;
    }
    try {
      const json = JSON.parse((body as Buffer).toString("utf8"));
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  },
);

async function bootstrap(): Promise<void> {
  // Sensible default security headers (CSP relaxed since we serve no HTML).
  await server.register(helmet, { contentSecurityPolicy: false });

  // 100 req/min/IP across all routes. Webhook providers (Meta, Linear) send
  // far below this in normal operation; tight enough to stop trivial abuse.
  await server.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await server.register(linearRoutes, { prefix: "/webhooks" });
  await server.register(whatsappRoutes, { prefix: "/webhooks" });

  server.get("/health", async () => ({ status: "ok" }));
}

async function start(): Promise<void> {
  const port = Number(process.env.PORT) || 4002;
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await bootstrap();
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
