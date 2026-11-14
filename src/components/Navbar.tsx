"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Menu, MoonStar, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Prayer times", href: "/timetable/" },
  { label: "Services", href: "/#services" },
  { label: "Masjid project", href: "/#construction" },
  { label: "Events", href: "/#events" },
  { label: "Visit", href: "/#location" },
];

export function Navbar({ organizationName, withPrayerBar = false }: { organizationName: string; withPrayerBar?: boolean }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      menuButton.current?.focus();
    };
  }, [open]);

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
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

  return (
    <>
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-forest" href="#main-content">Skip to content</a>
      <nav aria-label="Main navigation" className={"fixed inset-x-0 z-40 border-b border-white/50 bg-white/90 shadow-sm backdrop-blur-xl " + (withPrayerBar ? "top-9" : "top-0")}>
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="/" className="flex items-center gap-3" aria-label={organizationName + " home"}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-gold"><MoonStar size={22} strokeWidth={1.8} /></span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-[0.12em] text-forest">SHUHADA</span>
              <span className="block text-[10px] font-semibold tracking-[0.13em] text-slate-500">FOUNDATION OF IRELAND</span>
            </span>
          </a>
          <div className="hidden items-center gap-7 lg:flex">
            {links.slice(1, 5).map((link) => <a key={link.href} className="text-sm font-semibold text-slate-700 transition hover:text-gold" href={link.href}>{link.label}</a>)}
            <a className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-deep" href="/#donate">Ways to give</a>
          </div>
          <button
            ref={menuButton}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest/15 text-forest lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls={open ? "mobile-navigation" : undefined}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
      {open ? (
        <div
          className="fixed inset-0 z-[60] bg-forest/55 backdrop-blur-sm lg:hidden"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
          onKeyDown={onDialogKeyDown}
        >
          <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" className="ml-auto flex h-full w-[min(88vw,25rem)] flex-col bg-parchment p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-forest/10 pb-5">
              <p className="font-semibold text-forest">Navigation</p>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest" aria-label="Close navigation menu" onClick={() => setOpen(false)} autoFocus><X size={20} /></button>
            </div>
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1 py-5">
              {links.map((link) => (
                <a key={link.href} className="rounded-xl px-4 py-4 text-base font-semibold text-forest hover:bg-white" href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
              ))}
              <a className="mt-3 rounded-xl bg-forest px-4 py-4 text-base font-semibold text-white" href="/#donate" onClick={() => setOpen(false)}>Ways to give</a>
            </nav>
            <a className="mt-auto border-t border-forest/10 pt-5 text-sm text-slate-500" href="tel:+35318218748">Call 01 821 8748</a>
          </div>
        </div>
      ) : null}
    </>
  );
}
