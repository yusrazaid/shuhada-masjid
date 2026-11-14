import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { announcements, donations, events, prayerConfig, siteConfig } from "../src/lib/content";
import { buildEventsIcs, buildPresenceJson } from "../src/lib/feed-builder";

const root = process.cwd();
const publicDirectory = join(root, "public");
mkdirSync(publicDirectory, { recursive: true });

const bundle = {
  "site-config": siteConfig,
  "prayer-config": prayerConfig,
  announcements,
  donations,
  events,
};

writeFileSync(join(publicDirectory, "presence.json"), buildPresenceJson(bundle));
writeFileSync(join(publicDirectory, "events.ics"), buildEventsIcs(bundle));
console.log("Generated presence.json and events.ics");
