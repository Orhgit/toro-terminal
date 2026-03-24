import type { FastifyBaseLogger } from "fastify";

interface LinearWebhookPayload {
  action: string;
  type: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Processes a Linear webhook event asynchronously.
 * Called fire-and-forget after the route has already returned 200.
 */
export async function handleLinearWebhook(
  payload: LinearWebhookPayload,
  log: FastifyBaseLogger
): Promise<void> {
  log.info(
    { action: payload.action, type: payload.type },
    "Processing Linear webhook"
  );

  // TODO: Implement task-sync logic
  //  - Match Linear issue to a property in the DB
  //  - Update property status based on Linear state transitions
  //  - Trigger downstream notifications if needed
}
