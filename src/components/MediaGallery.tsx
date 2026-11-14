"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import type { MediaVideo } from "@/lib/schemas";

export function MediaGallery({ videos }: { videos: MediaVideo[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  return (
    <section className="bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Listen and learn</p>
            <h2 className="mt-3 font-serif text-4xl text-forest md:text-5xl">Qur'an, talks and nasheeds</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-500">Videos load only after you choose to play them. The player uses YouTube's privacy-enhanced domain.</p>
        </div>
        {videos.length ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-3xl border border-forest/10 bg-parchment">
                {playingId === video.id ? (
                  <iframe
                    className="aspect-video w-full bg-forest"
                    src={"https://www.youtube-nocookie.com/embed/" + video.youtubeId + "?autoplay=1"}
                    title={video.title}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <button type="button" className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-forest text-white transition hover:bg-forest-deep" onClick={() => setPlayingId(video.id)} aria-label={"Play " + video.title}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c6a45d] text-forest"><Play fill="currentColor" size={22} /></span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">Click to load video</span>
                  </button>
                )}
                <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{video.kind}</p><h3 className="mt-2 font-semibold text-forest">{video.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{video.description}</p></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-9 flex flex-col items-center rounded-3xl border border-dashed border-forest/20 bg-parchment px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold"><Video size={21} /></span>
            <p className="mt-4 font-semibold text-forest">No videos published yet</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">When the Foundation shares approved recordings, they will appear here with click-to-play privacy controls.</p>
            <a className="mt-5 text-sm font-semibold text-forest underline underline-offset-4" href="mailto:info@shuhadafoundation.com?subject=Media%20Enquiry">Ask about recordings</a>
          </div>
        )}
      </div>
    </section>
  );
}
