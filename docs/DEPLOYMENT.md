# Deployment and directory guide

## Static build

Use Node.js 22 and npm. Run npm install, npm run validate-content, npm run typecheck and npm run build.

The static site is written to out/. npm run build validates content and regenerates public/presence.json, public/events.ics and public/schemas/*.schema.json before Next.js exports the routes.

## Cloudflare Pages

Connect the GitHub repository in Cloudflare Pages. Use npm install && npm run build as the build command and out as the output directory. The project includes public/_redirects for legacy Weebly paths. Add the custom domain in the Pages dashboard and publish only the DNS records Cloudflare assigns for this project.

## Vercel

Import the repository and use the Next.js preset with npm install and npm run build. Vercel reads vercel.json for the legacy paths and security headers. Configure the primary domain there and confirm the production build is serving static files.

## Domain and directory updates

- Keep shuhadafoundation.com canonical. At Squarespace DNS, use the exact records shown by the selected hosting provider; do not copy records from an older deployment.
- Configure shuhadafoundation.ch at Swizzonic as a permanent HTTPS redirect to https://shuhadafoundation.com, preserving paths and query strings where the provider supports it.
- Keep the legacy Weebly path redirects in both deployment configurations. Add a specific redirect when a known legacy path is found; avoid broad rules that hide missing pages.
- Test HTTPS, canonical URLs, sitemap, robots file, prayer timetable, printable view and the presence.json and events.ics feeds after publishing.

## Google Business Profile

Keep the profile name, address, phone and website consistent with the verified NAP details. Set the website to https://shuhadafoundation.com. Update prayer information only from confirmed masjid schedules, and use the timetable route for current prayer information. Publish opening hours, event dates or temporary hours only after the Foundation confirms them. Confirm that map directions point to Warrenstown House, Dublin 15.

## Content maintenance

Edit only the JSON files in /content, then run validation, typecheck and build. Review generated feeds and schemas before committing. No secrets or credentials belong in this static repository.
