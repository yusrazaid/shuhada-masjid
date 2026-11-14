# WhatsApp Coordinator AI Agent — End-to-End Setup & Usage Guide

The Shuhada Foundation platform includes a built-in **WhatsApp Coordinator Agent** at:

- **Live Webhook URL:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
- **Health Check (`GET`):** `https://shuhadafoundation.com/api/whatsapp/webhook/`

Mosque administrators and coordinators can send plain-English WhatsApp messages from their phones to update urgent banners, Jummah schedules, Iqamah offsets, and community events. Every update is validated against the Zod schemas in `src/lib/schemas.ts`, regenerates `public/presence.json` and `public/events.ics`, and commits directly to `yusrazaid/shuhada-masjid`.

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

*(When `GEMINI_API_KEY` or `OPENAI_API_KEY` is configured in Vercel Environment Variables, coordinators can also phrase requests in completely free-form natural language in English, Arabic, or Urdu.)*

---

## 2. Environment Variables on Vercel (`zaidabbasi-6309/sfi`)

In **Vercel Dashboard → `sfi` → Settings → Environment Variables**, configure:

1. **`WHATSAPP_ALLOWED_NUMBERS`** *(Required)*:
   - Comma-separated phone numbers of the Mosque Coordinators allowed to update the website (e.g., `+353871234567,+353869876543`).
   - Any WhatsApp message from a number not on this list is automatically blocked.
2. **`GITHUB_TOKEN`** *(Required for live commits)*:
   - Create a Fine-Grained Personal Access Token at `https://github.com/settings/personal-access-tokens/new`:
     - **Repository access:** Only select repositories → `yusrazaid/shuhada-masjid`
     - **Permissions:** Repository permissions → **Contents: Read and write**
3. **`VERCEL_DEPLOY_HOOK_URL`** *(Recommended)*:
   - In Vercel → `sfi` → **Settings → Git → Deploy Hooks**, create a hook for branch `main` and paste the URL here (or connect the GitHub repository in Vercel → Settings → Git so every commit deploys automatically).
4. **`GEMINI_API_KEY`** *(Optional)*:
   - Free Google AI Studio API key (`gemini-2.5-flash`) for free-form natural language understanding beyond the built-in deterministic command parser.

---

## 3. Connecting WhatsApp (2 Options)

### Option A: Twilio WhatsApp (Fastest — Live in 3 Minutes)
1. Create a free account at `https://www.twilio.com/try-twilio`.
2. In the Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message** (Twilio Sandbox) or **Senders → WhatsApp Senders**.
3. Under **Sandbox Configuration → "When a message comes in"**, paste:
   - **URL:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
   - **Method:** `HTTP POST`
4. Click **Save**. Send `Status` or `Help` from your whitelisted WhatsApp number and the bot will reply immediately!

### Option B: Meta Official WhatsApp Cloud API (1,000 Free Service Conversations/Month)
1. Go to `https://developers.facebook.com/apps/` → Create a **Business** app → Add **WhatsApp**.
2. In **WhatsApp → Configuration → Webhook**, click **Edit**:
   - **Callback URL:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
   - **Verify token:** Match the `WHATSAPP_VERIFY_TOKEN` variable set in Vercel.
   - Subscribe to the **`messages`** webhook field.
3. Add `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` from **WhatsApp → API Setup** to your Vercel Environment Variables.

---

## 4. Testing Locally from the Terminal

Engineers can test any coordinator message locally without WhatsApp:

```bash
npm run coordinator -- "Status"
npm run coordinator -- "Announce: Eid ul-Fitr prayers at 8:30 AM and 9:30 AM at Warrenstown House"
npm run coordinator -- "Clear announcement"
```
