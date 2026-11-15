"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, MoonStar, Sun, Sunrise } from "lucide-react";
import {
  fetchPrayerDay,
  format12Hour,
  formatDateLabel,
  getDublinDateParts,
  getPrayerTimesFallback,
  titlePrayer,
  type AsrSchool,
  type PrayerDay,
  type PrayerName,
} from "@/lib/prayer-utils";
import type { PrayerConfig } from "@/lib/schemas";

type ColumnKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
const columnOrder: ColumnKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

export function PrayerTimetableWidget({
  initialPrayerDay,
  config,
  jummah,
}: {
  initialPrayerDay: PrayerDay;
  config: PrayerConfig;
  jummah: PrayerConfig["jummah"];
}) {
  const [day, setDay] = useState(initialPrayerDay);
  const [school, setSchool] = useState<AsrSchool>(config.asrDefault);
  const isFriday = formatDateLabel(day.date, { weekday: "long" }) === "Friday";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("shuhada.asr-school");
      if (saved === "standard" || saved === "hanafi") setSchool(saved);
    } catch {
      // The published default remains available if local storage is blocked.
    }
  }, []);

  useEffect(() => {
    let active = true;
    const current = getDublinDateParts();
    setDay(getPrayerTimesFallback(current, config, school));
    void fetchPrayerDay(current, config, school).then((result) => {
      if (active) setDay(result);
    });
    return () => {
      active = false;
    };
  }, [config, school]);

  function chooseSchool(nextSchool: AsrSchool) {
    setSchool(nextSchool);
    try {
      window.localStorage.setItem("shuhada.asr-school", nextSchool);
    } catch {
      // The selection still applies for this visit.
    }
  }

  return (
    <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-5 md:-mt-12 md:px-8" aria-labelledby="prayer-times-heading">
      <div className="overflow-hidden rounded-[1.75rem] border border-forest/10 bg-white shadow-soft">
        <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              <CalendarDays size={14} /> Europe/Dublin ({config.latitude.toFixed(4)}, {config.longitude.toFixed(4)})
            </div>
            <h2 id="prayer-times-heading" className="mt-2 font-serif text-2xl text-forest md:text-3xl">
              Prayer times today
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatDateLabel(day.date)}
              {day.hijri ? ` · ${day.hijri}` : ""} · {day.source}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-parchment p-1" role="group" aria-label="Asr calculation">
            <button
              type="button"
              aria-pressed={school === "standard"}
              className={
                "rounded-full px-4 py-2 text-xs font-semibold transition " +
                (school === "standard" ? "bg-forest text-white" : "text-forest")
              }
              onClick={() => chooseSchool("standard")}
            >
              Standard Asr
            </button>
            <button
              type="button"
              aria-pressed={school === "hanafi"}
              className={
                "rounded-full px-4 py-2 text-xs font-semibold transition " +
                (school === "hanafi" ? "bg-forest text-white" : "text-forest")
              }
              onClick={() => chooseSchool("hanafi")}
            >
              Hanafi Asr
            </button>
          </div>
        </div>

        {/* 6-column live timetable grid */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {columnOrder.map((col) => {
            if (col === "sunrise") {
              return (
                <article className="bg-parchment/40 px-5 py-6 text-center md:px-4 md:py-7" key="sunrise">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-gold shadow-sm">
                    <Sunrise size={17} />
                  </div>
                  <h3 className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Sunrise</h3>
                  <p className="mt-3 text-[11px] text-slate-400">Shuruq</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-forest">{day.sunrise}</p>
                  <p className="mt-3 text-[11px] text-slate-400">Congregation</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Solar Rise</p>
                </article>
              );
            }
            const name: PrayerName = col;
            return (
              <article className="px-5 py-6 text-center md:px-4 md:py-7" key={name}>
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-parchment text-forest">
                  {name === "fajr" || name === "isha" ? <MoonStar size={17} /> : <Sun size={17} />}
                </div>
                <h3 className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{titlePrayer(name)}</h3>
                <p className="mt-3 text-[11px] text-slate-400">Adhan</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-forest">{day.prayers[name].adhan}</p>
                <p className="mt-3 text-[11px] text-slate-400">
                  {name === "dhuhr" && isFriday
                    ? "Jummah Salah"
                    : config.iqamahOffsetsConfirmed
                      ? "Iqamah"
                      : "Est. Iqamah"}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-gold">
                  {name === "dhuhr" && isFriday
                    ? jummah.map((item) => item.iqamah).join(" / ")
                    : day.prayers[name].iqamah}
                </p>
              </article>
            );
          })}
        </div>

        {/* Jummah Schedule Bar */}
        <div className="grid gap-px bg-slate-100 md:grid-cols-[1fr_1fr_auto]">
          {jummah.map((item) => (
            <div className="flex items-center justify-between bg-[#f5f3e9] px-6 py-4 md:px-8" key={item.name}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">{item.name}</p>
                <p className="mt-1 text-sm font-semibold text-forest">
                  Khutbah {format12Hour(item.khutbah)} ({item.khutbah})
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Iqamah (Salah) <strong className="text-forest">{format12Hour(item.iqamah)}</strong>
              </p>
            </div>
          ))}
          <a
            className="flex items-center justify-center gap-2 bg-forest px-6 py-4 text-sm font-semibold text-white transition hover:bg-forest-deep md:px-7"
            href="/timetable/"
          >
            Full monthly timetable <ArrowUpRight size={16} />
          </a>
        </div>
        {config.timetableNotes ? (
          <div className="grid gap-2 border-t border-slate-100 bg-parchment/40 px-6 py-3.5 text-xs text-slate-600 md:grid-cols-2 md:px-8">
            <p>
              <strong className="text-forest">Masjid Note:</strong> {config.timetableNotes.dailyNote}
            </p>
            <p className="md:text-right">
              <strong className="text-forest">Halal Store:</strong> {config.timetableNotes.halalStore.monSat} · {config.timetableNotes.halalStore.sunHolidays} ({config.timetableNotes.halalStore.note})
            </p>
          </div>
        ) : null}
        <p className="border-t border-slate-100 px-6 py-3 text-center text-[11px] text-slate-400 md:px-8 md:text-left">
          {day.source === "Official Masjid Timetable"
            ? "Published from the official Shuhada Foundation of Ireland monthly timetable (Europe/Dublin)."
            : "Times refresh from Aladhan (Europe/Dublin) with a deterministic astronomical Dublin fallback (53.3850, -6.3860)."}
        </p>
      </div>
    </section>
  );
}
