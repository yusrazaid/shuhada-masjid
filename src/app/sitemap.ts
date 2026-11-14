import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/timetable/", "/janazah/", "/governance/", "/privacy/"];
  return routes.map((route) => ({
    url: new URL(route, siteConfig.domains.primary).toString(),
    changeFrequency: route === "/timetable/" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
