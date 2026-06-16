import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components: TemplateComponent[];
}

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: Array<{ type: "text"; text: string }>;
}

export interface WhatsAppFreeformMessage {
  to: string;
  text: string;
  imageUrl?: string;
  previewUrl?: string;
}

export interface SendResult {
  messageId: string;
  status: "sent" | "queued" | "failed";
  timestamp: string;
}

// ============================================================
// Config
// ============================================================

const WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0";

function getConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  };
}

// ============================================================
// Two-Step Outbound — Meta compliant
// ============================================================

/**
 * Step 1: Send a pre-approved Meta template to open the 24h session.
 * Templates must be submitted and approved in Meta Business Manager first.
 * This is the ONLY way to initiate contact with a lead under Meta policy.
 */
export async function sendServiceFirst(
  phone: string,
  propertyCity: string,
  propertyHook: string
): Promise<SendResult> {
  const templateMessage: WhatsAppTemplateMessage = {
    to: normalizePhone(phone),
    templateName: "toro_property_alert",
    languageCode: "he",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: propertyCity },
          { type: "text", text: propertyHook },
        ],
      },
    ],
  };

  if (isMockMode()) {
    return {
      messageId: `mock-tmpl-${Date.now().toString(36)}`,
      status: "sent",
      timestamp: new Date().toISOString(),
    };
  }

  const { phoneNumberId, accessToken } = getConfig();

  if (!phoneNumberId || !accessToken) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN");
  }

  const response = await fetch(
    `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: templateMessage.to,
        type: "template",
        template: {
          name: templateMessage.templateName,
          language: { code: templateMessage.languageCode },
          components: templateMessage.components,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { messages?: Array<{ id: string }> };

  return {
    messageId: data.messages?.[0]?.id ?? "unknown",
    status: "sent",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Step 2: Send the full marketing kit — ONLY after the user has replied.
 * Meta allows freeform messages within the 24h session window.
 * This sends: property images, full description, CTA link.
 */
export async function sendFullMarketingKit(
  phone: string,
  copy: { shortHook: string; fullDescription: string },
  imageUrls: string[],
  contactLink: string
): Promise<SendResult[]> {
  const to = normalizePhone(phone);
  const results: SendResult[] = [];

  if (isMockMode()) {
    // Simulate sending image + text + CTA
    if (imageUrls.length > 0) {
      results.push({
        messageId: `mock-img-${Date.now().toString(36)}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      });
    }
    results.push({
      messageId: `mock-txt-${Date.now().toString(36)}`,
      status: "sent",
      timestamp: new Date().toISOString(),
    });
    return results;
  }

  const { phoneNumberId, accessToken } = getConfig();

  if (!phoneNumberId || !accessToken) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  // Send first image if available
  if (imageUrls.length > 0) {
    const imgResponse = await fetch(
      `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "image",
          image: {
            link: imageUrls[0],
            caption: copy.shortHook,
          },
        }),
      }
    );

    const imgData = (await imgResponse.json()) as { messages?: Array<{ id: string }> };
    results.push({
      messageId: imgData.messages?.[0]?.id ?? "unknown",
      status: imgResponse.ok ? "sent" : "failed",
      timestamp: new Date().toISOString(),
    });
  }

  // Send full description + CTA
  const fullText = [
    `*${copy.shortHook}*`,
    "",
    copy.fullDescription,
    "",
    `🏠 ${contactLink}`,
  ].join("\n");

  const textResponse = await fetch(
    `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: fullText },
      }),
    }
  );

  const textData = (await textResponse.json()) as { messages?: Array<{ id: string }> };
  results.push({
    messageId: textData.messages?.[0]?.id ?? "unknown",
    status: textResponse.ok ? "sent" : "failed",
    timestamp: new Date().toISOString(),
  });

  return results;
}

// ============================================================
// Helpers
// ============================================================

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  if (digits.startsWith("972")) return digits;
  return digits;
}
