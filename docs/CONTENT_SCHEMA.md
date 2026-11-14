# Content schema and agent contract

All visitor-facing operational content lives in /content/*.json. Zod schemas are defined in src/lib/schemas.ts. Run npm run validate-content after editing JSON; the command rejects invalid or inconsistent content and regenerates the JSON Schema files under public/schemas/.

## Files

| File | Purpose |
| --- | --- |
| site-config.json | Verified identity, NAP, domains, coordinates and sister schools |
| prayer-config.json | Aladhan method, Dublin coordinates, Asr default, Iqamah offsets and Jummah schedule |
| announcements.json | Optional urgent banners with stable ID, message and active flag |
| campaigns.json | Masjid project copy, sourced hadith and non-financial milestones |
| services.json | Service cards and their internal or approved external actions |
| events.json | Confirmed events with ISO dates, plus general programme descriptions |
| media.json | Optional YouTube video IDs and descriptive text for click-to-play embeds |
| donations.json | Explicit bank transfer, online donation and WhatsApp feature flags |

## Editing rules

- Keep the legal name, charity numbers, location, coordinates, timezone, phone, email and domain values aligned with docs/CONTEXT.md.
- Do not invent schedules, event dates, project status, fundraising totals, bank details or payment links.
- Iqamah offsets currently display as estimates because iqamahOffsetsConfirmed is false. Set it to true only after the masjid confirms each offset.
- bankTransferEnabled, onlineDonationEnabled and whatsappCommunityEnabled are false by default. Setting a flag to true requires its matching verified payload; schema validation fails if it is missing.
- Disabled donation options resolve to mailto:info@shuhadafoundation.com?subject=Masjid%20Donation%20Details and tel:+35318218748.
- Event start and end values must be ISO 8601 strings with an explicit offset. The feed omits unconfirmed dates.
- Media entries contain a YouTube video ID, not an arbitrary iframe URL. The visitor must click before an iframe is created.
- Service actions must resolve to a site route, a mailto:/tel: action, or an approved HTTPS destination.

The CI workflow validates JSON, type-checks the app, generates feeds and performs a static export. Review changes to both source JSON and generated public/ files in the same commit.
