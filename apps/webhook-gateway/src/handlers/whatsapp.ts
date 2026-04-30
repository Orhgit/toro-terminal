import type { FastifyBaseLogger } from "fastify";
import { runPropertyPipeline } from "@repo/ai-core/orchestrator";
import { getSupabaseClient } from "@repo/database/client";
import { createMarketingTask } from "../services/linear.js";
import { findOrgByPhone } from "../lib/find-org-by-phone.js";

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

interface WhatsappMetadata {
  display_phone_number?: string;
  phone_number_id?: string;
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

function extractRecipientPhone(value: Record<string, unknown>): string | null {
  const meta = value["metadata"] as WhatsappMetadata | undefined;
  return meta?.display_phone_number ?? null;
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

      // ── Step 0: Resolve tenant by recipient phone ───────
      // Without an org, we cannot satisfy the NOT NULL on properties.organization_id.
      // Skip the message — better to drop a webhook than orphan data across tenants.
      let supabase;
      try {
        supabase = getSupabaseClient();
      } catch (err) {
        log.error(err, "Supabase not configured; skipping WhatsApp message");
        continue;
      }

      const recipientPhone = extractRecipientPhone(change.value);
      const org = await findOrgByPhone(supabase, recipientPhone);
      if (!org) {
        log.warn(
          { recipientPhone },
          "No organization matches recipient phone — skipping (multi-tenancy guard)",
        );
        continue;
      }

      const imageUrls = extractImageUrls(change.value);

      // ── Step 1: Run AI pipeline ─────────────────────────
      let pipelineResult;
      try {
        pipelineResult = await runPropertyPipeline(messageText, imageUrls);
        log.info(
          { property: pipelineResult.property, hook: pipelineResult.copy.shortHook, orgId: org.id },
          "AI pipeline completed"
        );
      } catch (err) {
        log.error(err, "AI pipeline failed");
        continue;
      }

      // ── Step 2: Persist to Supabase ─────────────────────
      try {
        const { error } = await supabase
          .from("properties")
          .insert({
            organization_id: org.id,
            owner_phone: pipelineResult.property.owner_phone,
            price_asked: pipelineResult.property.price_asked,
            status: pipelineResult.property.status,
          });

        if (error) {
          log.error({ error }, "Supabase insert failed");
          // Stop the pipeline here; don't create a Linear task for a property
          // that didn't persist (RIN-389: handler swallows DB errors).
          continue;
        }
        log.info({ orgId: org.id }, "Property saved to database");
      } catch (err) {
        log.error(err, "Database operation failed");
        continue;
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
