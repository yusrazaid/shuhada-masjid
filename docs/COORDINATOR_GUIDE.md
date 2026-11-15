# Shuhada Foundation of Ireland — WhatsApp Coordinator Guide

Manage and update **https://shuhadafoundation.com** directly from WhatsApp using plain English — no coding, login dashboards, or GitHub knowledge required.

---

## 1. Where to Send Messages

Open **WhatsApp** on your phone and go to your **"Message Yourself" (You)** chat.
*(You can also send commands in any chat by starting the message with `Masjid: `).*

---

## 2. Copy-and-Paste Command Templates

### Check Current Live Website Status
```text
Status
```

### See Command Help Menu
```text
Help
```

---

### Update Jummah (Friday Prayer) Times

You can update **one** Jummah congregation or **both at the same time** in a single message:

**Option A — Update both 1st and 2nd Jummah together:**
```text
Jummah Times:
* Set 1st Jummah Khutbah 12:40 PM Iqamah 12:55 PM
* Set 2nd Jummah Khutbah 1:30 PM Iqamah 1:45 PM
```

**Option B — Update a single Jummah slot:**
```text
Set 1st Jummah Khutbah 12:40 PM Iqamah 12:55 PM
```
or
```text
Set 2nd Jummah Khutbah 1:30 PM Iqamah 1:45 PM
```

*(Both 12-hour times like `1:30 PM` and 24-hour times like `13:30` work automatically, with or without `to`, `and`, or bullet points.)*

---

### Post or Remove an Urgent Website Banner

Use this for Eid announcements, Ramadan moon-sighting updates, weather closures, or funeral (Janazah) notices. It appears immediately at the very top of **https://shuhadafoundation.com**.

**Publish / replace the top banner:**
```text
Announce: Eid prayer will be held at 8:30 AM and 9:30 AM at Warrenstown House.
```

**Remove / hide the top banner:**
```text
Clear announcement
```

---

### Update Daily Iqamah Offsets (Minutes After Adhan)

Daily Adhan times calculate automatically every day of the year for Blanchardstown (`Europe/Dublin`). To adjust how many minutes after Adhan each congregational Iqamah takes place:

```text
Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15
```

To mark the Iqamah offsets as officially confirmed by the Masjid (removing the *"Estimated"* badge on the website):
```text
Confirm Iqamah offsets
```

---

### Add or Clear Upcoming Events

Events appear on the homepage and automatically sync to the downloadable iCal feed (`https://shuhadafoundation.com/events.ics`).

**Add an event (`Title | YYYY-MM-DD HH:MM | Description`):**
```text
Add event: Community Iftar | 2026-03-07 18:00 | Family Iftar at Shaheed Bilal Masjid
```

**Clear all one-off events:**
```text
Clear events
```

---

## 3. How It Works Behind the Scenes

1. **WhatsApp Bridge / Webhook:** Your message is sent to `https://shuhadafoundation.com/api/whatsapp/webhook/`.
2. **Safety & Schema Guard (`src/lib/schemas.ts`):** Every update is validated against strict Zod schemas (valid 24-hour clock format, valid dates, non-empty text, untouched IBAN/BIC/Charity data). Invalid updates are rejected safely with an explanation.
3. **Atomic GitHub Commit (`src/lib/github-committer.ts`):** The bot creates a single verifiable commit on [`yusrazaid/shuhada-masjid`](https://github.com/yusrazaid/shuhada-masjid) updating `content/*.json`, `public/presence.json`, and `public/events.ics`.
4. **Instant Live Refresh:** The webhook triggers Next.js On-Demand ISR (`revalidateTag("shuhada-content")`, `revalidatePath("/")`, `revalidatePath("/timetable/")`) so **https://shuhadafoundation.com** updates immediately without waiting for a full site rebuild.

---

## 4. Managing Coordinator Phone Numbers or Restarting the Local Bridge

- **Restart local WhatsApp bridge (if your Mac restarts):**
  ```bash
  cd /Users/zaidabbasi/Project/sfi
  npm run whatsapp-bridge
  ```
  *(Your linked-device session is saved in `.whatsapp-auth/`, so you do **not** need to scan the QR code again.)*
- **Add another coordinator's WhatsApp number:**
  Add their E.164 phone number (comma-separated, e.g. `+447526992368,+353899538907`) to `WHATSAPP_ALLOWED_NUMBERS` in Vercel (`vercel env`) and `/Users/zaidabbasi/Project/sfi/.env.local`.
