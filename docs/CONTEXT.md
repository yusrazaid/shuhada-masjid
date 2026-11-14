# Shuhada Foundation of Ireland — Institutional & Technical Context

## 1. Verified Legal & Contact Identity
- **Public Name:** Shuhada Foundation of Ireland
- **Masjid / Centre Name:** Shaheed Bilal Masjid (Islamic Cultural and Education Centre)
- **Legal Charity Name:** Irish Islamic Da'awah and Education Trust
- **Irish Charities Regulator No.:** 20069506
- **Irish Revenue Charity Tax No.:** CHY. 18219
- **Address:** Warrenstown House, Blanchardstown, Dublin 15, D15 ET27, Ireland
- **Geo-Coordinates:** 53.3850, -6.3860 (Timezone: `Europe/Dublin`)
- **Telephone:** +353 (0)1 821 8748 (`01 821 8748`)
- **Email:** info@shuhadafoundation.com

## 2. Domain, Hosting & Ecosystem Footprint
- **Primary Production Domain:** `https://shuhadafoundation.com` (Managed via Squarespace DNS)
- **Secondary Domain:** `https://shuhadafoundation.ch` (Registered via Swizzonic AG; 301 redirect to `https://shuhadafoundation.com`)
- **Legacy Website (Decommissioning):** `https://dev-shuhadafoundation.weebly.com/`
- **GitHub Repository:** `https://github.com/yusrazaid/shuhada-masjid`
- **Sister Educational Institutions (Squarespace Managed):**
  - Shaheeda Zainab Muslim Independent Primary School: `https://szainabschool.com` (`info@szainabschool.com`)
  - Summe Bilal School: `https://summebilalschool.com`
- **Search Demand Baseline:** Google Business Profile historical baseline shows 17,625+ monthly searches ("mosque", "dublin mosque", "mosque dublin", "blanchardstown mosque") with high mobile direction-request intent.

## 3. Architectural Principles
1. **Static-First, Zero Backend Attack Surface:** Built as a statically exported Next.js 15 application (`output: 'export'`) deployable to Cloudflare Pages or Vercel.
2. **Content-as-Code:** All mutable operational data (Iqamah rules, Jummah times, urgent announcements, events, construction milestones, donation toggles) resides in `/content/*.json` and is validated at build time via Zod.
3. **Quarantined Placeholders:** Never display fake IBANs, BICs, or WhatsApp numbers. Unverified financial or messaging endpoints remain behind explicit boolean flags (`bankTransferEnabled: false`, `onlineDonationEnabled: false`, `whatsappCommunityEnabled: false`) that render verified `mailto:` / `tel:` inquiry fallbacks until real credentials are provided.
