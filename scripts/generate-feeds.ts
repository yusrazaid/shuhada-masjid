import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { announcements, donations, events, prayerConfig, siteConfig } from "../src/lib/content";
import { dateKey, getDublinDateParts, getPrayerTimesFallback } from "../src/lib/prayer-utils";

const root = process.cwd();
const publicDirectory = join(root, "public");
mkdirSync(publicDirectory, { recursive: true });

const today = getDublinDateParts();
const prayerDay = getPrayerTimesFallback(today, prayerConfig);
const presence = {
  generatedAt: new Date().toISOString(),
  identity: {
    organization: siteConfig.organizationName,
    masjid: siteConfig.masjidName,
    legalCharity: siteConfig.legalCharityName,
    charitiesRegulatorNumber: siteConfig.charitiesRegulatorNumber,
    revenueCharityTaxNumber: siteConfig.revenueCharityTaxNumber,
  },
  location: {
    address: siteConfig.address,
    latitude: siteConfig.coordinates.latitude,
    longitude: siteConfig.coordinates.longitude,
    timezone: siteConfig.timezone,
  },
  contact: {
    phone: siteConfig.phone,
    email: siteConfig.email,
    website: siteConfig.domains.primary,
  },
  prayerTimes: {
    date: dateKey(today),
    source: "Dublin astronomical fallback; the live site refreshes from Aladhan",
    sunrise: prayerDay.sunrise,
    adhan: Object.fromEntries(Object.entries(prayerDay.prayers).map(([name, value]) => [name, value.adhan])),
    iqamah: Object.fromEntries(Object.entries(prayerDay.prayers).map(([name, value]) => [name, value.iqamah])),
    jummah: prayerConfig.jummah,
    calculation: {
      aladhanMethod: prayerConfig.aladhanMethod,
      asrDefault: prayerConfig.asrDefault,
      iqamahOffsetsConfirmed: prayerConfig.iqamahOffsetsConfirmed,
      iqamahOffsetsMinutes: prayerConfig.iqamahOffsetsMinutes,
    },
  },
  announcements: announcements.announcements.filter((announcement) => announcement.active).map(({ id, message }) => ({ id, message })),
  donationOptions: {
    bankTransferEnabled: donations.bankTransferEnabled,
    onlineDonationEnabled: donations.onlineDonationEnabled,
  },
};
writeFileSync(join(publicDirectory, "presence.json"), JSON.stringify(presence, null, 2) + "\n");

function icalEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icalUtc(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldIcalLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const character of line) {
    const width = new TextEncoder().encode(character).length;
    if (bytes + width > 75) {
      parts.push(current);
      current = " " + character;
      bytes = 1 + width;
    } else {
      current += character;
      bytes += width;
    }
  }
  parts.push(current);
  return parts.join("\r\n");
}

const stamp = icalUtc(new Date().toISOString());
const jummahLines = prayerConfig.jummah.flatMap((slot, index) => {
  const [khutbahHour, khutbahMinute] = slot.khutbah.split(":").map(Number);
  const [iqamahHour, iqamahMinute] = slot.iqamah.split(":").map(Number);
  const dtStart = `20260102T${String(khutbahHour).padStart(2, "0")}${String(khutbahMinute).padStart(2, "0")}00`;
  const endMinutesTotal = iqamahHour * 60 + iqamahMinute + 20;
  const endHour = Math.floor(endMinutesTotal / 60);
  const endMinute = endMinutesTotal % 60;
  const dtEnd = `20260102T${String(endHour).padStart(2, "0")}${String(endMinute).padStart(2, "0")}00`;
  return [
    "BEGIN:VEVENT",
    `UID:jummah-${index + 1}@shuhadafoundation.com`,
    "DTSTAMP:" + stamp,
    `DTSTART;TZID=Europe/Dublin:${dtStart}`,
    `DTEND;TZID=Europe/Dublin:${dtEnd}`,
    "RRULE:FREQ=WEEKLY;BYDAY=FR",
    "SUMMARY:" + icalEscape(`${slot.name} — Shaheed Bilal Masjid`),
    "DESCRIPTION:" +
      icalEscape(
        `${slot.name} at Shaheed Bilal Masjid (Shuhada Foundation of Ireland). Khutbah: ${slot.khutbah}, Iqamah (Salah): ${slot.iqamah}.`,
      ),
    "LOCATION:" + icalEscape(siteConfig.address.formatted),
    "END:VEVENT",
  ];
});
const eventLines = events.events.flatMap((event) => {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000);
  const lines = [
    "BEGIN:VEVENT",
    "UID:" + icalEscape(event.id) + "@shuhadafoundation.com",
    "DTSTAMP:" + stamp,
    "DTSTART:" + icalUtc(start.toISOString()),
    "DTEND:" + icalUtc(end.toISOString()),
    "SUMMARY:" + icalEscape(event.title),
    "DESCRIPTION:" + icalEscape(event.description),
    "LOCATION:" + icalEscape(event.location),
  ];
  if (event.url) lines.push("URL:" + event.url);
  lines.push("END:VEVENT");
  return lines;
});
const calendar = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Shuhada Foundation of Ireland//Community Events//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:Shuhada Foundation of Ireland",
  "X-WR-TIMEZONE:Europe/Dublin",
  ...jummahLines,
  ...eventLines,
  "END:VCALENDAR",
];
writeFileSync(join(publicDirectory, "events.ics"), calendar.map(foldIcalLine).join("\r\n") + "\r\n");
console.log("Generated presence.json and events.ics");
