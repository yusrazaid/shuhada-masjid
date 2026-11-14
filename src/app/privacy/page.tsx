import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy and cookies",
  description: "Privacy information for the Shuhada Foundation of Ireland website.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar organizationName={siteConfig.organizationName} />
      <main id="main-content" tabIndex={-1} className="mx-auto min-h-screen max-w-4xl px-5 pb-20 pt-36 md:px-8">
        <a className="text-sm font-semibold text-forest underline-offset-4 hover:underline" href="/">← Back to home</a>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-gold">Privacy</p>
        <h1 className="mt-3 font-serif text-4xl text-forest md:text-6xl">Privacy and cookies</h1>
        <p className="mt-6 leading-8 text-slate-600">This is a static information website for {siteConfig.organizationName}. It does not run advertising, analytics or social tracking scripts and does not set tracking cookies.</p>
        <div className="mt-10 space-y-9">
          <section>
            <h2 className="font-serif text-2xl text-forest">Information stored on your device</h2>
            <p className="mt-3 leading-7 text-slate-600">If you change the Asr calculation preference or dismiss an urgent announcement, that choice is stored in your browser's local storage. These settings stay on your device and are not sent to the Foundation.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-forest">External services</h2>
            <p className="mt-3 leading-7 text-slate-600">Prayer times are requested from Aladhan using the public Dublin coordinates and the date shown. The map is embedded from OpenStreetMap. If you choose to play a video, the site loads it from YouTube's privacy-enhanced domain. Those services may receive technical information such as your IP address when your browser connects to them.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-forest">Contact</h2>
            <p className="mt-3 leading-7 text-slate-600">If you email or telephone the Foundation, your message or call contains information you choose to share. Contact the team at <a className="font-semibold text-forest underline" href="mailto:info@shuhadafoundation.com">info@shuhadafoundation.com</a> with privacy questions.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-forest">Your rights</h2>
            <p className="mt-3 leading-7 text-slate-600">The Irish Data Protection Commission provides information about data protection rights and how to raise a concern. Visit <a className="font-semibold text-forest underline" href="https://www.dataprotection.ie/" rel="noreferrer">dataprotection.ie</a>.</p>
          </section>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
