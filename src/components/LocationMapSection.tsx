"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, MapPin, Phone } from "lucide-react";
import type { SiteConfig } from "@/lib/schemas";

export function LocationMapSection({ config }: { config: SiteConfig }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyEircode() {
    try {
      await navigator.clipboard.writeText(config.address.eircode);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 3500);
    }
  }

  const latitude = config.coordinates.latitude.toFixed(4);
  const longitude = config.coordinates.longitude.toFixed(4);
  const mapsUrl = "https://maps.google.com/?q=" + latitude + "," + longitude;
  const wazeUrl = "https://waze.com/ul?ll=" + latitude + "%2C" + longitude + "&navigate=yes";
  const osmUrl = "https://www.openstreetmap.org/?mlat=" + latitude + "&mlon=" + longitude + "#map=16/" + latitude + "/" + longitude;

  return (
    <section id="location" className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] bg-parchment p-7 md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Plan your visit</p>
          <h2 className="mt-3 font-serif text-4xl text-forest">Find the masjid</h2>
          <p className="mt-5 leading-7 text-slate-600">{config.address.formatted}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold text-forest">{config.address.eircode}</span>
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-white" onClick={copyEircode} aria-live="polite">
              {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy Eircode"}
            </button>
          </div>
          {copyError ? <p className="mt-2 text-xs text-slate-500" aria-live="polite">Copy is unavailable here. Select the Eircode text to copy it.</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deep" href={mapsUrl} target="_blank" rel="noreferrer">Google Maps <ExternalLink size={14} /></a>
            <a className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest hover:bg-white" href={wazeUrl} target="_blank" rel="noreferrer">Waze <ExternalLink size={14} /></a>
          </div>
          <a className="mt-7 flex items-center gap-3 border-t border-forest/10 pt-6 text-sm font-semibold text-forest" href="tel:+35318218748"><Phone className="text-gold" size={18} /> 01 821 8748</a>
          <p className="mt-4 text-xs leading-5 text-slate-400">Coordinates {latitude}, {longitude} · Europe/Dublin</p>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-forest/10 bg-parchment">
          <iframe
            className="map-frame h-[360px] w-full md:h-[460px]"
            title="OpenStreetMap location for Shaheed Bilal Masjid"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={"https://www.openstreetmap.org/export/embed.html?bbox=-6.44%2C53.35%2C-6.32%2C53.42&layer=mapnik&marker=" + latitude + "%2C" + longitude}
          />
          <div className="flex flex-col gap-2 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-slate-600"><MapPin size={16} className="text-gold" /> Map data © OpenStreetMap contributors</span>
            <a className="font-semibold text-forest underline underline-offset-4" href={osmUrl} target="_blank" rel="noreferrer">Open larger map</a>
          </div>
        </div>
      </div>
    </section>
  );
}
