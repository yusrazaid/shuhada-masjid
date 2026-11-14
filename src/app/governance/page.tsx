import type { Metadata } from "next";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Governance and safeguarding",
  description: "Charity identity, registration details and safeguarding contact for Shuhada Foundation of Ireland.",
};

export default function GovernancePage() {
  return (
    <>
      <Navbar organizationName={siteConfig.organizationName} />
      <main id="main-content" tabIndex={-1} className="min-h-screen pt-24">
        <header className="bg-forest px-5 py-16 text-white md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl">
            <a className="text-sm text-white/70 underline-offset-4 hover:underline" href="/">← Back to home</a>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.25em] text-gold">Accountability</p>
            <h1 className="mt-3 font-serif text-4xl md:text-6xl">Governance and safeguarding</h1>
            <p className="mt-6 max-w-2xl leading-8 text-white/75">The Foundation publishes its charity identity and registration details here. Contact the team for current governance or safeguarding documents.</p>
          </div>
        </header>
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <section className="rounded-3xl bg-white p-8 shadow-soft">
            <FileCheck2 className="text-gold" size={28} />
            <h2 className="mt-6 font-serif text-2xl text-forest">Charity identity</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div><dt className="font-semibold text-slate-500">Public organization</dt><dd className="mt-1 text-slate-800">{siteConfig.organizationName}</dd></div>
              <div><dt className="font-semibold text-slate-500">Legal charity</dt><dd className="mt-1 text-slate-800">{siteConfig.legalCharityName}</dd></div>
              <div><dt className="font-semibold text-slate-500">Charities Regulator number</dt><dd className="mt-1 text-slate-800">{siteConfig.charitiesRegulatorNumber}</dd></div>
              <div><dt className="font-semibold text-slate-500">Revenue charity tax number</dt><dd className="mt-1 text-slate-800">{siteConfig.revenueCharityTaxNumber}</dd></div>
            </dl>
          </section>
          <section className="rounded-3xl bg-white p-8 shadow-soft">
            <ShieldCheck className="text-gold" size={28} />
            <h2 className="mt-6 font-serif text-2xl text-forest">Safeguarding</h2>
            <p className="mt-4 leading-7 text-slate-600">The Foundation welcomes safeguarding questions and concerns. Email the team to request the current safeguarding policy or to ask how to raise a concern.</p>
            <a className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white" href="mailto:info@shuhadafoundation.com?subject=Safeguarding%20Enquiry">Contact the Foundation</a>
            <p className="mt-5 text-sm leading-6 text-slate-500">For an immediate risk to someone's safety, contact emergency services on 112 or 999.</p>
          </section>
        </div>
        <p className="mx-auto max-w-5xl px-5 pb-16 text-sm text-slate-500 md:px-8">Registered office: {siteConfig.address.formatted}</p>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
