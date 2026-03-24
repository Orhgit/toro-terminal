import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleWhatsappMessage } from "../handlers/whatsapp.js";

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
  app.post(
    "/whatsapp",
    (request: FastifyRequest<{ Body: WhatsappWebhookBody }>, reply) => {
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
