import type { FastifyInstance, FastifyRequest } from "fastify";
import { handleLinearWebhook } from "../handlers/linear.js";

interface LinearWebhookBody {
  action: string;
  type: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export async function linearRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/linear",
    (request: FastifyRequest<{ Body: LinearWebhookBody }>, reply) => {
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
