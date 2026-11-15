import { contentSchemas } from "./schemas";
import type {
  Announcement,
  Campaign,
  DonationConfig,
  EventEntry,
  MediaVideo,
  PrayerConfig,
  Service,
  SiteConfig,
} from "./schemas";

export type MutableContentKey =
  | "announcements"
  | "prayer-config"
  | "events"
  | "media"
  | "campaigns";

export interface AllContentState {
  "site-config": SiteConfig;
  "prayer-config": PrayerConfig;
  announcements: { announcements: Announcement[] };
  campaigns: { campaign: Campaign };
  services: { services: Service[] };
  events: {
    events: EventEntry[];
    programmes: { title: string; description: string }[];
  };
  media: { videos: MediaVideo[] };
  donations: DonationConfig;
}

export interface CoordinatorResult {
  kind: "status" | "help" | "mutation" | "error";
  replyText: string;
  mutation?: {
    targetFile: MutableContentKey;
    updatedContent: unknown;
    summary: string;
    commitMessage: string;
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item-" + Date.now().toString(36);
}

/**
 * Converts "1:30 pm", "13:30", "1.30pm", "8:30 AM" into 24-hour "HH:mm".
 */
export function parseFlexibleClockTime(raw: string): string | null {
  const match = raw
    .trim()
    .match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (minutes < 0 || minutes > 59) return null;
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  if (hours < 0 || hours > 23) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildHelpMessage(): string {
  return [
    "🕌 *Shaheed Bilal Masjid — Coordinator Bot*",
    "",
    "Send any instruction in plain English:",
    "",
    "1️⃣ *Urgent Banner:*",
    "• `Announce: Eid prayers at 8:30 AM and 9:30 AM at Warrenstown House`",
    "• `Clear announcement`",
    "",
    "2️⃣ *Jummah Times:*",
    "• `Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM`",
    "• `Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM`",
    "",
    "3️⃣ *Iqamah Offsets (minutes after Adhan):*",
    "• `Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15`",
    "• `Confirm Iqamah offsets`",
    "",
    "4️⃣ *Events Calendar:*",
    "• `Add event: Community Iftar | 2026-03-07 18:00 | Family Iftar at Shaheed Bilal Masjid`",
    "• `Clear events`",
    "",
    "5️⃣ *Check Live Website Status:*",
    "• `Status`",
  ].join("\n");
}

export function buildStatusMessage(state: AllContentState): string {
  const activeBanners = state.announcements.announcements.filter((a) => a.active);
  const jummahLines = state["prayer-config"].jummah.map(
    (j) => `• ${j.name}: Khutbah ${j.khutbah} | Iqamah ${j.iqamah}`,
  );
  const offsets = state["prayer-config"].iqamahOffsetsMinutes;
  const eventLines = state.events.events.length
    ? state.events.events.map((e) => `• ${e.title} (${e.start})`)
    : ["• No upcoming one-off events published"];

  return [
    "🕌 *Shuhada Foundation Live Status*",
    "",
    "*Urgent Banner:*",
    activeBanners.length
      ? activeBanners.map((b) => `• 🟢 "${b.message}"`).join("\n")
      : "• ⚪ None active",
    "",
    "*Jummah Schedule:*",
    ...jummahLines,
    "",
    `*Iqamah Offsets (${state["prayer-config"].iqamahOffsetsConfirmed ? "Confirmed" : "Estimate"}):*`,
    `• Fajr +${offsets.fajr}m | Dhuhr +${offsets.dhuhr}m | Asr +${offsets.asr}m | Maghrib +${offsets.maghrib}m | Isha +${offsets.isha}m`,
    "",
    "*Published Events:*",
    ...eventLines,
    "",
    "🌐 https://shuhadafoundation.com",
  ].join("\n");
}

/**
 * Deterministic natural-language parser for common Mosque Coordinator commands.
 * Works with zero external API keys.
 */
function parseDeterministicCommand(
  input: string,
  state: AllContentState,
): CoordinatorResult | null {
  const trimmed = input.trim();
  // Strip leading bullets/numbering for single-line checks
  const cleaned = trimmed
    .replace(/^(?:[*•\-–—]|\d+[.)])\s*/, "")
    .trim();
  const lower = cleaned.toLowerCase();

  if (lower === "help" || lower === "?" || lower === "menu" || lower === "commands") {
    return { kind: "help", replyText: buildHelpMessage() };
  }

  if (lower === "status" || lower === "current" || lower === "info") {
    return { kind: "status", replyText: buildStatusMessage(state) };
  }

  // 1. Clear / hide announcements
  if (
    /(?:^|\n)\s*(?:[*•\-–—]\s*)?(?:clear|remove|hide|disable|delete|turn off)\s+(?:all\s+)?(?:urgent\s+)?(?:announcement|announcements|banner|banners)\b/i.test(
      trimmed,
    )
  ) {
    const updated = {
      announcements: state.announcements.announcements.map((item) => ({
        ...item,
        active: false,
      })),
    };
    const parsed = contentSchemas.announcements.safeParse(updated);
    if (!parsed.success) {
      return { kind: "error", replyText: `Validation error: ${parsed.error.issues[0]?.message}` };
    }
    return {
      kind: "mutation",
      replyText: "✅ Urgent announcement banner has been hidden.",
      mutation: {
        targetFile: "announcements",
        updatedContent: parsed.data,
        summary: "Hide active urgent announcement banners",
        commitMessage: "chore(content): hide urgent announcement banner via Coordinator Agent",
      },
    };
  }

  // 2. Post / update urgent announcement
  const announceMatch = trimmed.match(
    /(?:^|\n)\s*(?:[*•\-–—]\s*)?(?:announce|announcement|post\s+(?:urgent\s+)?(?:announcement|banner)|urgent\s+banner|set\s+(?:urgent\s+)?(?:announcement|banner))\s*[:\-]\s*(.+)/i,
  );
  if (announceMatch) {
    const rawMessage = announceMatch[1]
      .trim()
      .replace(/^(?:[*•\-–—]\s*)?(?:announce|announcement)\s*[:\-]\s*/i, "")
      .replace(/^["'`]|["'`]$/g, "")
      .trim();
    const id = "notice-" + slugify(rawMessage).slice(0, 28);
    const updated = {
      announcements: [
        {
          id,
          message: rawMessage,
          href: "/timetable/",
          active: true,
        },
      ],
    };
    const parsed = contentSchemas.announcements.safeParse(updated);
    if (!parsed.success) {
      return {
        kind: "error",
        replyText: `❌ Could not validate announcement: ${parsed.error.issues[0]?.message}`,
      };
    }
    return {
      kind: "mutation",
      replyText: `✅ Urgent banner published: "${rawMessage}"`,
      mutation: {
        targetFile: "announcements",
        updatedContent: parsed.data,
        summary: `Publish urgent banner: "${rawMessage}"`,
        commitMessage: `chore(content): publish urgent banner (${id}) via Coordinator Agent`,
      },
    };
  }

  // 3. Update 1st and/or 2nd Jummah times (supports single line or multi-line bullets)
  const jummahRegex =
    /(?:set|change|update)?\s*(1st|first|2nd|second)\s+jummah\s+(?:to\s+)?(?:khutbah\s*(?:to\s*|[:\-]\s*)?)?(\d{1,2}[:.]\d{2}\s*(?:am|pm)?)\s*(?:and|,|\||\/)?\s*(?:iqamah|salah|prayer)?\s*(?:to\s*|[:\-]\s*)?(\d{1,2}[:.]\d{2}\s*(?:am|pm)?)/gi;
  const jummahMatches = [...trimmed.matchAll(jummahRegex)];
  if (jummahMatches.length > 0) {
    const nextJummah = state["prayer-config"].jummah.map((slot) => ({ ...slot }));
    const updatedSummaries: string[] = [];

    for (const m of jummahMatches) {
      const which = m[1].toLowerCase();
      const slotIndex = which === "1st" || which === "first" ? 0 : 1;
      let khutbah = parseFlexibleClockTime(m[2]);
      let iqamah = parseFlexibleClockTime(m[3]);
      if (khutbah && Number(khutbah.slice(0, 2)) >= 1 && Number(khutbah.slice(0, 2)) <= 4) {
        khutbah = `${Number(khutbah.slice(0, 2)) + 12}:${khutbah.slice(3, 5)}`;
      }
      if (iqamah && Number(iqamah.slice(0, 2)) >= 1 && Number(iqamah.slice(0, 2)) <= 4) {
        iqamah = `${Number(iqamah.slice(0, 2)) + 12}:${iqamah.slice(3, 5)}`;
      }
      if (!khutbah || !iqamah) {
        return {
          kind: "error",
          replyText:
            "❌ Please provide valid Khutbah and Iqamah times (e.g. `Set 1st Jummah Khutbah 12:40 PM Iqamah 12:55 PM`).",
        };
      }
      if (nextJummah[slotIndex]) {
        nextJummah[slotIndex] = { ...nextJummah[slotIndex], khutbah, iqamah };
        updatedSummaries.push(
          `${nextJummah[slotIndex].name}: Khutbah ${khutbah} | Iqamah ${iqamah}`,
        );
      }
    }

    const updated: PrayerConfig = {
      ...state["prayer-config"],
      jummah: nextJummah,
    };
    const parsed = contentSchemas["prayer-config"].safeParse(updated);
    if (!parsed.success) {
      return {
        kind: "error",
        replyText: `❌ Validation error: ${parsed.error.issues[0]?.message}`,
      };
    }
    return {
      kind: "mutation",
      replyText: `✅ Jummah schedule updated:\n• ${updatedSummaries.join("\n• ")}`,
      mutation: {
        targetFile: "prayer-config",
        updatedContent: parsed.data,
        summary: `Update Jummah (${updatedSummaries.join("; ")})`,
        commitMessage: "chore(content): update Jummah schedule via Coordinator Agent",
      },
    };
  }

  // 4. Confirm Iqamah offsets
  if (/^(?:confirm|verify|approve)\s+iqamah\s+offsets\b/i.test(trimmed)) {
    const updated: PrayerConfig = {
      ...state["prayer-config"],
      iqamahOffsetsConfirmed: true,
    };
    const parsed = contentSchemas["prayer-config"].safeParse(updated);
    if (!parsed.success) {
      return { kind: "error", replyText: `❌ Validation error: ${parsed.error.issues[0]?.message}` };
    }
    return {
      kind: "mutation",
      replyText: "✅ Iqamah offsets marked as officially confirmed by the Masjid.",
      mutation: {
        targetFile: "prayer-config",
        updatedContent: parsed.data,
        summary: "Mark Iqamah offsets as confirmed",
        commitMessage: "chore(content): confirm Iqamah offsets via Coordinator Agent",
      },
    };
  }

  // 5. Update Iqamah offsets (e.g. "Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15")
  if (/iqamah\s+offsets/i.test(trimmed)) {
    const nextOffsets = { ...state["prayer-config"].iqamahOffsetsMinutes };
    let matchedAny = false;
    for (const prayer of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const) {
      const regex = new RegExp(`\\b${prayer}\\s*[:=+\\-]?\\s*(\\d{1,3})\\b`, "i");
      const m = trimmed.match(regex);
      if (m) {
        nextOffsets[prayer] = Number(m[1]);
        matchedAny = true;
      }
    }
    if (matchedAny) {
      const updated: PrayerConfig = {
        ...state["prayer-config"],
        iqamahOffsetsMinutes: nextOffsets,
      };
      const parsed = contentSchemas["prayer-config"].safeParse(updated);
      if (!parsed.success) {
        return { kind: "error", replyText: `❌ Validation error: ${parsed.error.issues[0]?.message}` };
      }
      return {
        kind: "mutation",
        replyText: `✅ Iqamah offsets updated: Fajr +${nextOffsets.fajr}m, Dhuhr +${nextOffsets.dhuhr}m, Asr +${nextOffsets.asr}m, Maghrib +${nextOffsets.maghrib}m, Isha +${nextOffsets.isha}m.`,
        mutation: {
          targetFile: "prayer-config",
          updatedContent: parsed.data,
          summary: `Update Iqamah offsets (${JSON.stringify(nextOffsets)})`,
          commitMessage: "chore(content): update Iqamah offsets via Coordinator Agent",
        },
      };
    }
  }

  // 6. Clear events
  if (/^(?:clear|remove|delete)\s+(?:all\s+)?events\b/i.test(trimmed)) {
    const updated = {
      ...state.events,
      events: [],
    };
    const parsed = contentSchemas.events.safeParse(updated);
    if (!parsed.success) {
      return { kind: "error", replyText: `❌ Validation error: ${parsed.error.issues[0]?.message}` };
    }
    return {
      kind: "mutation",
      replyText: "✅ Cleared all one-off events from the calendar.",
      mutation: {
        targetFile: "events",
        updatedContent: parsed.data,
        summary: "Clear published one-off events",
        commitMessage: "chore(content): clear one-off events via Coordinator Agent",
      },
    };
  }

  // 7. Add event: Title | YYYY-MM-DD HH:MM | Description
  const addEventMatch = trimmed.match(
    /^add\s+event\s*[:\-]\s*([^|]+)\|\s*([^|]+)\|\s*(.+)$/i,
  );
  if (addEventMatch) {
    const title = addEventMatch[1].trim();
    const rawDate = addEventMatch[2].trim();
    const description = addEventMatch[3].trim();
    const isoDate = normalizeDublinIsoDate(rawDate);
    if (!isoDate) {
      return {
        kind: "error",
        replyText:
          "❌ Could not parse event date. Use `YYYY-MM-DD HH:MM` (e.g. `Add event: Community Iftar | 2026-03-07 18:00 | Family Iftar at Shaheed Bilal Masjid`).",
      };
    }
    const newEvent: EventEntry = {
      id: slugify(title),
      title,
      description,
      start: isoDate,
      location: state["site-config"].address.formatted,
    };
    const nextEvents = [
      ...state.events.events.filter((e) => e.id !== newEvent.id),
      newEvent,
    ];
    const updated = {
      ...state.events,
      events: nextEvents,
    };
    const parsed = contentSchemas.events.safeParse(updated);
    if (!parsed.success) {
      return { kind: "error", replyText: `❌ Validation error: ${parsed.error.issues[0]?.message}` };
    }
    return {
      kind: "mutation",
      replyText: `✅ Added event "${title}" on ${isoDate}.`,
      mutation: {
        targetFile: "events",
        updatedContent: parsed.data,
        summary: `Add event "${title}" (${isoDate})`,
        commitMessage: `chore(content): add event ${newEvent.id} via Coordinator Agent`,
      },
    };
  }

  return null;
}

function normalizeDublinIsoDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) {
    return raw.length === 16 ? raw + ":00+00:00" : raw;
  }
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  const datePart = match[1];
  const clock = parseFlexibleClockTime(`${match[2]} ${match[3] ?? ""}`);
  if (!clock) return null;
  const month = Number(datePart.slice(5, 7));
  // Rough Europe/Dublin offset (+01:00 Apr-Oct IST, +00:00 Nov-Mar GMT)
  const offset = month >= 4 && month <= 10 ? "+01:00" : "+00:00";
  return `${datePart}T${clock}:00${offset}`;
}

/**
 * Optional LLM-powered parser (Gemini or OpenAI) for free-form natural language
 * when GEMINI_API_KEY or OPENAI_API_KEY is set in environment variables.
 */
async function parseWithLlm(
  input: string,
  state: AllContentState,
): Promise<CoordinatorResult | null> {
  const systemPrompt = [
    "You are the Shuhada Foundation of Ireland (Shaheed Bilal Masjid, Dublin 15) Coordinator Agent.",
    "Translate the coordinator's plain-English WhatsApp message into a single JSON object with keys:",
    '- "targetFile": one of "announcements" | "prayer-config" | "events" | "media" | "campaigns"',
    '- "updatedContent": the complete updated JSON object for that file matching its exact schema',
    '- "summary": a 1-sentence human summary of the change',
    "Rules:",
    "- Never invent bank details, phone numbers, or URLs not provided by the user.",
    "- Keep existing fields intact unless the user asked to change them.",
    "- Return ONLY valid JSON without markdown code fences.",
    "",
    "Current content state:",
    JSON.stringify({
      announcements: state.announcements,
      "prayer-config": state["prayer-config"],
      events: state.events,
      media: state.media,
      campaigns: state.campaigns,
    }),
  ].join("\n");

  let rawJson: string | null = null;

  if (process.env.GEMINI_API_KEY) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    if (response.ok) {
      const payload = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      rawJson = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    }
  } else if (process.env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
      }),
    });
    if (response.ok) {
      const payload = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      rawJson = payload.choices?.[0]?.message?.content ?? null;
    }
  }

  if (!rawJson) return null;

  try {
    const parsedLlm = JSON.parse(rawJson) as {
      targetFile: MutableContentKey;
      updatedContent: unknown;
      summary: string;
    };
    const schema = contentSchemas[parsedLlm.targetFile];
    if (!schema) return null;
    const validated = schema.safeParse(parsedLlm.updatedContent);
    if (!validated.success) {
      return {
        kind: "error",
        replyText: `❌ AI proposal rejected by Zod schema guard: ${validated.error.issues[0]?.message}`,
      };
    }
    return {
      kind: "mutation",
      replyText: `✅ ${parsedLlm.summary}`,
      mutation: {
        targetFile: parsedLlm.targetFile,
        updatedContent: validated.data,
        summary: parsedLlm.summary,
        commitMessage: `chore(content): update ${parsedLlm.targetFile}.json via WhatsApp Coordinator Agent`,
      },
    };
  } catch {
    return null;
  }
}

export async function interpretCoordinatorMessage(
  message: string,
  state: AllContentState,
): Promise<CoordinatorResult> {
  // 1. Try deterministic zero-latency command parser first
  const deterministic = parseDeterministicCommand(message, state);
  if (deterministic) return deterministic;

  // 2. Try LLM structured parser if GEMINI_API_KEY or OPENAI_API_KEY is configured
  const llmResult = await parseWithLlm(message, state);
  if (llmResult) return llmResult;

  // 3. Fallback guidance with exact syntax examples
  return {
    kind: "help",
    replyText: [
      "🤔 I couldn't match that instruction automatically.",
      "",
      buildHelpMessage(),
    ].join("\n"),
  };
}
