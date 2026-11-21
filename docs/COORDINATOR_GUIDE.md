# Shuhada Foundation of Ireland — Website & WhatsApp Coordinator Guide

**Masjid:** Shaheed Bilal Masjid (Shuhada Foundation of Ireland)  
**Address:** Warrenstown House, Blanchardstown, Dublin 15, D15 ET27  
**Live Website:** [https://shuhadafoundation.com](https://shuhadafoundation.com)  
**Live Monthly Timetable:** [https://shuhadafoundation.com/timetable/](https://shuhadafoundation.com/timetable/)  
**GitHub Repository:** [https://github.com/yusrazaid/shuhada-masjid](https://github.com/yusrazaid/shuhada-masjid)

---

## 1. Quick Overview & How to Register Your WhatsApp Account

You can update **https://shuhadafoundation.com** directly from **WhatsApp** using plain English messages — no coding, passwords, or technical dashboard needed.

### Currently Whitelisted Coordinator Phone Numbers

| Coordinator Role | Whitelisted WhatsApp Number | Status |
| :--- | :--- | :--- |
| **Masjid Official Mobile (Dublin)** | `+353 86 153 1260` (`086-1531260`) | **Whitelisted & Active** |
| **Admin Coordinator (UK)** | `+44 7526 992368` | **Whitelisted & Active** |
| **Admin Coordinator (Primary Bridge)** | `+41 79 676 49 95` | **Whitelisted & Connected** |

---

### How to Register & Start Using Your WhatsApp (`+353 86 153 1260`)

There are **two easy ways** for a whitelisted coordinator to activate their WhatsApp:

#### Way A — 1-Message Instant Registration (Recommended — No QR Code Needed)
1. Open **WhatsApp** on your whitelisted phone (for example, **`+353 86 153 1260`**).
2. Open a WhatsApp chat with the connected Coordinator bridge number (**`+41 79 676 49 95`**) — or message inside the shared **"Shuhada Website Coordinators"** WhatsApp group.
3. Send this single message to link and verify your WhatsApp account:
   ```text
   Register +353 86 153 1260
   ```
   *(Irish local format `Register 086 153 1260` also works automatically).*
4. The bot will immediately reply in WhatsApp:
   `✅ Assalamu Alaykum! Your WhatsApp account (+353861531260) is now registered and verified as a Shuhada Foundation Website Coordinator.`
5. You can now send `Status`, `Help`, or any website update command right in that chat anytime!

#### Way B — Link Directly via WhatsApp "Linked Devices" (QR Code)
If you are using the primary bridge phone (or linking a dedicated Masjid phone directly to the server):
1. Open **WhatsApp** on your phone.
2. Go to **Settings** → **Linked Devices** → **Link a Device** and scan the Coordinator QR code.
3. Open your **"Message Yourself" (You)** chat in WhatsApp and send `Status` or `Help`.

#### How to Add a New Coordinator Number in the Future
1. Give the new coordinator's mobile number (with country code, e.g. `+353 87 ...`) to the Website Admin so they can add it to `WHATSAPP_ALLOWED_NUMBERS`.
2. Once added, the new coordinator simply sends `Register <their phone number>` in the Coordinator WhatsApp chat to activate.

---

## 2. Quick Reference Command Table

| Task | What to Send in WhatsApp |
| :--- | :--- |
| **Register Your Whitelisted Number** | `Register +353 86 153 1260` |
| **Check Live Website Status** | `Status` |
| **Show Command Help Menu** | `Help` |
| **Post an Urgent Top Banner** | `Announce: Eid prayer will be held at 8:30 AM and 9:30 AM at Warrenstown House.` |
| **Remove Urgent Top Banner** | `Clear announcement` |
| **Update Both 1st & 2nd Jummah** | `Jummah Times:` followed by `* Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM` and `* Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM` |
| **Update 1st Jummah Time Only** | `Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM` |
| **Update 2nd Jummah Time Only** | `Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM` |
| **Update Daily Iqamah Offsets** | `Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15` |
| **Confirm Iqamah Offsets** | `Confirm Iqamah offsets` |
| **Add an Upcoming Event** | `Add event: Community Iftar \| 2026-03-07 18:00 \| Family Iftar at Shaheed Bilal Masjid` |
| **Clear All One-Off Events** | `Clear events` |

---

## 3. Copy-and-Paste Examples

### A. Updating Jummah (Friday Prayer) Times

You can update **both Jummah congregations in a single message** or **one at a time**:

**Update both 1st and 2nd Jummah together:**
```text
Jummah Times:
* Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM
* Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM
```

**Update only 1st Jummah:**
```text
Set 1st Jummah Khutbah 12:30 PM Iqamah 12:55 PM
```

**Update only 2nd Jummah:**
```text
Set 2nd Jummah Khutbah 1:20 PM Iqamah 1:45 PM
```

---

### B. Posting or Clearing an Urgent Website Banner

Use this for Eid prayer times, Ramadan moon-sighting announcements, weather alerts, or Janazah notices. The banner appears immediately at the very top of **https://shuhadafoundation.com**.

**Post or update the banner:**
```text
Announce: Eid prayer will be held at 8:30 AM and 9:30 AM at Warrenstown House.
```

**Clear / hide the banner when no longer needed:**
```text
Clear announcement
```

---

### C. Updating Daily Prayer Iqamah Offsets

For months where an official PDF timetable has not yet been uploaded, daily Adhan times are calculated automatically for Blanchardstown (`Europe/Dublin`). To change how many minutes after Adhan the congregational Iqamah is held:

```text
Set Iqamah offsets: Fajr 25, Dhuhr 15, Asr 15, Maghrib 5, Isha 15
```

To mark the Iqamah offsets as officially confirmed by the Masjid:
```text
Confirm Iqamah offsets
```

---

### D. Adding or Clearing Upcoming Events

Events appear on the homepage and are automatically added to the downloadable calendar feed (`https://shuhadafoundation.com/events.ics`).

**Add a new event (`Title | YYYY-MM-DD HH:MM | Description`):**
```text
Add event: Community Iftar | 2026-03-07 18:00 | Family Iftar at Shaheed Bilal Masjid
```

**Clear all one-off events after they finish:**
```text
Clear events
```

---

## 4. Built-In Safety Guardrails

- **Authorized Numbers Only:** Only phone numbers listed in `WHATSAPP_ALLOWED_NUMBERS` (`+353 86 153 1260`, `+44 7526 992368`, `+41 79 676 49 95`) can register or trigger updates. Messages from unknown numbers are rejected.
- **Strict Format & Schema Validation:** Every update is validated before saving. Invalid clock times or malformed dates are safely rejected with a helpful explanation.
- **Protected Financial & Charity Details:** Bank details (`Dawah Community Centre`, `Bank of Ireland`, `IBAN: IE12BOFI90073889753200`, `BIC: BOFIIE2DXXX`), Charity numbers (`RCN: 20069506`, `CHY: 18219`), and official contact information cannot be altered by WhatsApp commands.
- **Full Audit History:** Every change creates a timestamped commit on GitHub (`https://github.com/yusrazaid/shuhada-masjid/commits/main`) so any change can be reviewed or reverted in one click.

---

## 5. Technical Handoff Notes (For Engineers)

- **Repository:** `https://github.com/yusrazaid/shuhada-masjid` (`main` branch)
- **Hosting:** Vercel (`zaidabbasi-6309/sfi`), connected to `shuhadafoundation.com` and `www.shuhadafoundation.com`
- **Live Webhook Endpoint:** `https://shuhadafoundation.com/api/whatsapp/webhook/`
- **Structured Content Files:**
  - `content/prayer-config.json` — Official monthly timetables (`publishedTimetables`), Jummah schedule, Halal Store hours, and daily Iqamah offsets
  - `content/announcements.json` — Top urgent announcement banner
  - `content/events.json` — Upcoming events and regular weekly programmes
  - `content/campaigns.json` — Masjid construction campaign milestones
  - `content/donations.json` — Verified bank transfer and iDonate links
  - `content/site-config.json` — Official address, Eircode, RCN/CHY, and contacts
- **Whitelisting Additional Coordinator Phone Numbers:**
  Run:
  ```bash
  printf "+447526992368,+41796764995,+353861531260,<NEW_NUMBER>" | vercel env add WHATSAPP_ALLOWED_NUMBERS production --sensitive --force
  vercel deploy --prod --yes
  ```
