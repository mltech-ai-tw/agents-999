import type { MetadataRoute } from "next";
import { AGENT_DATA } from "@/lib/agents/data";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/pipeline", "/settings"].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.6,
    }),
  );

  const agentRoutes: MetadataRoute.Sitemap = AGENT_DATA.map((agent) => ({
    url: `${SITE.url}/tools/${agent.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...agentRoutes];
}
