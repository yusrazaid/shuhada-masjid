import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { interpretCoordinatorMessage } from "@/lib/coordinator-agent";
import { commitContentUpdateToGithub, loadLiveContentState } from "@/lib/github-committer";

function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/i, "").replace(/[^0-9]/g, "");
}

function isAuthorizedCoordinator(senderPhone: string, authHeader: string | null): boolean {
  const apiSecret = process.env.COORDINATOR_API_SECRET;
  if (apiSecret && authHeader === `Bearer ${apiSecret}`) {
    return true;
  }

  const allowlistRaw = process.env.WHATSAPP_ALLOWED_NUMBERS || "";
  const allowed = allowlistRaw
    .split(",")
    .map((item) => normalizePhone(item))
    .filter(Boolean);

  if (allowed.length === 0) {
    return false;
  }

  const normalizedSender = normalizePhone(senderPhone);
  return Boolean(normalizedSender) && allowed.includes(normalizedSender);
}

function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twimlResponse(message: string, status = 200): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, {
    status,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

async function sendMetaWhatsAppReply(toPhone: string, text: string, phoneNumberId?: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const senderId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !senderId) return;

  await fetch(`https://graph.facebook.com/v21.0/${senderId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizePhone(toPhone),
      type: "text",
      text: { body: text },
    }),
  });
}

async function handleCoordinatorInstruction(text: string): Promise<string> {
  const state = await loadLiveContentState();
  const result = await interpretCoordinatorMessage(text, state);

  if (result.kind !== "mutation" || !result.mutation) {
    return result.replyText;
  }

  const commitOutcome = await commitContentUpdateToGithub({
    state,
    targetFile: result.mutation.targetFile,
    updatedContent: result.mutation.updatedContent,
    commitMessage: result.mutation.commitMessage,
  });

  if (!commitOutcome.committed) {
    return [
      result.replyText,
      "",
      `⚠️ Validated against schema (${result.mutation.targetFile}.json), but GitHub commit could not run: ${commitOutcome.error}`,
    ].join("\n");
  }

  return [
    result.replyText,
    "",
    `📦 Committed to GitHub (${commitOutcome.commitSha})`,
    "🚀 Live deployment triggered on https://shuhadafoundation.com (~45 seconds).",
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe") {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (expectedToken && token === expectedToken && challenge) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
  }

  return NextResponse.json({
    status: "ok",
    service: "Shuhada Foundation of Ireland — WhatsApp Coordinator Agent",
    webhook: "/api/whatsapp/webhook",
    configured: {
      allowlistCount: (process.env.WHATSAPP_ALLOWED_NUMBERS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length,
      githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
      llmParserConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    },
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const authHeader = request.headers.get("authorization");

  // 1. Twilio WhatsApp Webhook (application/x-www-form-urlencoded)
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const from = String(formData.get("From") || "");
    const body = String(formData.get("Body") || "").trim();

    if (!isAuthorizedCoordinator(from, authHeader)) {
      return twimlResponse(
        "⛔ Unauthorized phone number. Please ask the Masjid administrator to add your number to WHATSAPP_ALLOWED_NUMBERS.",
      );
    }

    if (!body) {
      return twimlResponse("Send 'Help' to see example Masjid Coordinator commands.");
    }

    const reply = await handleCoordinatorInstruction(body);
    return twimlResponse(reply);
  }

  // 2. JSON Payload (Meta WhatsApp Cloud API OR Direct Coordinator JSON API)
  const rawBody = await request.text();
  if (process.env.WHATSAPP_APP_SECRET && request.headers.get("x-hub-signature-256")) {
    const validSig = verifyMetaSignature(
      rawBody,
      request.headers.get("x-hub-signature-256"),
      process.env.WHATSAPP_APP_SECRET,
    );
    if (!validSig) {
      return NextResponse.json({ error: "Invalid X-Hub-Signature-256" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2a. Meta WhatsApp Cloud API structure
  if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
    const firstEntry = payload.entry[0] as {
      changes?: {
        value?: {
          metadata?: { phone_number_id?: string };
          messages?: { from?: string; text?: { body?: string } }[];
        };
      }[];
    };
    const value = firstEntry?.changes?.[0]?.value;
    const messageObj = value?.messages?.[0];
    const from = messageObj?.from || "";
    const text = messageObj?.text?.body?.trim() || "";
    const phoneNumberId = value?.metadata?.phone_number_id;

    if (!from || !text) {
      return NextResponse.json({ status: "ignored_non_text_event" });
    }

    if (!isAuthorizedCoordinator(from, authHeader)) {
      await sendMetaWhatsAppReply(
        from,
        "⛔ Unauthorized number. Only registered Masjid coordinators may update shuhadafoundation.com.",
        phoneNumberId,
      );
      return NextResponse.json({ status: "unauthorized" }, { status: 403 });
    }

    const reply = await handleCoordinatorInstruction(text);
    await sendMetaWhatsAppReply(from, reply, phoneNumberId);
    return NextResponse.json({ status: "ok", reply });
  }

  // 2b. Direct Coordinator JSON API ({ "from": "+353...", "text": "Announce: ..." })
  const from = typeof payload.from === "string" ? payload.from : "";
  const text = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!isAuthorizedCoordinator(from, authHeader)) {
    return NextResponse.json(
      {
        error:
          "Unauthorized coordinator request. Provide a whitelisted 'from' number or Authorization: Bearer <COORDINATOR_API_SECRET>.",
      },
      { status: 403 },
    );
  }

  if (!text) {
    return NextResponse.json({ error: "Missing 'text' instruction." }, { status: 400 });
  }

  const reply = await handleCoordinatorInstruction(text);
  return NextResponse.json({ status: "ok", reply });
}
