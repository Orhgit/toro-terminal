import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleWhatsappMessage } from "../handlers/whatsapp.js";
import { verifyMetaSignature } from "../lib/verify-meta-signature.js";

interface WhatsappVerifyQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

interface WhatsappWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: Record<string, unknown>;
      field: string;
    }>;
  }>;
  [key: string]: unknown;
}

export async function whatsappRoutes(app: FastifyInstance): Promise<void> {
  // Verification challenge — Meta sends a GET to confirm the endpoint
  app.get(
    "/whatsapp",
    async (request: FastifyRequest<{ Querystring: WhatsappVerifyQuery }>, reply) => {
      const mode = request.query["hub.mode"];
      const token = request.query["hub.verify_token"];
      const challenge = request.query["hub.challenge"];

      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

      if (mode === "subscribe" && token === verifyToken) {
        request.log.info("WhatsApp webhook verified");
        return reply.status(200).send(challenge);
      }

      return reply.status(403).send({ error: "Forbidden" });
    }
  );

  // Incoming messages — respond immediately, process async
  app.post<{ Body: WhatsappWebhookBody }>(
    "/whatsapp",
    {
      preHandler: async (request, reply) => {
        const appSecret = process.env.WHATSAPP_APP_SECRET;
        if (!appSecret) {
          // Fail closed: refuse to accept events when no secret is configured.
          // Otherwise an unconfigured instance would be wide open.
          request.log.error("WHATSAPP_APP_SECRET is not set; rejecting POST");
          return reply.status(503).send({ error: "Webhook not configured" });
        }

        const rawBody = (request as { rawBody?: Buffer }).rawBody;
        const signature = request.headers["x-hub-signature-256"];
        const sigStr = Array.isArray(signature) ? signature[0] : signature;

        if (!rawBody || !verifyMetaSignature(rawBody, sigStr, appSecret)) {
          request.log.warn(
            { hasBody: Boolean(rawBody), hasSig: Boolean(sigStr) },
            "Rejected WhatsApp webhook — invalid signature",
          );
          return reply.status(401).send({ error: "Invalid signature" });
        }
      },
    },
    (request, reply) => {
      const payload = request.body;

      // Respond immediately to satisfy Meta's <15 s timeout
      void reply.status(200).send({ received: true });

      // Fire-and-forget async processing
      handleWhatsappMessage(payload, request.log).catch((err: unknown) => {
        request.log.error(err, "Failed to process WhatsApp webhook");
      });
    }
  );
}
