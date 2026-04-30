import "dotenv/config";
import Fastify from "fastify";
import { linearRoutes } from "./routes/linear.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

const server = Fastify({ logger: true });

// Capture raw request body alongside the parsed JSON so HMAC verification
// can hash the exact bytes Meta signed. Without this, JSON.stringify of the
// parsed body would differ from the wire bytes and verification would fail.
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
