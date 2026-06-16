import type { FastifyInstance } from "fastify";
import { handleLinearWebhook } from "../handlers/linear.js";
import { verifyLinearSignature } from "../lib/verify-linear-signature.js";

interface LinearWebhookBody {
  action: string;
  type: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export async function linearRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LinearWebhookBody }>(
    "/linear",
    {
      preHandler: async (request, reply) => {
        const secret = process.env.LINEAR_WEBHOOK_SECRET;
        if (!secret) {
          request.log.error("LINEAR_WEBHOOK_SECRET is not set; rejecting POST");
          return reply.status(503).send({ error: "Webhook not configured" });
        }

        const rawBody = (request as { rawBody?: Buffer }).rawBody;
        const sig = request.headers["linear-signature"];
        const sigStr = Array.isArray(sig) ? sig[0] : sig;

        if (!rawBody || !verifyLinearSignature(rawBody, sigStr, secret)) {
          request.log.warn(
            { hasBody: Boolean(rawBody), hasSig: Boolean(sigStr) },
            "Rejected Linear webhook — invalid signature",
          );
          return reply.status(401).send({ error: "Invalid signature" });
        }
      },
    },
    (request, reply) => {
      const payload = request.body;

      // Respond immediately to avoid Linear webhook timeouts
      void reply.status(200).send({ received: true });

      // Fire-and-forget async processing
      handleLinearWebhook(payload, request.log).catch((err: unknown) => {
        request.log.error(err, "Failed to process Linear webhook");
      });
    }
  );
}
