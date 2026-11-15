import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";

function loadEnvLocal(): Record<string, string> {
  const env: Record<string, string> = {};
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return env;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function normalizePhone(raw: string): string {
  const digits = raw
    .replace(/^whatsapp:/i, "")
    .replace(/[^0-9]/g, "")
    .replace(/^00/, "");
  if (/^08\d{8}$/.test(digits)) {
    return "353" + digits.slice(1);
  }
  if (/^07\d{9}$/.test(digits)) {
    return "44" + digits.slice(1);
  }
  return digits;
}

const envLocal = loadEnvLocal();
const WEBHOOK_URL =
  process.env.COORDINATOR_WEBHOOK_URL ||
  "https://shuhadafoundation.com/api/whatsapp/webhook/";
const API_SECRET =
  process.env.COORDINATOR_API_SECRET || envLocal.COORDINATOR_API_SECRET || "";
const ALLOWED_NUMBERS = Array.from(
  new Set(
    (
      process.env.WHATSAPP_ALLOWED_NUMBERS ||
      envLocal.WHATSAPP_ALLOWED_NUMBERS ||
      "+447526992368,+41796764995,+353861531260"
    )
      .split(",")
      .map((s) => normalizePhone(s))
      .filter(Boolean),
  ),
);

const QR_OUTPUT_PATH =
  process.env.WHATSAPP_QR_PATH ||
  "/Users/zaidabbasi/.gemini/antigravity/brain/4b988a3b-7fac-46b4-bd27-965e483a489d/whatsapp-qr.png";

const AUTH_DIR = join(process.cwd(), ".whatsapp-auth");
const WELCOME_MARKER = join(AUTH_DIR, ".welcomed");
const REGISTERED_JIDS_PATH = join(AUTH_DIR, "registered-jids.json");
const processedMessageIds = new Set<string>();

function loadRegisteredJids(): Record<string, string> {
  if (!existsSync(REGISTERED_JIDS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(REGISTERED_JIDS_PATH, "utf8")) as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

function saveRegisteredJid(jid: string, phone: string): void {
  const current = loadRegisteredJids();
  current[jid] = phone;
  writeFileSync(REGISTERED_JIDS_PATH, JSON.stringify(current, null, 2), "utf8");
}

function extractMessageText(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const m = message as Record<string, unknown>;
  const inner =
    (m.ephemeralMessage as { message?: Record<string, unknown> } | undefined)
      ?.message ||
    (m.viewOnceMessage as { message?: Record<string, unknown> } | undefined)
      ?.message ||
    (m.viewOnceMessageV2 as { message?: Record<string, unknown> } | undefined)
      ?.message ||
    m;

  return (
    (inner.conversation as string | undefined) ||
    (inner.extendedTextMessage as { text?: string } | undefined)?.text ||
    ""
  );
}

function isCoordinatorCommand(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Ignore bot's own formatted replies
  if (/^(?:🕌|✅|❌|🤔|⛔)/.test(trimmed)) return null;

  // Explicit prefix: "Masjid: <instruction>" or "!masjid <instruction>"
  const prefixed = trimmed.match(/^(?:masjid\s*[:\-]|!masjid\s+)\s*([\s\S]+)$/i);
  if (prefixed) return prefixed[1].trim();

  // Direct commands (supports single-line, multi-line, headings like "Jummah Times:", and bullets * / • / -)
  if (
    /(?:^|\n)\s*(?:[*•\-–—]\s*)?(?:status|help|\?|menu|commands|announce\s*[:\-]|announcement\s*[:\-]|post\s+(?:urgent\s+)?(?:announcement|banner)\s*[:\-]|urgent\s+banner\s*[:\-]|clear\s+announcement|remove\s+announcement|hide\s+banner|(?:set|change|update)?\s*(?:1st|first|2nd|second)\s+jummah|(?:set|update)\s+iqamah\s+offsets|confirm\s+iqamah\s+offsets|add\s+event\s*[:\-]|clear\s+events)\b/i.test(
      trimmed,
    )
  ) {
    return trimmed;
  }

  return null;
}

async function forwardToLiveCoordinatorWebhook(
  fromPhone: string,
  instruction: string,
): Promise<string> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_SECRET}`,
    },
    body: JSON.stringify({
      from: `+${fromPhone.replace(/[^0-9]/g, "")}`,
      text: instruction,
    }),
  });

  const data = (await res.json()) as { reply?: string; error?: string };
  if (!res.ok) {
    return `❌ Webhook error (${res.status}): ${data.error || "Unknown error"}`;
  }
  return data.reply || "✅ Update processed.";
}

async function startBridge() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Shuhada Masjid Coordinator", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      await QRCode.toFile(QR_OUTPUT_PATH, qr, {
        width: 420,
        margin: 2,
      });
      const asciiQr = await QRCode.toString(qr, {
        type: "terminal",
        small: true,
      });
      console.log("\n=== SCAN THIS WHATSAPP QR CODE ===");
      console.log("Saved PNG to:", QR_OUTPUT_PATH);
      console.log(asciiQr);
    }

    if (connection === "open") {
      console.log(
        "\n✅ WhatsApp Coordinator Bridge is CONNECTED and listening for commands!",
      );
      console.log(
        "Open your 'Message Yourself' chat in WhatsApp and send: Status  or  Help",
      );

      if (process.env.PENDING_INSTRUCTION && process.env.PENDING_JID) {
        const pendingInstruction = process.env.PENDING_INSTRUCTION;
        const pendingJid = process.env.PENDING_JID;
        delete process.env.PENDING_INSTRUCTION;
        delete process.env.PENDING_JID;
        try {
          const reply = await forwardToLiveCoordinatorWebhook(
            ALLOWED_NUMBERS[0] || "447526992368",
            pendingInstruction,
          );
          const sent = await sock.sendMessage(pendingJid, { text: reply });
          if (sent?.key?.id) {
            processedMessageIds.add(sent.key.id);
          }
          console.log(
            `[Coordinator Bridge] Processed pending instruction and replied to ${pendingJid}`,
          );
        } catch (err) {
          console.error(
            "[Coordinator Bridge] Failed to process pending instruction:",
            err,
          );
        }
      }
      if (!existsSync(WELCOME_MARKER)) {
        try {
          const selfJid = sock.user?.id
            ? jidNormalizedUser(sock.user.id)
            : `${ALLOWED_NUMBERS[0] || "447526992368"}@s.whatsapp.net`;
          const statusReply = await forwardToLiveCoordinatorWebhook(
            ALLOWED_NUMBERS[0] || "447526992368",
            "Status",
          );
          const welcomeText = [
            "🕌 *As-salamu alaykum! Shuhada Foundation WhatsApp Coordinator is now connected.*",
            "",
            "You can reply right here in this *Message Yourself* chat anytime to update *https://shuhadafoundation.com*:",
            "• `Status` — View live website status",
            "• `Help` — View all example commands",
            "• `Announce: <message>` — Post an urgent banner on the website",
            "• `Clear announcement` — Remove the urgent banner",
            "• `Set 1st Jummah Khutbah to 1:15 PM and Salah to 1:40 PM`",
            "",
            statusReply,
          ].join("\n");
          const sent = await sock.sendMessage(selfJid, { text: welcomeText });
          if (sent?.key?.id) {
            processedMessageIds.add(sent.key.id);
          }
          writeFileSync(WELCOME_MARKER, new Date().toISOString(), "utf8");
          console.log(
            `[Coordinator Bridge] Sent welcome message to ${selfJid}`,
          );
        } catch (err) {
          console.error(
            "[Coordinator Bridge] Failed to send initial welcome message:",
            err,
          );
        }
      }
    }

    if (connection === "close") {
      const statusCode = (
        lastDisconnect?.error as { output?: { statusCode?: number } } | undefined
      )?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) {
        setTimeout(() => void startBridge(), 2500);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      const msgId = msg.key.id;
      if (!msgId || processedMessageIds.has(msgId)) continue;

      // Ignore historical messages older than 90 seconds
      const tsSeconds = Number(msg.messageTimestamp || 0);
      if (tsSeconds > 0 && Date.now() - tsSeconds * 1000 > 90_000) {
        continue;
      }

      const remoteJid = msg.key.remoteJid || "";
      if (remoteJid === "status@broadcast") continue;

      const rawText = extractMessageText(msg.message);
      const senderJid = msg.key.participant || remoteJid;

      // 1. Check for self-service Coordinator Registration: "Register +353 86 153 1260"
      const registerMatch = rawText
        .trim()
        .match(/^(?:masjid\s*[:\-]\s*)?register\s*[:\-]?\s*([+0-9\s\-()]{7,20})$/i);
      if (registerMatch) {
        const candidatePhone = normalizePhone(registerMatch[1]);
        processedMessageIds.add(msgId);
        if (ALLOWED_NUMBERS.includes(candidatePhone)) {
          saveRegisteredJid(senderJid, candidatePhone);
          saveRegisteredJid(remoteJid, candidatePhone);
          const reply = [
            `✅ *Assalamu Alaykum! Your WhatsApp account (+${candidatePhone}) is now registered and verified as a Shuhada Foundation Website Coordinator.*`,
            "",
            "You can now send plain-English updates right here anytime:",
            "• `Status` — Check live website status",
            "• `Help` — View all copy-paste commands",
            "• `Announce: <message>` — Post an urgent banner on shuhadafoundation.com",
            "• `Clear announcement` — Remove the urgent banner",
            "• `Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM`",
          ].join("\n");
          const sent = await sock.sendMessage(remoteJid, { text: reply });
          if (sent?.key?.id) processedMessageIds.add(sent.key.id);
          console.log(
            `[Coordinator Bridge] Registered JID ${senderJid} -> +${candidatePhone}`,
          );
        } else {
          const sent = await sock.sendMessage(remoteJid, {
            text: `⛔ Phone number +${candidatePhone} is not yet in the Masjid Coordinator whitelist. Please ask the administrator to add +${candidatePhone} to WHATSAPP_ALLOWED_NUMBERS.`,
          });
          if (sent?.key?.id) processedMessageIds.add(sent.key.id);
        }
        continue;
      }

      const instruction = isCoordinatorCommand(rawText);
      if (!instruction) continue;

      const senderDigits = normalizePhone(
        senderJid.replace(/@.*$/, ""),
      );
      const registeredJids = loadRegisteredJids();
      const mappedPhone =
        registeredJids[senderJid] || registeredJids[remoteJid];
      const isAllowed =
        Boolean(msg.key.fromMe) ||
        ALLOWED_NUMBERS.includes(senderDigits) ||
        Boolean(mappedPhone && ALLOWED_NUMBERS.includes(mappedPhone));
      if (!isAllowed) continue;

      processedMessageIds.add(msgId);
      const effectivePhone =
        mappedPhone ||
        (ALLOWED_NUMBERS.includes(senderDigits)
          ? senderDigits
          : ALLOWED_NUMBERS[0] || "447526992368");
      console.log(
        `[Coordinator Bridge] Processing instruction from ${remoteJid} (+${effectivePhone}): "${instruction}"`,
      );

      try {
        const reply = await forwardToLiveCoordinatorWebhook(
          effectivePhone,
          instruction,
        );
        const sent = await sock.sendMessage(remoteJid, { text: reply });
        if (sent?.key?.id) {
          processedMessageIds.add(sent.key.id);
        }
        console.log(
          `[Coordinator Bridge] Sent reply to ${remoteJid} (${reply.length} chars)`,
        );
      } catch (err) {
        console.error("[Coordinator Bridge] Error:", err);
      }
    }
  });
}

void startBridge();
