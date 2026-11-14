import { loadCachedLiveContentState } from "@/lib/github-committer";
import { getDublinDateParts, getPrayerTimesFallback } from "@/lib/prayer-utils";
import { Navbar } from "@/components/Navbar";
import { TopPrayerBar } from "@/components/TopPrayerBar";
import { UrgentBanner } from "@/components/UrgentBanner";
import { HeroSection } from "@/components/HeroSection";
import { PrayerTimetableWidget } from "@/components/PrayerTimetableWidget";
import { ConstructionCampaign } from "@/components/ConstructionCampaign";
import { ServicesGrid } from "@/components/ServicesGrid";
import { EventsAndVolunteer } from "@/components/EventsAndVolunteer";
import { MediaGallery } from "@/components/MediaGallery";
import { DonationSection } from "@/components/DonationSection";
import { LocationMapSection } from "@/components/LocationMapSection";
import { Footer } from "@/components/Footer";

export default async function HomePage() {
  const live = await loadCachedLiveContentState();
  const siteConfig = live["site-config"];
  const prayerConfig = live["prayer-config"];
  const announcements = live.announcements;
  const campaigns = live.campaigns;
  const services = live.services;
  const events = live.events;
  const media = live.media;
  const donations = live.donations;

  const initialPrayerDay = getPrayerTimesFallback(getDublinDateParts(), prayerConfig);
  const announcement = announcements.announcements.find((item) => item.active);

  return (
    <>
      <TopPrayerBar initialPrayerDay={initialPrayerDay} config={prayerConfig} />
      <Navbar organizationName={siteConfig.organizationName} withPrayerBar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection jummah={prayerConfig.jummah} />
        {announcement ? <UrgentBanner announcement={announcement} /> : null}
        <PrayerTimetableWidget initialPrayerDay={initialPrayerDay} config={prayerConfig} jummah={prayerConfig.jummah} />
        <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-32">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold">A welcoming place in Dublin 15</p>
            <h2 className="font-serif text-4xl leading-tight text-forest md:text-5xl">Faith, learning and community</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Shuhada Foundation of Ireland serves the local community from Warrenstown House. Find prayer times, learn about community services and contact the team for current information.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white" href="/governance/">Charity information</a>
              <a className="rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white" href="/janazah/">Janazah guide</a>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <img className="absolute inset-0 h-full w-full object-cover object-[78%_center]" src="/images/warrenstown-house.jpg" alt="Warrenstown House in Blanchardstown" loading="lazy" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-5 shadow-lg md:inset-x-7 md:bottom-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Find us</p>
              <p className="mt-2 text-lg font-semibold text-forest">Warrenstown House, Dublin 15</p>
              <p className="mt-1 text-sm text-slate-500">D15 ET27, Ireland</p>
            </div>
          </div>
        </section>
        <ServicesGrid items={services.services} />
        <ConstructionCampaign campaign={campaigns.campaign} />
        <EventsAndVolunteer events={events} />
        <MediaGallery videos={media.videos} />
        <DonationSection donations={donations} />
        <LocationMapSection config={siteConfig} />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
