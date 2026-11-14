"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import {
  buildFallbackMonth,
  fetchPrayerMonth,
  format12Hour,
  formatDateLabel,
  getDublinDateParts,
  type AsrSchool,
  type PrayerMonthDay,
} from "@/lib/prayer-utils";
import type { PrayerConfig } from "@/lib/schemas";

export function PrayerMonthCalendar({
  initialRows,
  config,
}: {
  initialRows: PrayerMonthDay[];
  config: PrayerConfig;
}) {
  const first = initialRows[0]?.date ?? getDublinDateParts();
  const [month, setMonth] = useState({ year: first.year, month: first.month });
  const [rows, setRows] = useState(initialRows);
  const [school, setSchool] = useState<AsrSchool>(config.asrDefault);

  useEffect(() => {
    const current = getDublinDateParts();
    setMonth({ year: current.year, month: current.month });
    try {
      const saved = window.localStorage.getItem("shuhada.asr-school");
      if (saved === "standard" || saved === "hanafi") setSchool(saved);
    } catch {
      // Continue with the content default.
    }
  }, []);

  useEffect(() => {
    let active = true;
    setRows(buildFallbackMonth(month.year, month.month, config, school));
    void fetchPrayerMonth(month.year, month.month, config, school).then((result) => {
      if (active) setRows(result);
    });
    return () => { active = false; };
  }, [month, school, config]);

  function shiftMonth(amount: number) {
    const date = new Date(Date.UTC(month.year, month.month - 1 + amount, 1, 12));
    setMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  }

  function selectSchool(next: AsrSchool) {
    setSchool(next);
    try {
      window.localStorage.setItem("shuhada.asr-school", next);
    } catch {
      // The selection applies until this page is closed.
    }
  }

  const title = formatDateLabel({ year: month.year, month: month.month, day: 1 }, { month: "long", year: "numeric" });

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
      <div className="no-print mb-5 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest hover:bg-parchment" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ArrowLeft size={17} /></button>
          <h2 className="min-w-40 text-center font-serif text-xl text-forest">{title}</h2>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest hover:bg-parchment" aria-label="Next month" onClick={() => shiftMonth(1)}><ArrowRight size={17} /></button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-parchment p-1">
            <button type="button" aria-pressed={school === "standard"} onClick={() => selectSchool("standard")} className={"rounded-full px-4 py-2 text-xs font-semibold " + (school === "standard" ? "bg-forest text-white" : "text-forest")}>Standard Asr</button>
            <button type="button" aria-pressed={school === "hanafi"} onClick={() => selectSchool("hanafi")} className={"rounded-full px-4 py-2 text-xs font-semibold " + (school === "hanafi" ? "bg-forest text-white" : "text-forest")}>Hanafi Asr</button>
          </div>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deep"><Printer size={16} /> Print A4</button>
        </div>
      </div>
      <div className="print-heading hidden border-b border-black pb-3 text-black">
        <p className="text-xs uppercase tracking-widest">Shaheed Bilal Masjid · Europe/Dublin</p>
        <h2 className="mt-1 text-2xl font-bold">{title} Prayer Timetable</h2>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-forest/10 bg-white shadow-soft print:overflow-visible print:rounded-none print:border-black print:shadow-none">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm print:min-w-0 print:text-[9pt]">
          <caption className="sr-only">Monthly prayer timetable showing Adhan and Iqamah for Dublin</caption>
          <thead className="bg-forest text-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Fajr<span className="mt-1 block text-[10px] font-medium text-white/65">Adhan / {config.iqamahOffsetsConfirmed ? "Iqamah" : "Est. Iqamah"}</span></th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Sunrise<span className="mt-1 block text-[10px] font-medium text-white/65">Shuruq</span></th>
              {(["Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((name) => <th scope="col" className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" key={name}>{name}<span className="mt-1 block text-[10px] font-medium text-white/65">Adhan / {config.iqamahOffsetsConfirmed ? "Iqamah" : "Est. Iqamah"}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr className={index % 2 ? "bg-parchment/65" : "bg-white"} key={row.date.day}>
                <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-semibold text-forest">{row.weekday} {row.date.day}</th>
                <td className="whitespace-nowrap px-2 py-2.5 text-center tabular-nums text-slate-700">
                  {row.prayers.fajr.adhan}
                  <span className="text-gold"> / {row.prayers.fajr.iqamah}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-2.5 text-center tabular-nums text-slate-600">
                  {row.sunrise}
                </td>
                {(["dhuhr", "asr", "maghrib", "isha"] as const).map((name) => (
                  <td className="whitespace-nowrap px-2 py-2.5 text-center tabular-nums text-slate-700" key={name}>
                    {row.prayers[name].adhan}
                    <span className="text-gold"> / {name === "dhuhr" && row.weekday === "Fri" ? config.jummah.map((item) => item.iqamah).join(" · ") : row.prayers[name].iqamah}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-4 rounded-2xl border border-gold/20 bg-[#fcf9ef] p-5 text-sm text-slate-600 md:grid-cols-2">
        <p>
          Jummah: {config.jummah.map((slot) => `${slot.name} — Khutbah ${format12Hour(slot.khutbah)} | Iqamah (Salah) ${format12Hour(slot.iqamah)}`).join(" · ")}.
        </p>
        <p>{config.iqamahOffsetsConfirmed ? "Iqamah is calculated from confirmed configured offsets. On Fridays, the Dhuhr column shows the first and second Jummah Salah times." : "Iqamah values are estimates based on configured offsets that await masjid confirmation. On Fridays, the Dhuhr column shows the first and second Jummah Salah times."}</p>
      </div>
      <p className="mt-4 text-xs text-slate-400">Generated from Aladhan daily timings when available; Dublin astronomical fallback is used if the service cannot be reached.</p>
    </section>
  );
}
