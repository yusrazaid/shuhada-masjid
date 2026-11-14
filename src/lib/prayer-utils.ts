import type { PrayerConfig } from "./schemas";

export type DateParts = { year: number; month: number; day: number };
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type AsrSchool = "standard" | "hanafi";

export type PrayerDay = {
  date: DateParts;
  sunrise: string;
  prayers: Record<PrayerName, { adhan: string; iqamah: string }>;
  source: "Aladhan" | "Dublin astronomical fallback";
};

export type PrayerMonthDay = PrayerDay & { weekday: string };

const prayerNames: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const degrees = Math.PI / 180;

export function getDublinDateParts(date: Date = new Date(), offsetDays = 0): DateParts {
  const parts = new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return offsetDays === 0 ? { year, month, day } : addDays({ year, month, day }, offsetDays);
}

export function addDays(date: DateParts, amount: number): DateParts {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + amount, 12));
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

export function dateKey(date: DateParts): string {
  return date.year.toString().padStart(4, "0") + "-" +
    date.month.toString().padStart(2, "0") + "-" +
    date.day.toString().padStart(2, "0");
}

export function formatDateLabel(date: DateParts, options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}): string {
  return new Intl.DateTimeFormat("en-IE", { ...options, timeZone: "Europe/Dublin" })
    .format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)));
}

function dayOfYear(date: DateParts): number {
  const current = Date.UTC(date.year, date.month - 1, date.day);
  const start = Date.UTC(date.year, 0, 0);
  return Math.floor((current - start) / 86_400_000);
}

function dublinUtcOffsetMinutes(date: DateParts): number {
  const instant = new Date(Date.UTC(date.year, date.month - 1, date.day, 12));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    timeZoneName: "shortOffset",
  }).formatToParts(instant);
  const zone = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

function solarTerms(date: DateParts): { declination: number; equationMinutes: number } {
  const gamma = (2 * Math.PI / 365) * (dayOfYear(date) - 1);
  const equationMinutes = 229.18 * (
    0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)
  );
  const declination =
    0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  return { declination, equationMinutes };
}

function clockFromMinutes(minutes: number): string {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return Math.floor(normalized / 60).toString().padStart(2, "0") + ":" +
    (normalized % 60).toString().padStart(2, "0");
}

function minutesFromClock(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function solarTimeAtAltitude(
  altitudeDegrees: number,
  latitude: number,
  declination: number,
  solarNoon: number,
  direction: "before" | "after",
): number | null {
  const phi = latitude * degrees;
  const altitude = altitudeDegrees * degrees;
  const cosineHourAngle =
    (Math.sin(altitude) - Math.sin(phi) * Math.sin(declination)) /
    (Math.cos(phi) * Math.cos(declination));
  if (!Number.isFinite(cosineHourAngle) || cosineHourAngle < -1 || cosineHourAngle > 1) return null;
  const hourAngle = Math.acos(cosineHourAngle) / degrees;
  return solarNoon + (direction === "after" ? 1 : -1) * 4 * hourAngle;
}

export function getPrayerTimesFallback(
  date: DateParts,
  config: PrayerConfig,
  school: AsrSchool = config.asrDefault,
): PrayerDay {
  const { declination, equationMinutes } = solarTerms(date);
  const offset = dublinUtcOffsetMinutes(date);
  const solarNoon = 720 - 4 * config.longitude - equationMinutes + offset;
  const latitude = config.latitude;
  const sunrise = solarTimeAtAltitude(-0.833, latitude, declination, solarNoon, "before") ?? solarNoon - 240;
  const sunset = solarTimeAtAltitude(-0.833, latitude, declination, solarNoon, "after") ?? solarNoon + 240;
  const fajrExact = solarTimeAtAltitude(-18, latitude, declination, solarNoon, "before");
  const ishaExact = solarTimeAtAltitude(-17, latitude, declination, solarNoon, "after");
  const night = Math.max(0, 1440 - (sunset - sunrise));
  const twilightFallback = Math.max(65, Math.min(115, night / 3));
  const fajr = fajrExact ?? sunrise - twilightFallback;
  const isha = ishaExact ?? sunset + twilightFallback;

  const asrFactor = school === "hanafi" ? 2 : 1;
  const latitudeRadians = latitude * degrees;
  const shadowAltitude = Math.atan(1 / (asrFactor + Math.tan(Math.abs(latitudeRadians - declination))));
  const asr = solarTimeAtAltitude(shadowAltitude / degrees, latitude, declination, solarNoon, "after") ?? solarNoon + 180;
  const adhanTimes: Record<PrayerName, string> = {
    fajr: clockFromMinutes(fajr),
    dhuhr: clockFromMinutes(solarNoon),
    asr: clockFromMinutes(asr),
    maghrib: clockFromMinutes(sunset),
    isha: clockFromMinutes(isha),
  };
  return withIqamah(date, clockFromMinutes(sunrise), adhanTimes, config, "Dublin astronomical fallback");
}

function withIqamah(
  date: DateParts,
  sunrise: string,
  adhan: Record<PrayerName, string>,
  config: PrayerConfig,
  source: PrayerDay["source"],
): PrayerDay {
  const prayers = {} as PrayerDay["prayers"];
  for (const name of prayerNames) {
    prayers[name] = {
      adhan: adhan[name],
      iqamah: clockFromMinutes(minutesFromClock(adhan[name]) + config.iqamahOffsetsMinutes[name]),
    };
  }
  return { date, sunrise, prayers, source };
}

function cleanApiTime(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  return match[1].padStart(2, "0") + ":" + match[2];
}

function apiDate(date: DateParts): string {
  return date.day.toString().padStart(2, "0") + "-" +
    date.month.toString().padStart(2, "0") + "-" + date.year;
}

export async function fetchPrayerDay(
  date: DateParts,
  config: PrayerConfig,
  school: AsrSchool = config.asrDefault,
): Promise<PrayerDay> {
  const fallback = getPrayerTimesFallback(date, config, school);
  const params = new URLSearchParams({
    latitude: String(config.latitude),
    longitude: String(config.longitude),
    method: String(config.aladhanMethod),
    school: school === "hanafi" ? "1" : "0",
    timezonestring: config.timezone,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/timings/" + apiDate(date) + "?" + params.toString(),
      { signal: controller.signal, cache: "no-store" },
    );
    if (!response.ok) return fallback;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return fallback;
    const data = (payload as { data?: { timings?: Record<string, unknown> } }).data;
    const timings = data?.timings;
    if (!timings) return fallback;
    const parsed: Partial<Record<PrayerName, string>> = {
      fajr: cleanApiTime(timings.Fajr),
      dhuhr: cleanApiTime(timings.Dhuhr),
      asr: cleanApiTime(timings.Asr),
      maghrib: cleanApiTime(timings.Maghrib),
      isha: cleanApiTime(timings.Isha),
    };
    if (prayerNames.some((name) => !parsed[name])) return fallback;
    const sunrise = cleanApiTime(timings.Sunrise) ?? fallback.sunrise;
    return withIqamah(date, sunrise, parsed as Record<PrayerName, string>, config, "Aladhan");
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export function buildFallbackMonth(year: number, month: number, config: PrayerConfig, school: AsrSchool): PrayerMonthDay[] {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => {
    const date = { year, month, day: index + 1 };
    return {
      ...getPrayerTimesFallback(date, config, school),
      weekday: formatDateLabel(date, { weekday: "short" }),
    };
  });
}

export async function fetchPrayerMonth(
  year: number,
  month: number,
  config: PrayerConfig,
  school: AsrSchool,
): Promise<PrayerMonthDay[]> {
  const fallback = buildFallbackMonth(year, month, config, school);
  const params = new URLSearchParams({
    latitude: String(config.latitude),
    longitude: String(config.longitude),
    method: String(config.aladhanMethod),
    school: school === "hanafi" ? "1" : "0",
    timezonestring: config.timezone,
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/calendar/" + year + "/" + month + "?" + params.toString(),
      { signal: controller.signal, cache: "no-store" },
    );
    if (!response.ok) return fallback;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return fallback;
    const data = (payload as { data?: Array<{ date?: { gregorian?: { day?: string } }; timings?: Record<string, unknown> }> }).data;
    if (!Array.isArray(data) || data.length !== fallback.length) return fallback;
    const mapped = data.map((entry, index) => {
      const timings = entry.timings;
      if (!timings) return fallback[index];
      const parsed: Partial<Record<PrayerName, string>> = {
        fajr: cleanApiTime(timings.Fajr),
        dhuhr: cleanApiTime(timings.Dhuhr),
        asr: cleanApiTime(timings.Asr),
        maghrib: cleanApiTime(timings.Maghrib),
        isha: cleanApiTime(timings.Isha),
      };
      if (prayerNames.some((name) => !parsed[name])) return fallback[index];
      const date = { year, month, day: index + 1 };
      const sunrise = cleanApiTime(timings.Sunrise) ?? fallback[index].sunrise;
      const day = withIqamah(date, sunrise, parsed as Record<PrayerName, string>, config, "Aladhan");
      return { ...day, weekday: formatDateLabel(date, { weekday: "short" }) };
    });
    return mapped;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export function nextPrayerEvent(
  now: Date,
  today: PrayerDay,
  tomorrow: PrayerDay,
  jummah: PrayerConfig["jummah"] = [],
): {
  label: string;
  time: string;
  seconds: number;
} {
  const parts = new Intl.DateTimeFormat("en-IE", {
    timeZone: "Europe/Dublin",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const second = Number(parts.find((part) => part.type === "second")?.value ?? 0);
  const nowSeconds = hour * 3600 + minute * 60 + second;
  const weekday = new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", weekday: "long" }).format(now);
  const events = prayerNames.flatMap((name) => {
    if (name === "dhuhr" && weekday === "Friday") {
      return [
        { label: "Dhuhr Adhan", time: today.prayers.dhuhr.adhan },
        ...jummah.flatMap((item) => [
          { label: item.name + " Khutbah", time: item.khutbah },
          { label: item.name + " Salah", time: item.iqamah },
        ]),
      ];
    }
    return [
      { label: titlePrayer(name) + " Adhan", time: today.prayers[name].adhan },
      { label: titlePrayer(name) + " Iqamah", time: today.prayers[name].iqamah },
    ];
  }).sort((a, b) => a.time.localeCompare(b.time));
  const next = events.find((event) => {
    const [h, m] = event.time.split(":").map(Number);
    return h * 3600 + m * 60 > nowSeconds;
  });
  if (next) {
    const [h, m] = next.time.split(":").map(Number);
    return { ...next, seconds: h * 3600 + m * 60 - nowSeconds };
  }
  const time = tomorrow.prayers.fajr.adhan;
  const [h, m] = time.split(":").map(Number);
  return { label: "Fajr Adhan", time, seconds: 86_400 - nowSeconds + h * 3600 + m * 60 };
}

export function titlePrayer(name: PrayerName): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function format12Hour(clock24: string): string {
  const [hStr, mStr] = clock24.split(":");
  const h = Number(hStr);
  if (!Number.isFinite(h) || !mStr) return clock24;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return hour12.toString().padStart(2, "0") + ":" + mStr + " " + period;
}

export function formatCountdown(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  return [hours, minutes, remainder].map((value) => value.toString().padStart(2, "0")).join(":");
}
