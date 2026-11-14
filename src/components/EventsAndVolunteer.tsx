"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, CalendarPlus, HeartHandshake } from "lucide-react";
import type { EventEntry } from "@/lib/schemas";

type EventsContent = {
  events: EventEntry[];
  programmes: { title: string; description: string }[];
};

export function EventsAndVolunteer({ events }: { events: EventsContent }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");

  function submitVolunteer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent("Volunteer enquiry");
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nArea of interest: " + interest);
    window.location.href = "mailto:info@shuhadafoundation.com?subject=" + subject + "&body=" + body;
  }

  return (
    <section id="events" className="bg-parchment px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Come together</p>
          <h2 className="mt-3 font-serif text-4xl text-forest md:text-5xl">Events and programmes</h2>
          <p className="mt-5 max-w-xl leading-7 text-slate-600">Check this calendar for confirmed events. If no dates are listed, contact the Foundation to ask about current programmes.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deep" href="/events.ics"><CalendarPlus size={16} /> Subscribe to calendar</a>
            <a className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest hover:bg-white" href="mailto:info@shuhadafoundation.com?subject=Events%20Enquiry">Ask about events <ArrowUpRight size={15} /></a>
          </div>
          <div className="mt-8 space-y-3">
            {events.events.length ? events.events.map((eventItem) => (
              <article className="rounded-2xl border border-forest/10 bg-white p-5" key={eventItem.id}>
                <div className="flex gap-3">
                  <CalendarDays className="mt-1 shrink-0 text-gold" size={19} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-forest">{eventItem.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{new Date(eventItem.start).toLocaleString("en-IE", { timeZone: "Europe/Dublin", dateStyle: "medium", timeStyle: "short" })}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{eventItem.description}</p>
                    {eventItem.url ? <a className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest underline" href={eventItem.url} rel="noreferrer" target="_blank">Event details <ArrowUpRight size={14} /></a> : null}
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-forest/20 bg-white/60 p-7">
                <p className="font-semibold text-forest">No upcoming dates published</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">The calendar will show dates after they are confirmed by the Foundation.</p>
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {events.programmes.map((programme) => <article key={programme.title} className="rounded-2xl bg-white p-5"><p className="font-semibold text-forest">{programme.title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{programme.description}</p></article>)}
          </div>
        </div>
        <aside className="rounded-[1.75rem] bg-forest p-7 text-white shadow-soft md:p-9">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e6d3a1]"><HeartHandshake size={22} /></span>
          <h3 className="mt-6 font-serif text-3xl">Volunteer with us</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">Tell us how you would like to help. This form opens your email app with a draft addressed to the Foundation; nothing is sent by the website.</p>
          <form className="mt-7 space-y-4" onSubmit={submitVolunteer}>
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/75" htmlFor="volunteer-name">Your name</label>
              <input id="volunteer-name" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/75" htmlFor="volunteer-email">Email address</label>
              <input id="volunteer-email" type="email" className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/75" htmlFor="volunteer-interest">How would you like to help?</label>
              <textarea id="volunteer-interest" className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40" value={interest} onChange={(event) => setInterest(event.target.value)} required />
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#c6a45d] px-5 py-3.5 text-sm font-bold text-forest-deep hover:bg-[#d8ba77]">Prepare volunteer email</button>
          </form>
        </aside>
      </div>
    </section>
  );
}
