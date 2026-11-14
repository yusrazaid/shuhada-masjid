import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { interpretCoordinatorMessage } from "@/lib/coordinator-agent";
import { commitContentUpdateToGithub, loadLiveContentState } from "@/lib/github-committer";

function normalizePhone(raw: string): string {
  return raw
    .replace(/^whatsapp:/i, "")
    .replace(/[^0-9]/g, "")
    .replace(/^00/, "");
}

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function isPhoneAllowlisted(senderPhone: string): boolean {
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

function hasValidWebhookUrlToken(request: NextRequest): boolean {
  const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (!expectedToken) return false;
  const queryToken = new URL(request.url).searchParams.get("token") || "";
  return Boolean(queryToken) && safeEqualString(queryToken, expectedToken);
}

function hasValidBearerSecret(request: NextRequest): boolean {
  const apiSecret = process.env.COORDINATOR_API_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (!apiSecret || !authHeader.startsWith("Bearer ")) return false;
  return safeEqualString(authHeader.slice("Bearer ".length), apiSecret);
}

function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return safeEqualString(signatureHeader, expected);
}

function verifyTwilioSignature(
  request: NextRequest,
  params: Record<string, string>,
  authToken: string,
): boolean {
  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;

  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const candidates = Array.from(
    new Set([
      `${forwardedProto}://${host}${url.pathname}${url.search}`,
      request.url,
    ]),
  );

  const sortedSuffix = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  return candidates.some((candidateUrl) => {
    const computed = createHmac("sha1", authToken)
      .update(candidateUrl + sortedSuffix, "utf8")
      .digest("base64");
    return safeEqualString(signature, computed);
  });
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

  try {
    revalidateTag("shuhada-content");
    revalidatePath("/");
    revalidatePath("/timetable/");
  } catch {
    // Revalidation APIs are no-ops outside Next server requests
  }

  return [
    result.replyText,
    "",
    `📦 Committed to GitHub (${commitOutcome.commitSha})`,
    "🚀 Live website updated at https://shuhadafoundation.com.",
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe") {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (expectedToken && token && safeEqualString(token, expectedToken) && challenge) {
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
      webhookAuthConfigured: Boolean(
        process.env.TWILIO_AUTH_TOKEN ||
          process.env.WHATSAPP_APP_SECRET ||
          process.env.WHATSAPP_WEBHOOK_TOKEN ||
          process.env.COORDINATOR_API_SECRET,
      ),
      llmParserConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    },
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  const urlTokenValid = hasValidWebhookUrlToken(request);
  const bearerValid = hasValidBearerSecret(request);

  // 1. Twilio WhatsApp Webhook (application/x-www-form-urlencoded)
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSigValid = twilioToken ? verifyTwilioSignature(request, params, twilioToken) : false;

    if (!twilioSigValid && !urlTokenValid && !bearerValid) {
      return twimlResponse(
        "⛔ Unauthorized webhook request. Configure TWILIO_AUTH_TOKEN or include the verified webhook ?token= parameter.",
        401,
      );
    }

    const from = params.From || "";
    const body = (params.Body || "").trim();

    if (!bearerValid && !isPhoneAllowlisted(from)) {
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

  // 2. JSON Payload (Meta WhatsApp Cloud API OR Authenticated Direct Coordinator JSON API)
  const rawBody = await request.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2a. Meta WhatsApp Cloud API webhook
  if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const metaSigValid = appSecret
      ? verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"), appSecret)
      : false;

    if (!metaSigValid && !urlTokenValid) {
      return NextResponse.json({ error: "Invalid Meta webhook signature" }, { status: 401 });
    }

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

    if (!isPhoneAllowlisted(from)) {
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

  // 2b. Direct Coordinator JSON API — MUST authenticate via Bearer COORDINATOR_API_SECRET
  if (!bearerValid) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Direct JSON requests require Authorization: Bearer <COORDINATOR_API_SECRET>.",
      },
      { status: 401 },
    );
  }

  const from = typeof payload.from === "string" ? payload.from : "";
  if (from && !isPhoneAllowlisted(from)) {
    return NextResponse.json(
      { error: "Coordinator phone number is not in WHATSAPP_ALLOWED_NUMBERS." },
      { status: 403 },
    );
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Missing 'text' instruction." }, { status: 400 });
  }

  const reply = await handleCoordinatorInstruction(text);
  return NextResponse.json({ status: "ok", reply });
}
