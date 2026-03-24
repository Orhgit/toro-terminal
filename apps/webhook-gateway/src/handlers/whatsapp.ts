import type { FastifyBaseLogger } from "fastify";
import { runPropertyPipeline } from "@repo/ai-core/orchestrator";
import { getSupabaseClient } from "@repo/database/client";
import { createMarketingTask } from "../services/linear.js";

// ============================================================
// Payload types
// ============================================================

interface WhatsappWebhookPayload {
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

interface WhatsappMessage {
  type: string;
  text?: { body?: string };
  image?: { id?: string; mime_type?: string; link?: string };
}

// ============================================================
// Payload helpers
// ============================================================

function extractMessageText(value: Record<string, unknown>): string | null {
  const messages = value["messages"] as WhatsappMessage[] | undefined;
  if (!messages?.length) return null;

  const textMsg = messages.find((m) => m.type === "text");
  return textMsg?.text?.body ?? null;
}

function extractImageUrls(value: Record<string, unknown>): string[] {
  const messages = value["messages"] as WhatsappMessage[] | undefined;
  if (!messages?.length) return [];

  return messages
    .filter((m) => m.type === "image" && m.image?.link)
    .map((m) => m.image!.link!);
}

// ============================================================
// Handler
// ============================================================

/**
 * Processes an incoming WhatsApp message asynchronously.
 * Called fire-and-forget after the route has already returned 200.
 *
 * Pipeline: message → AI extraction → DB insert → Linear task
 */
export async function handleWhatsappMessage(
  payload: WhatsappWebhookPayload,
  log: FastifyBaseLogger
): Promise<void> {
  const entries = payload.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes) {
      log.info(
        { entryId: entry.id, field: change.field },
        "Processing WhatsApp change"
      );

      const messageText = extractMessageText(change.value);
      if (!messageText) {
        log.info("No text message found in change, skipping");
        continue;
      }

      const imageUrls = extractImageUrls(change.value);

      // ── Step 1: Run AI pipeline ─────────────────────────
      let pipelineResult;
      try {
        pipelineResult = await runPropertyPipeline(messageText, imageUrls);
        log.info(
          { property: pipelineResult.property, hook: pipelineResult.copy.shortHook },
          "AI pipeline completed"
        );
      } catch (err) {
        log.error(err, "AI pipeline failed");
        continue;
      }

      // ── Step 2: Persist to Supabase ─────────────────────
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from("properties")
          .insert({
            owner_phone: pipelineResult.property.owner_phone,
            price_asked: pipelineResult.property.price_asked,
            status: pipelineResult.property.status,
          });

        if (error) {
          log.error({ error }, "Supabase insert failed");
        } else {
          log.info("Property saved to database");
        }
      } catch (err) {
        log.error(err, "Database operation failed");
      }

      // ── Step 3: Create Linear task for marketing team ───
      try {
        const task = await createMarketingTask(pipelineResult);
        log.info(
          { linearIssue: task.identifier, url: task.url },
          "Marketing task created in Linear"
        );
      } catch (err) {
        log.error(err, "Linear task creation failed");
      }
    }
  }
}
