"use client";

import { useState } from "react";
import { ArrowUpRight, Heart, Landmark, Phone, ShieldCheck } from "lucide-react";
import type { DonationConfig } from "@/lib/schemas";

const FALLBACK_MAILTO = "mailto:info@shuhadafoundation.com?subject=Masjid%20Donation%20Details";
const FALLBACK_TEL = "tel:+35318218748";

const FUNDS = [
  {
    id: "masjid-construction",
    label: "Shaheed Bilal Masjid Construction",
    badge: "Sadaqah Jariyah",
    description: "Directly supports the purpose-built Shaheed Bilal Masjid complex in Blanchardstown, Dublin 15.",
  },
  {
    id: "masjid-operations",
    label: "Daily Masjid Operations",
    badge: "Essential",
    description: "Maintains daily prayers, utilities, sisters' facilities, and community hospitality at Warrenstown House.",
  },
  {
    id: "education-madrassa",
    label: "Madrassa & Qur'an Education",
    badge: "Youth & Adults",
    description: "Supports weekday/weekend Madrassa classes, Qiraat preparation, and adult/ladies learning.",
  },
  {
    id: "community-welfare",
    label: "Community Welfare & Support",
    badge: "Outreach",
    description: "Assists local families, bereavement support, and community programmes in Dublin 15.",
  },
] as const;

const EUR_TIERS = [25, 50, 100, 250, 500] as const;

export function DonationSection({ donations }: { donations: DonationConfig }) {
  const [selectedFundId, setSelectedFundId] = useState<string>(FUNDS[0].id);
  const [selectedTier, setSelectedTier] = useState<number>(100);
  const selectedFund = FUNDS.find((fund) => fund.id === selectedFundId) ?? FUNDS[0];

  return (
    <section id="donate" className="bg-parchment px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Support the community</p>
          <h2 className="mt-3 font-serif text-4xl text-forest md:text-5xl">Ways to give</h2>
          <p className="mt-5 leading-7 text-slate-600">
            Select a masjid fund and suggested EUR contribution below. All donations are handled through verified{" "}
            <strong>Shuhada Foundation of Ireland</strong> (Charities Regulator No. 20069506 · CHY. 18219) channels.
          </p>
        </div>

        {/* Fund & EUR Tier Selector */}
        <div className="mx-auto mt-10 max-w-5xl rounded-[1.75rem] border border-forest/10 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">1. Choose a Masjid Fund</p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2" role="group" aria-label="Donation fund selector">
                {FUNDS.map((fund) => {
                  const active = fund.id === selectedFund.id;
                  return (
                    <button
                      key={fund.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedFundId(fund.id)}
                      className={
                        "rounded-2xl border p-4 text-left transition " +
                        (active
                          ? "border-forest bg-forest text-white shadow-sm"
                          : "border-forest/15 bg-parchment/60 text-forest hover:bg-parchment")
                      }
                    >
                      <span
                        className={
                          "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                          (active ? "bg-[#c6a45d] text-forest-deep" : "bg-white text-gold")
                        }
                      >
                        {fund.badge}
                      </span>
                      <p className="mt-2 text-sm font-semibold">{fund.label}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">{selectedFund.description}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">2. Suggested EUR Tier</p>
              <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Suggested EUR amount">
                {EUR_TIERS.map((amount) => {
                  const active = selectedTier === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedTier(amount)}
                      className={
                        "rounded-xl border px-3 py-3 text-center text-sm font-bold tabular-nums transition " +
                        (active
                          ? "border-forest bg-forest text-white"
                          : "border-forest/15 bg-parchment/60 text-forest hover:bg-parchment")
                      }
                    >
                      €{amount}
                    </button>
                  );
                })}
                <div className="flex items-center justify-center rounded-xl border border-dashed border-forest/20 bg-parchment/40 px-2 py-3 text-center text-xs font-semibold text-slate-600">
                  Any EUR
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Selected pledge reference: <strong className="text-forest">€{selectedTier} · {selectedFund.label}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-5 md:grid-cols-2">
          <article className="flex flex-col justify-between rounded-[1.75rem] bg-white p-7 shadow-soft md:p-9">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-parchment text-forest">
                <Landmark size={22} />
              </span>
              <h3 className="mt-6 font-serif text-2xl text-forest">SEPA / Bank Transfer</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                Reference: {selectedFund.label} (€{selectedTier})
              </p>
              {donations.bankTransferEnabled && donations.bankTransfer ? (
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Bank</dt>
                    <dd className="font-semibold text-forest">{donations.bankTransfer.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Account name</dt>
                    <dd className="font-semibold text-forest">{donations.bankTransfer.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">IBAN</dt>
                    <dd className="break-all font-mono font-semibold text-forest">{donations.bankTransfer.iban}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">BIC</dt>
                    <dd className="font-mono font-semibold text-forest">{donations.bankTransfer.bic}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  To protect donors from unverified account numbers, official SEPA / IBAN transfer instructions are issued directly by the Masjid Treasury team.
                </p>
              )}
            </div>
            {!donations.bankTransferEnabled || !donations.bankTransfer ? (
              <div className="mt-6 flex flex-col items-start gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-deep"
                  href={FALLBACK_MAILTO}
                >
                  Contact Masjid Treasury for Official SEPA / Bank Details <ArrowUpRight size={15} />
                </a>
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline underline-offset-4"
                  href={FALLBACK_TEL}
                >
                  <Phone size={14} /> Or call 01 821 8748 (+353 1 821 8748)
                </a>
              </div>
            ) : null}
          </article>

          <article className="flex flex-col justify-between rounded-[1.75rem] bg-forest p-7 text-white shadow-soft md:p-9">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e6d3a1]">
                <Heart size={22} />
              </span>
              <h3 className="mt-6 font-serif text-2xl">Sadaqah Jariyah &amp; Online Giving</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">
                “When a person dies, their deeds come to an end except for three: ongoing charity (Sadaqah Jariyah), beneficial knowledge, and a righteous child who prays for them.”
              </p>
              <p className="mt-2 text-xs text-[#e6d3a1]">Sahih Muslim 1631</p>
            </div>
            {donations.onlineDonationEnabled && donations.onlineDonationUrl ? (
              <div className="mt-7">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-[#c6a45d] px-5 py-3 text-sm font-bold text-forest-deep transition hover:bg-[#d8ba77]"
                  href={donations.onlineDonationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Donate €{selectedTier} Online <ArrowUpRight size={15} />
                </a>
              </div>
            ) : (
              <div className="mt-7 flex flex-col items-start gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-[#c6a45d] px-5 py-3 text-sm font-bold text-forest-deep transition hover:bg-[#d8ba77]"
                  href={FALLBACK_MAILTO}
                >
                  Contact Masjid Treasury for Official SEPA / Bank Details <ArrowUpRight size={15} />
                </a>
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e6d3a1] underline underline-offset-4 hover:text-white"
                  href={FALLBACK_TEL}
                >
                  <Phone size={14} /> Or call 01 821 8748 (+353 1 821 8748)
                </a>
              </div>
            )}
          </article>
        </div>

        {donations.whatsappCommunityEnabled && donations.whatsappUrl ? (
          <p className="mt-6 text-center">
            <a
              className="text-sm font-semibold text-forest underline underline-offset-4"
              href={donations.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Join community updates on WhatsApp
            </a>
          </p>
        ) : null}

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck size={15} className="text-gold" />
          <span>
            Irish Islamic Da&apos;awah and Education Trust · Charities Regulator No. <strong>20069506</strong> · Revenue Charity Tax No. <strong>CHY. 18219</strong> (Eligible for Irish CHY3/CHY4 tax relief on qualifying donations ≥ €250/year)
          </span>
        </div>
      </div>
    </section>
  );
}
