import {
  announcements,
  campaigns,
  donations,
  events,
  media,
  prayerConfig,
  services,
  siteConfig,
} from "./content";
import type { AllContentState, MutableContentKey } from "./coordinator-agent";
import { buildEventsIcs, buildPresenceJson } from "./feed-builder";
import { contentSchemas } from "./schemas";

const DEFAULT_REPO = "yusrazaid/shuhada-masjid";
const DEFAULT_BRANCH = "main";

export function getLocalContentState(): AllContentState {
  return {
    "site-config": siteConfig,
    "prayer-config": prayerConfig,
    announcements,
    campaigns,
    services,
    events,
    media,
    donations,
  };
}

async function fetchRemoteContentState(options: {
  cached: boolean;
}): Promise<AllContentState> {
  if (process.env.NEXT_OUTPUT_MODE === "export") {
    return getLocalContentState();
  }

  const repo = process.env.GITHUB_REPOSITORY || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token = process.env.GITHUB_TOKEN;

  try {
    const [
      remoteSite,
      remotePrayer,
      remoteAnnouncements,
      remoteCampaigns,
      remoteServices,
      remoteEvents,
      remoteMedia,
      remoteDonations,
    ] = await Promise.all([
      fetchGithubJson("site-config", repo, branch, "content/site-config.json", token, options.cached),
      fetchGithubJson("prayer-config", repo, branch, "content/prayer-config.json", token, options.cached),
      fetchGithubJson("announcements", repo, branch, "content/announcements.json", token, options.cached),
      fetchGithubJson("campaigns", repo, branch, "content/campaigns.json", token, options.cached),
      fetchGithubJson("services", repo, branch, "content/services.json", token, options.cached),
      fetchGithubJson("events", repo, branch, "content/events.json", token, options.cached),
      fetchGithubJson("media", repo, branch, "content/media.json", token, options.cached),
      fetchGithubJson("donations", repo, branch, "content/donations.json", token, options.cached),
    ]);

    return {
      "site-config": remoteSite ?? siteConfig,
      "prayer-config": remotePrayer ?? prayerConfig,
      announcements: remoteAnnouncements ?? announcements,
      campaigns: remoteCampaigns ?? campaigns,
      services: remoteServices ?? services,
      events: remoteEvents ?? events,
      media: remoteMedia ?? media,
      donations: remoteDonations ?? donations,
    };
  } catch {
    return getLocalContentState();
  }
}

export async function loadLiveContentState(): Promise<AllContentState> {
  return fetchRemoteContentState({ cached: false });
}

export async function loadCachedLiveContentState(): Promise<AllContentState> {
  return fetchRemoteContentState({ cached: true });
}

async function fetchGithubJson<K extends keyof AllContentState>(
  schemaKey: K,
  repo: string,
  branch: string,
  path: string,
  token: string | undefined,
  cached: boolean,
): Promise<AllContentState[K] | null> {
  const headers: Record<string, string> = {
    "User-Agent": "shuhada-masjid-coordinator-agent",
  };
  let url: string;
  if (token) {
    headers.Accept = "application/vnd.github.raw+json";
    headers.Authorization = `Bearer ${token}`;
    url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  } else {
    url = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(branch)}/${path}`;
  }

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(2500),
    ...(cached
      ? { next: { revalidate: 60, tags: ["shuhada-content"] } }
      : { cache: "no-store" as const }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const parsed = contentSchemas[schemaKey].safeParse(json);
  return parsed.success ? (parsed.data as AllContentState[K]) : null;
}

export interface CommitResult {
  committed: boolean;
  commitSha?: string;
  commitUrl?: string;
  deployTriggered?: boolean;
  error?: string;
}

/**
 * Atomically commits updated content/<targetFile>.json + regenerated public/presence.json
 * and public/events.ics to GitHub using the Git Data API, then triggers Vercel deploy hook if set.
 */
export async function commitContentUpdateToGithub(params: {
  state: AllContentState;
  targetFile: MutableContentKey;
  updatedContent: unknown;
  commitMessage: string;
}): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;

  if (!token) {
    return {
      committed: false,
      error:
        "GITHUB_TOKEN is not configured on the server yet. Add a Fine-Grained PAT scoped to yusrazaid/shuhada-masjid in Vercel Environment Variables.",
    };
  }

  const nextState: AllContentState = {
    ...params.state,
    [params.targetFile]: params.updatedContent,
  };

  const contentJsonString = JSON.stringify(params.updatedContent, null, 2) + "\n";
  const presenceJsonString = buildPresenceJson(nextState);
  const eventsIcsString = buildEventsIcs(nextState);

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "shuhada-masjid-coordinator-agent",
  };

  // 1. Get current branch HEAD commit SHA
  const refRes = await fetch(
    `https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
    { headers, cache: "no-store" },
  );
  if (!refRes.ok) {
    return {
      committed: false,
      error: `Failed to read GitHub branch '${branch}' (HTTP ${refRes.status}).`,
    };
  }
  const refData = (await refRes.json()) as { object: { sha: string } };
  const headCommitSha = refData.object.sha;

  // 2. Get base tree SHA
  const commitRes = await fetch(
    `https://api.github.com/repos/${repo}/git/commits/${headCommitSha}`,
    { headers, cache: "no-store" },
  );
  if (!commitRes.ok) {
    return {
      committed: false,
      error: `Failed to read HEAD commit '${headCommitSha}' (HTTP ${commitRes.status}).`,
    };
  }
  const commitData = (await commitRes.json()) as { tree: { sha: string } };

  // 3. Create new tree with updated JSON + regenerated feeds
  const treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      base_tree: commitData.tree.sha,
      tree: [
        {
          path: `content/${params.targetFile}.json`,
          mode: "100644",
          type: "blob",
          content: contentJsonString,
        },
        {
          path: "public/presence.json",
          mode: "100644",
          type: "blob",
          content: presenceJsonString,
        },
        {
          path: "public/events.ics",
          mode: "100644",
          type: "blob",
          content: eventsIcsString,
        },
      ],
    }),
  });
  if (!treeRes.ok) {
    return {
      committed: false,
      error: `Failed to create GitHub tree (HTTP ${treeRes.status}).`,
    };
  }
  const treeData = (await treeRes.json()) as { sha: string };

  // 4. Create commit
  const newCommitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: params.commitMessage,
      tree: treeData.sha,
      parents: [headCommitSha],
    }),
  });
  if (!newCommitRes.ok) {
    return {
      committed: false,
      error: `Failed to create GitHub commit (HTTP ${newCommitRes.status}).`,
    };
  }
  const newCommitData = (await newCommitRes.json()) as { sha: string; html_url: string };

  // 5. Update branch reference
  const updateRefRes = await fetch(
    `https://api.github.com/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: newCommitData.sha, force: false }),
    },
  );
  if (!updateRefRes.ok) {
    return {
      committed: false,
      error: `Failed to update branch '${branch}' (HTTP ${updateRefRes.status}).`,
    };
  }

  // 6. Trigger optional Vercel Deploy Hook if configured
  let deployTriggered = false;
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    try {
      const hookRes = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
      deployTriggered = hookRes.ok;
    } catch {
      deployTriggered = false;
    }
  }

  return {
    committed: true,
    commitSha: newCommitData.sha.slice(0, 7),
    commitUrl: `https://github.com/${repo}/commit/${newCommitData.sha}`,
    deployTriggered,
  };
}
