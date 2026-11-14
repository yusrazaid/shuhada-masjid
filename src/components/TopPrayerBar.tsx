"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import {
  dateKey,
  fetchPrayerDay,
  formatCountdown,
  getDublinDateParts,
  getPrayerTimesFallback,
  nextPrayerEvent,
  type PrayerDay,
} from "@/lib/prayer-utils";
import type { PrayerConfig } from "@/lib/schemas";

export function TopPrayerBar({ initialPrayerDay, config }: { initialPrayerDay: PrayerDay; config: PrayerConfig }) {
  const [today, setToday] = useState(initialPrayerDay);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    let loadedKey = "";
    const refresh = async () => {
      const currentDate = getDublinDateParts();
      const key = dateKey(currentDate);
      if (key === loadedKey) return;
      loadedKey = key;
      const localFallback = getPrayerTimesFallback(currentDate, config);
      setToday(localFallback);
      const live = await fetchPrayerDay(currentDate, config);
      if (active && loadedKey === key) setToday(live);
    };
    void refresh();
    const timer = window.setInterval(() => {
      const current = new Date();
      setNow(current);
      const currentKey = dateKey(getDublinDateParts(current));
      if (currentKey !== loadedKey) void refresh();
    }, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [config]);

  const next = useMemo(() => {
    if (!now) return null;
    const tomorrow = getPrayerTimesFallback(getDublinDateParts(now, 1), config);
    return nextPrayerEvent(now, today, tomorrow, config.jummah);
  }, [now, today, config]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-9 items-center justify-between bg-forest px-4 text-[11px] font-medium text-white md:px-8">
      <p className="hidden items-center gap-2 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Shaheed Bilal Masjid · Dublin 15</p>
      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-white/70"><Clock3 size={12} /> {next ? next.label + (next.label.endsWith("Iqamah") && !config.iqamahOffsetsConfirmed ? " (estimate)" : "") : "Fajr Adhan"}</span>
        <span className="font-semibold tabular-nums">{next ? formatCountdown(next.seconds) : today.prayers.fajr.adhan}</span>
        <a className="inline-flex items-center gap-1 font-semibold text-[#e6d3a1] hover:text-white" href="/timetable/">Timetable <ArrowUpRight size={12} /></a>
      </div>
    </div>
  );
}
