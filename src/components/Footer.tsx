"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, MoonStar } from "lucide-react";
import type { SiteConfig } from "@/lib/schemas";

export function Footer({ config }: { config: SiteConfig }) {
  const [email, setEmail] = useState("");
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  function prepareNewsletterEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = encodeURIComponent("Please add this address to the newsletter list: " + email);
    window.location.href = "mailto:" + config.email + "?subject=Newsletter%20Enquiry&body=" + body;
  }

  return (
    <footer id="contact" className="bg-forest px-5 pb-7 pt-14 text-white md:px-8 md:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <a href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#e6d3a1]"><MoonStar size={21} /></span>
            <span className="font-bold tracking-[0.12em]">SHUHADA FOUNDATION</span>
          </a>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">{config.description}</p>
          <p className="mt-5 text-xs leading-6 text-white/50">{config.legalCharityName}<br />Charities Regulator No. {config.charitiesRegulatorNumber}<br />Revenue charity tax No. {config.revenueCharityTaxNumber}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <a className="hover:text-white" href="/timetable/">Prayer timetable</a>
            <a className="hover:text-white" href="/janazah/">Janazah guide</a>
            <a className="hover:text-white" href="/governance/">Governance</a>
            <a className="hover:text-white" href="/privacy/">Privacy and cookies</a>
            <a className="hover:text-white" href="/presence.json">Presence feed</a>
            <a className="hover:text-white" href="/events.ics">Events calendar</a>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Sister schools</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {config.sisterSchools.map((school) => <a className="inline-flex items-start gap-1 hover:text-white" key={school.url} href={school.url} target="_blank" rel="noreferrer">{school.name} <ArrowUpRight className="mt-0.5 shrink-0" size={13} /></a>)}
          </div>
          <form className="mt-7" onSubmit={prepareNewsletterEmail}>
            <label className="text-sm font-semibold text-white" htmlFor="newsletter-email">Newsletter enquiry</label>
            <div className="mt-3 flex gap-2">
              <input id="newsletter-email" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button className="rounded-xl bg-[#c6a45d] px-4 text-sm font-bold text-forest-deep hover:bg-[#d8ba77]" type="submit">Email</button>
            </div>
            <p className="mt-2 text-[11px] text-white/45">Opens an email draft; this website does not collect your address.</p>
          </form>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year ?? ""} {config.organizationName}. All rights reserved.</p>
        <a className="hover:text-white" href={"mailto:" + config.email}>{config.email}</a>
      </div>
    </footer>
  );
}
