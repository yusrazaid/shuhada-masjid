import siteConfigJson from "../../content/site-config.json";
import prayerConfigJson from "../../content/prayer-config.json";
import announcementsJson from "../../content/announcements.json";
import campaignsJson from "../../content/campaigns.json";
import servicesJson from "../../content/services.json";
import eventsJson from "../../content/events.json";
import mediaJson from "../../content/media.json";
import donationsJson from "../../content/donations.json";
import { contentSchemas } from "./schemas";

export const siteConfig = contentSchemas["site-config"].parse(siteConfigJson);
export const prayerConfig = contentSchemas["prayer-config"].parse(prayerConfigJson);
export const announcements = contentSchemas.announcements.parse(announcementsJson);
export const campaigns = contentSchemas.campaigns.parse(campaignsJson);
export const services = contentSchemas.services.parse(servicesJson);
export const events = contentSchemas.events.parse(eventsJson);
export const media = contentSchemas.media.parse(mediaJson);
export const donations = contentSchemas.donations.parse(donationsJson);
