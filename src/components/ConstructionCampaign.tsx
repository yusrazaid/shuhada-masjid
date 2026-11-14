import { ArrowUpRight, Check, Circle, Hammer, Landmark } from "lucide-react";
import type { Campaign } from "@/lib/schemas";

export function ConstructionCampaign({ campaign }: { campaign: Campaign }) {
  return (
    <section id="construction" className="overflow-hidden bg-forest px-5 py-20 text-white md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#e6d3a1]">
            <Hammer size={14} /> Masjid project
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-[#e6d3a1]">{campaign.eyebrow}</p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl leading-tight md:text-5xl">{campaign.title}</h2>
          <p className="mt-6 max-w-xl leading-8 text-white/75">{campaign.description}</p>
          <div className="mt-7 grid grid-cols-2 gap-4">
            <figure className="overflow-hidden rounded-2xl border border-white/15 bg-black/20">
              <img
                src="/images/masjid-vision.jpg"
                alt="Shaheed Bilal Masjid architectural perspective render"
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="px-3 py-2 text-[11px] text-white/70">Architectural perspective vision</figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-white/15 bg-black/20">
              <img
                src="/images/masjid-project-model.jpg"
                alt="Shaheed Bilal Masjid 3D scale model"
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="px-3 py-2 text-[11px] text-white/70">3D complex scale model</figcaption>
            </figure>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-[#c6a45d] px-6 py-3.5 text-sm font-bold text-forest-deep transition hover:bg-[#d8ba77]"
              href="#donate"
            >
              Ways to support <ArrowUpRight size={16} />
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              href="mailto:info@shuhadafoundation.com?subject=Masjid%20Project%20Enquiry"
            >
              Ask about the project
            </a>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#e6d3a1]">
              <Landmark size={20} />
            </span>
            <div>
              <h3 className="font-semibold">Project roadmap &amp; milestones</h3>
              <p className="text-xs text-white/50">Updates are published when confirmed by the Trustees</p>
            </div>
          </div>
          <ol className="mt-6 space-y-5">
            {campaign.milestones.map((milestone) => {
              const completed = milestone.status === "complete";
              const inProgress = milestone.status === "inProgress";
              return (
                <li className="flex items-start gap-4" key={milestone.title}>
                  <span
                    className={
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
                      (completed
                        ? "bg-[#c6a45d] text-forest"
                        : inProgress
                          ? "bg-[#c6a45d]/20 text-[#e6d3a1]"
                          : "border border-white/20 text-white/35")
                    }
                  >
                    {completed ? <Check size={15} /> : <Circle size={12} />}
                  </span>
                  <div className="flex-1 border-b border-white/10 pb-5">
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {completed
                        ? "Complete"
                        : inProgress
                          ? "In progress"
                          : milestone.status === "planned"
                            ? "Planned phase"
                            : "Update forthcoming"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <blockquote className="mt-6 border-l-2 border-[#c6a45d] pl-4">
            <p className="font-arabic text-xl leading-9 text-[#e6d3a1]" lang="ar" dir="rtl">
              مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ
            </p>
            <p className="mt-2 font-serif text-lg italic leading-7 text-white/85">“{campaign.hadith.text}”</p>
            <cite className="mt-2 block text-xs not-italic text-[#e6d3a1]">{campaign.hadith.source}</cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
