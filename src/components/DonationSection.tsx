"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, Landmark, Phone, QrCode, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";
import type { DonationConfig } from "@/lib/schemas";

const FALLBACK_MAILTO = "mailto:info@shuhadafoundation.com?subject=Masjid%20Donation%20Details";
const TAX_RELIEF_MAILTO = "mailto:info@shuhadafoundation.com?subject=Donation%20Receipt%20%2F%20CHY3%20Tax%20Relief";
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

function formatIbanDisplay(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") ?? clean;
}

export function DonationSection({ donations }: { donations: DonationConfig }) {
  const [selectedFundId, setSelectedFundId] = useState<string>(FUNDS[0].id);
  const [selectedTier, setSelectedTier] = useState<number>(100);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const selectedFund = FUNDS.find((fund) => fund.id === selectedFundId) ?? FUNDS[0];
  const bank = donations.bankTransferEnabled ? donations.bankTransfer : null;

  const normalizedIban = bank ? bank.iban.replace(/\s+/g, "").toUpperCase() : "";

  const epcPayload = useMemo(() => {
    if (!bank) return "";
    return [
      "BCD",
      "002",
      "1",
      "SCT",
      bank.bic,
      bank.accountName,
      normalizedIban,
      `EUR${selectedTier.toFixed(2)}`,
      "",
      "",
      selectedFund.label.slice(0, 140),
    ].join("\n");
  }, [bank, normalizedIban, selectedTier, selectedFund.label]);

  useEffect(() => {
    if (!epcPayload) {
      setQrDataUrl(null);
      return;
    }
    let active = true;
    QRCode.toDataURL(epcPayload, { width: 180, margin: 1 })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [epcPayload]);

  function copyText(key: string, value: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => {
        setCopiedField((current) => (current === key ? null : current));
      }, 2000);
    }
  }

  const bankCopyRows = bank
    ? [
        { key: "accountName", label: "Account name", display: bank.accountName, copyValue: bank.accountName, mono: false },
        { key: "iban", label: "IBAN", display: formatIbanDisplay(normalizedIban), copyValue: normalizedIban, mono: true },
        { key: "bic", label: "BIC", display: bank.bic, copyValue: bank.bic, mono: true },
        { key: "reference", label: "Suggested payment reference", display: selectedFund.label, copyValue: selectedFund.label, mono: false },
      ]
    : [];

  const allBankSummary = bank
    ? [
        `Account Name: ${bank.accountName}`,
        `Bank: ${bank.bankName}${bank.bankAddress ? ` (${bank.bankAddress})` : ""}`,
        `IBAN: ${normalizedIban}`,
        `BIC: ${bank.bic}`,
        bank.sortCode ? `Sort Code: ${bank.sortCode}` : null,
        bank.accountNumber ? `Account Number: ${bank.accountNumber}` : null,
        `Reference: ${selectedFund.label} (EUR ${selectedTier})`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const qualifyingBoost = ((selectedTier / 0.69) - selectedTier).toFixed(2);
  const qualifyingGross = (selectedTier / 0.69).toFixed(2);

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
              {bank ? (
                <>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Bank</dt>
                      <dd className="font-semibold text-forest">{bank.bankName}</dd>
                      {bank.bankAddress ? <dd className="text-xs text-slate-500">{bank.bankAddress}</dd> : null}
                    </div>
                    {bankCopyRows.map((row) => (
                      <div key={row.key} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
                          <dd className={"font-semibold text-forest break-all " + (row.mono ? "font-mono" : "")}>{row.display}</dd>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(row.key, row.copyValue)}
                          aria-label={`Copy ${row.label}`}
                          className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-forest/15 bg-parchment px-2.5 py-1 text-[11px] font-semibold text-forest transition hover:bg-forest hover:text-white"
                        >
                          {copiedField === row.key ? <Check size={12} /> : <Copy size={12} />}
                          {copiedField === row.key ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                    {(bank.sortCode || bank.accountNumber) ? (
                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-parchment/60 p-3">
                        {bank.sortCode ? (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <dt className="text-[11px] font-medium text-slate-500">Sort Code</dt>
                              <dd className="font-mono text-sm font-semibold text-forest">{bank.sortCode}</dd>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyText("sortCode", bank.sortCode!)}
                              aria-label="Copy Sort Code"
                              className="inline-flex items-center rounded-full border border-forest/15 bg-white p-1.5 text-forest transition hover:bg-forest hover:text-white"
                            >
                              {copiedField === "sortCode" ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : null}
                        {bank.accountNumber ? (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <dt className="text-[11px] font-medium text-slate-500">Account Number</dt>
                              <dd className="font-mono text-sm font-semibold text-forest">{bank.accountNumber}</dd>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyText("accountNumber", bank.accountNumber!)}
                              aria-label="Copy Account Number"
                              className="inline-flex items-center rounded-full border border-forest/15 bg-white p-1.5 text-forest transition hover:bg-forest hover:text-white"
                            >
                              {copiedField === "accountNumber" ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </dl>

                  {qrDataUrl ? (
                    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-forest/10 bg-parchment/50 p-3.5">
                      <img
                        src={qrDataUrl}
                        alt={`EPC SEPA QR code to transfer EUR ${selectedTier} to ${bank.accountName}`}
                        width={96}
                        height={96}
                        className="h-24 w-24 shrink-0 rounded-xl border border-forest/10 bg-white p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
                          <QrCode size={14} className="text-gold" /> Scan to Pay via SEPA App
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Scan in Revolut, AIB, Bank of Ireland, PTSB, or N26 to pre-fill <strong>€{selectedTier}</strong> to{" "}
                          <strong>{bank.accountName}</strong> (0% fees).
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  To protect donors from unverified account numbers, official SEPA / IBAN transfer instructions are issued directly by the Masjid Treasury team.
                </p>
              )}
            </div>

            {bank ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => copyText("all", allBankSummary)}
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-deep"
                >
                  {copiedField === "all" ? <Check size={15} /> : <Copy size={15} />}
                  {copiedField === "all" ? "Copied All Bank Details" : "Copy All Bank Details"}
                </button>
              </div>
            ) : (
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
            )}
          </article>

          <article className="flex flex-col justify-between rounded-[1.75rem] bg-forest p-7 text-white shadow-soft md:p-9">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e6d3a1]">
                <Heart size={22} />
              </span>
              <h3 className="mt-6 font-serif text-2xl">Sadaqah Jariyah &amp; Standing Order</h3>
              <p className="mt-3 text-sm leading-7 text-white/75">
                “When a person dies, their deeds come to an end except for three: ongoing charity (Sadaqah Jariyah), beneficial knowledge, and a righteous child who prays for them.”
              </p>
              <p className="mt-2 text-xs text-[#e6d3a1]">Sahih Muslim 1631</p>

              {bank ? (
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e6d3a1]">
                    Irish Revenue CHY3 Tax Relief (+44.9%)
                  </p>
                  {selectedTier >= 250 ? (
                    <p className="mt-2 text-sm leading-6 text-white/90">
                      Your <strong>€{selectedTier}</strong> donation allows the charity (CHY. 18219) to reclaim{" "}
                      <strong className="text-[#e6d3a1]">+€{qualifyingBoost}</strong> from Revenue — turning your gift into{" "}
                      <strong>€{qualifyingGross}</strong> total value at €0 extra cost to you.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-white/90">
                      Setting up a monthly bank standing order of <strong>€21/month (€252/year)</strong> or donating{" "}
                      <strong>€250+</strong> in a year lets the Masjid reclaim <strong className="text-[#e6d3a1]">+€112.32+</strong> via Irish Revenue (CHY. 18219) at €0 extra cost.
                    </p>
                  )}
                </div>
              ) : null}
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
                  href={bank ? TAX_RELIEF_MAILTO : FALLBACK_MAILTO}
                >
                  {bank ? "Request Donation Receipt or CHY3 Form" : "Contact Masjid Treasury for Official SEPA / Bank Details"}{" "}
                  <ArrowUpRight size={15} />
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
