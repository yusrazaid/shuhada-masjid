import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PrayerMonthCalendar } from "@/components/PrayerMonthCalendar";
import { loadCachedLiveContentState } from "@/lib/github-committer";
import { buildFallbackMonth, getDublinDateParts } from "@/lib/prayer-utils";

export const metadata: Metadata = {
  title: "Prayer timetable",
  description: "Dublin prayer and Iqamah times for Shaheed Bilal Masjid, with a printable monthly timetable.",
};

export default async function TimetablePage() {
  const live = await loadCachedLiveContentState();
  const siteConfig = live["site-config"];
  const prayerConfig = live["prayer-config"];

  const today = getDublinDateParts();
  const initialRows = buildFallbackMonth(today.year, today.month, prayerConfig, prayerConfig.asrDefault);
  return (
    <>
      <Navbar organizationName={siteConfig.organizationName} />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-24">
        <header className="no-print mx-auto max-w-7xl px-5 pb-10 pt-14 md:px-8">
          <a className="text-sm font-semibold text-forest underline-offset-4 hover:underline" href="/">← Back to home</a>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-gold">Europe/Dublin</p>
          <h1 className="mt-3 font-serif text-4xl text-forest md:text-6xl">Prayer timetable</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Daily prayer times are fetched from Aladhan and Iqamah is calculated from the published offsets. An astronomical Dublin fallback keeps the timetable available offline.
          </p>
        </header>
        <PrayerMonthCalendar initialRows={initialRows} config={prayerConfig} />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
