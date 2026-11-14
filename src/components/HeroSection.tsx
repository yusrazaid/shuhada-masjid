import { ArrowUpRight, CalendarClock, Heart, MapPin } from "lucide-react";
import { format12Hour } from "@/lib/prayer-utils";
import type { PrayerConfig } from "@/lib/schemas";

const defaultJummah: PrayerConfig["jummah"] = [
  { name: "1st Jummah", khutbah: "12:30", iqamah: "12:55" },
  { name: "2nd Jummah", khutbah: "13:20", iqamah: "13:45" },
];

export function HeroSection({ jummah = defaultJummah }: { jummah?: PrayerConfig["jummah"] }) {
  return (
    <section className="hero-photo relative flex min-h-[680px] items-center overflow-hidden pt-24 text-white md:min-h-[720px]">
      <div className="subtle-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute -right-32 top-24 h-[32rem] w-[32rem] rounded-full border border-white/10" aria-hidden="true" />
      <div className="absolute -right-12 top-44 h-[22rem] w-[22rem] rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="font-arabic text-2xl text-[#e6d3a1] md:text-3xl" lang="ar" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/90">
            <MapPin size={13} className="text-[#e6d3a1]" /> Warrenstown House · Blanchardstown · Dublin 15 · D15 ET27
          </div>
          <h1 className="mt-6 font-serif text-5xl leading-[1.03] md:text-7xl lg:text-[5.25rem]">
            A sanctuary to <span className="italic text-[#e6d3a1]">pray,</span>
            <br />
            learn and belong.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
            Welcome to <strong>Shaheed Bilal Masjid</strong> (Islamic Cultural and Education Centre) and the{" "}
            <strong>Shuhada Foundation of Ireland</strong> in Blanchardstown, Dublin 15.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-[#c6a45d] px-6 py-3.5 text-sm font-bold text-forest-deep transition hover:bg-[#d8ba77]"
              href="#donate"
            >
              <Heart size={16} /> Donate &amp; Support
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              href="#location"
            >
              <MapPin size={16} /> Get Directions <ArrowUpRight size={15} />
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-6 py-3.5 text-sm font-semibold text-[#e6d3a1] transition hover:bg-white/15 hover:text-white"
              href="/timetable/"
            >
              <CalendarClock size={16} /> Monthly Timetable
            </a>
          </div>
        </div>
        <aside className="rounded-[1.75rem] border border-white/15 bg-[#0a241a]/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e6d3a1]">Visit Shaheed Bilal Masjid</p>
          <h2 className="mt-3 font-serif text-3xl leading-snug">Warrenstown House</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Blanchardstown, Dublin 15, D15 ET27, Ireland
            <br />
            150+ on-site parking spaces · Dedicated sisters&apos; prayer rooms
          </p>
          <div className="mt-6 border-t border-white/15 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#e6d3a1]">Friday Jummah Schedule</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {jummah.map((slot) => (
                <div className="rounded-xl bg-white/10 px-4 py-3" key={slot.name}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">{slot.name}</p>
                  <p className="mt-1 text-sm text-white/85">
                    Khutbah: <strong className="text-white">{format12Hour(slot.khutbah)}</strong>
                  </p>
                  <p className="text-sm text-[#e6d3a1]">
                    Iqamah (Salah): <strong>{format12Hour(slot.iqamah)}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/70">
            <span>Tel: 01 821 8748</span>
            <a className="inline-flex items-center gap-1 font-semibold text-[#e6d3a1] hover:text-white" href="#location">
              Map &amp; Eircode <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
