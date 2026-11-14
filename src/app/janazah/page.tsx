import type { Metadata } from "next";
import { CheckCircle2, HeartHandshake, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Janazah and bereavement guide",
  description: "First steps and a family checklist for arranging Janazah support in Dublin.",
};

const checklist = [
  "Contact the doctor or relevant emergency service and follow their instructions.",
  "Let close family know and identify one person to coordinate calls and documents.",
  "Contact Shaheed Bilal Masjid to ask about current Janazah support and availability.",
  "Confirm arrangements with the family, relevant authorities and chosen funeral provider.",
  "Ask the masjid team about washing, shrouding, prayer and burial arrangements that can be supported.",
  "Keep identification and any documents requested by the relevant authorities together.",
];

export default function JanazahPage() {
  return (
    <>
      <Navbar organizationName={siteConfig.organizationName} />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-24">
        <header className="bg-forest px-5 py-16 text-white md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl">
            <a className="text-sm text-white/70 underline-offset-4 hover:underline" href="/">← Back to home</a>
            <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold"><HeartHandshake /></div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-gold">Bereavement support</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">Janazah and family guide</h1>
            <p className="mt-6 max-w-2xl leading-8 text-white/75">
              We are sorry for your loss. This page offers a starting checklist. Arrangements and availability can change, so please contact the Foundation to confirm current support.
            </p>
            <a className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-forest-deep" href="tel:+35318218748"><Phone size={17} /> Call 01 821 8748</a>
          </div>
        </header>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1fr_0.72fr]">
          <section>
            <h2 className="font-serif text-3xl text-forest">First steps</h2>
            <p className="mt-4 leading-7 text-slate-600">
              If someone has died unexpectedly or there is immediate concern, call 112 or 999. For other circumstances, follow the instructions of the doctor, hospital, coroner or other authority involved. The steps and documents required depend on the circumstances.
            </p>
            <ul className="mt-8 space-y-4" aria-label="Janazah and family checklist">
              {checklist.map((item, index) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm transition has-[:checked]:border-gold/50 has-[:checked]:bg-[#fcf9ef]">
                    <input className="mt-2 h-4 w-4 shrink-0 accent-forest" type="checkbox" />
                    <span className="flex-1 leading-7 text-slate-700">{item}</span>
                    <span className="pt-1 text-xs font-semibold text-slate-400">{index + 1}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <aside className="h-fit rounded-3xl bg-white p-7 shadow-soft">
            <h2 className="font-serif text-2xl text-forest">Contact the masjid</h2>
            <p className="mt-4 leading-7 text-slate-600">Please confirm the current arrangements, availability and next steps directly with the team.</p>
            <a className="mt-6 block rounded-xl bg-forest px-5 py-4 text-center font-semibold text-white" href="tel:+35318218748">Call 01 821 8748</a>
            <a className="mt-3 block rounded-xl border border-forest/20 px-5 py-4 text-center font-semibold text-forest" href="mailto:info@shuhadafoundation.com?subject=Janazah%20Support">Email the Foundation</a>
            <p className="mt-6 text-sm leading-6 text-slate-500">Warrenstown House, Blanchardstown, Dublin 15, D15 ET27.</p>
          </aside>
        </div>
        <section className="mx-auto mb-16 max-w-5xl px-5 md:px-8">
          <div className="flex gap-4 rounded-2xl border border-gold/30 bg-[#FCF9EF] p-6">
            <CheckCircle2 className="mt-1 shrink-0 text-gold" />
            <p className="text-sm leading-7 text-slate-600">This guide is general information, not medical, legal or funeral-provider advice. Follow the directions of the relevant professionals and authorities, and confirm current masjid arrangements with the Foundation.</p>
          </div>
        </section>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
