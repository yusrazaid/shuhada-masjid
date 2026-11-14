# WhatsApp Coordinator AI Agent — End-to-End Setup & Usage Guide

The Shuhada Foundation platform includes a built-in **WhatsApp Coordinator Agent** at:

- **Live Webhook URL:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
- **Health Check (`GET`):** `https://shuhadafoundation.com/api/whatsapp/webhook/`

Mosque administrators and coordinators can send plain-English WhatsApp messages from their phones to update urgent banners, Jummah schedules, Iqamah offsets, and community events. Every update is validated against the Zod schemas in `src/lib/schemas.ts`, committed atomically to `yusrazaid/shuhada-masjid`, and immediately revalidated on the live site (`revalidateTag("shuhada-content")`).

---

## 1. Plain-English Commands Coordinators Can Send on WhatsApp

| What the Coordinator Wants to Do | Example WhatsApp Message to Send |
| :--- | :--- |
| **Check current live status** | `Status` |
| **See command menu** | `Help` |
| **Post an urgent announcement banner** | `Announce: Eid ul-Fitr prayers at 8:30 AM and 9:30 AM at Warrenstown House` |
| **Hide / remove the urgent banner** | `Clear announcement` |
| **Change 1st Jummah times** | `Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM` |
| **Change 2nd Jummah times** | `Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM` |
| **Update Iqamah offsets (minutes)** | `Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15` |
| **Mark Iqamah offsets as confirmed** | `Confirm Iqamah offsets` |
| **Add an upcoming event** | `Add event: Community Iftar \| 2026-03-07 18:00 \| Family Iftar at Shaheed Bilal Masjid` |
| **Clear published one-off events** | `Clear events` |

*(When `GEMINI_API_KEY` or `OPENAI_API_KEY` is configured in Vercel Environment Variables, coordinators can also phrase requests in completely free-form natural language.)*

---

## 2. Security & Environment Variables on Vercel (`zaidabbasi-6309/sfi`)

1. **`WHATSAPP_ALLOWED_NUMBERS`** *(Required)*:
   - Comma-separated E.164 phone numbers of authorized coordinators (e.g., `+447526992368`).
   - Any message from an unlisted phone number is rejected.
2. **Webhook Signature / Secret Authentication** *(Required — prevents phone-number spoofing)*:
   - For **Twilio WhatsApp**: configure `TWILIO_AUTH_TOKEN` (verifies `X-Twilio-Signature`) or `WHATSAPP_WEBHOOK_TOKEN` (append `?token=<secret>` to the Twilio webhook URL).
   - For **Meta Cloud API**: configure `WHATSAPP_APP_SECRET` (verifies `X-Hub-Signature-256`).
   - For **Direct JSON API / scripts**: configure `COORDINATOR_API_SECRET` (`Authorization: Bearer <secret>`).
3. **`GITHUB_TOKEN`** *(Required for live GitHub commits)*:
   - Create a Fine-Grained Personal Access Token at `https://github.com/settings/personal-access-tokens/new`:
     - **Repository access:** Only select repositories → `yusrazaid/shuhada-masjid`
     - **Permissions:** Repository permissions → **Contents: Read and write**
4. **`GEMINI_API_KEY`** *(Optional)*:
   - Google AI Studio key (`gemini-2.5-flash`) for free-form natural language understanding beyond the built-in deterministic command parser.

---

## 3. Connecting WhatsApp (2 Options)

### Option A: Twilio WhatsApp (Fastest — Live in 3 Minutes)
1. Create a free account at `https://www.twilio.com/try-twilio`.
2. Copy your **Account Auth Token** from the Twilio Console dashboard and add it as `TWILIO_AUTH_TOKEN` in Vercel (or use the pre-generated `?token=` URL secret).
3. Go to **Messaging → Try it out → Send a WhatsApp message** (Twilio Sandbox) → **Sandbox Settings**.
4. Under **"When a message comes in"** (`HTTP POST`), enter:
   - `https://shuhadafoundation.com/api/whatsapp/webhook/` *(if using `TWILIO_AUTH_TOKEN`)*, OR
   - `https://shuhadafoundation.com/api/whatsapp/webhook/?token=<YOUR_WHATSAPP_WEBHOOK_TOKEN>`
5. Click **Save**, send the join code to the Twilio Sandbox number from WhatsApp (`+447526992368`), then text `Status` or `Help`.

### Option B: Meta Official WhatsApp Cloud API (1,000 Free Service Conversations/Month)
1. Go to `https://developers.facebook.com/apps/` → Create a **Business** app → Add **WhatsApp**.
2. In **WhatsApp → Configuration → Webhook**, click **Edit**:
   - **Callback URL:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
   - **Verify token:** Match `WHATSAPP_VERIFY_TOKEN` set in Vercel.
   - Subscribe to **`messages`**.
3. Set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_APP_SECRET` in Vercel Environment Variables.

---

## 4. Testing Locally from the Terminal

```bash
npm run coordinator -- "Status"
npm run coordinator -- "Announce: Eid ul-Fitr prayers at 8:30 AM and 9:30 AM at Warrenstown House"
npm run coordinator -- "Clear announcement"
```
