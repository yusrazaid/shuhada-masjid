# Shuhada Foundation of Ireland

Static Next.js platform for Shuhada Foundation of Ireland and Shaheed Bilal Masjid in Blanchardstown, Dublin 15.

## Local development

Run npm install, then npm run dev.

## Content and static build

Edit the agent-maintained JSON files in content/. Validate the content contract and build the static export with npm run validate-content, npm run typecheck and npm run build.

The production build is written to out/. Generated public feeds and JSON Schemas are included in the build. See docs/CONTENT_SCHEMA.md and docs/DEPLOYMENT.md before publishing changes.

Donation, online payment and WhatsApp links are disabled until verified details are supplied in content/donations.json.
