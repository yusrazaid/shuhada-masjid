"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Heart, MoonStar, School, Users, ArrowUpRight, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Service } from "@/lib/schemas";

const icons: Record<Service["icon"], LucideIcon> = {
  moon: MoonStar,
  book: BookOpen,
  users: Users,
  heart: Heart,
  school: School,
};

export function ServicesGrid({ items }: { items: Service[] }) {
  const [selected, setSelected] = useState<Service | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "Tab") {
        const dialog = document.getElementById("service-dialog");
        const focusable = dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!focusable?.length) return;
        const first = focusable.item(0);
        const last = focusable.item(focusable.length - 1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.setTimeout(() => document.getElementById("service-dialog-close")?.focus(), 0);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastTrigger.current?.focus();
    };
  }, [selected]);

  return (
    <section id="services" className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Here for the community</p>
          <h2 className="mt-3 font-serif text-4xl text-forest md:text-5xl">Services and support</h2>
          <p className="mt-5 leading-7 text-slate-600">Explore what the Foundation offers and contact the team for current availability and details.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <button key={item.id} type="button" onClick={(event) => { lastTrigger.current = event.currentTarget; setSelected(item); }} className="group rounded-3xl border border-forest/10 bg-parchment p-7 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest shadow-sm transition group-hover:bg-forest group-hover:text-[#e6d3a1]"><Icon size={22} /></span>
                <h3 className="mt-6 font-serif text-2xl text-forest">{item.title}</h3>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{item.summary}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest">Learn more <ArrowUpRight size={15} /></span>
              </button>
            );
          })}
        </div>
      </div>
      {selected ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-forest/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section id="service-dialog" role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Community services</p><h2 id="service-dialog-title" className="mt-2 font-serif text-3xl text-forest">{selected.title}</h2></div>
              <button id="service-dialog-close" type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-parchment text-forest" aria-label="Close service details" onClick={() => setSelected(null)}><X size={19} /></button>
            </div>
            <p className="mt-5 leading-7 text-slate-600">{selected.details}</p>
            <a
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deep"
              href={selected.actionHref}
              target={selected.actionHref.startsWith("https://") ? "_blank" : undefined}
              rel={selected.actionHref.startsWith("https://") ? "noreferrer" : undefined}
            >
              {selected.actionLabel} <ArrowUpRight size={15} />
            </a>
          </section>
        </div>
      ) : null}
    </section>
  );
}
