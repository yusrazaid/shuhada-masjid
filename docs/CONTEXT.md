# Institutional and infrastructure context

## Verified identity

- Public organization: Shuhada Foundation of Ireland
- Masjid: Shaheed Bilal Masjid (Islamic Cultural and Education Centre)
- Legal charity: Irish Islamic Da'awah and Education Trust
- Charities Regulator number: 20069506
- Revenue charity tax number: CHY. 18219
- Address: Warrenstown House, Blanchardstown, Dublin 15, D15 ET27, Ireland
- Coordinates: 53.3850, -6.3860
- Timezone: Europe/Dublin
- Phone: +353 1 821 8748 (display: 01 821 8748)
- Email: info@shuhadafoundation.com
- Primary domain: https://shuhadafoundation.com
- Secondary domain: https://shuhadafoundation.ch (301 redirect to the primary domain)
- Sister schools: https://szainabschool.com and https://summebilalschool.com

## Product and hosting

The site uses Next.js App Router, TypeScript, Tailwind CSS and Zod. The export setting produces a static out/ directory for Cloudflare Pages or Vercel. The content under /content is the control plane. A maintainer or agent edits JSON, runs validation and feed generation, then commits the reviewed changes.

There is no browser admin, database write path, analytics SDK, advertising pixel or tracking cookie. Prayer times are fetched directly from Aladhan from the visitor's browser; the Dublin astronomical fallback remains available offline. User-selected Asr calculation and dismissed announcement state use local storage.

## Safety constraints

- Do not add IBAN, BIC, bank, Stripe, PayPal or WhatsApp values until the Foundation confirms them.
- Leave the explicit donation and WhatsApp feature flags false until their values are verified.
- Daily Iqamah offsets are estimates until the masjid confirms them; keep iqamahOffsetsConfirmed false until then.
- When donation links are disabled, use the official treasury contact fallback in the UI.
- Do not publish event dates, progress percentages, fundraising totals, additional phone numbers or service hours without confirmation.
- Preserve the verified legal and NAP facts above in metadata, structured data, feeds and legal pages.
- Use YouTube's privacy-enhanced domain only after a visitor chooses to load a video.

See CONTENT_SCHEMA.md for the JSON contract and DEPLOYMENT.md for hosting and directory guidance.
