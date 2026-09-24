import "server-only";
import cmsConfig from "../cms.config";

type CmsResponse = {
  siteId?: string;
  slug?: string;
  content?: Record<string, { type?: string; value?: unknown }>;
};

/** Read one published text field, retaining the supplied copy if CMS is unavailable. */
export async function getPublishedText(siteId: string, slug: string, field: string, fallback: string): Promise<string> {
  const baseUrl = process.env.CMS_BASE_URL;
  const apiKey = process.env.CMS_API_KEY;
  if (!baseUrl || !apiKey) return fallback;

  try {
    const endpoint = new URL(
      `/api/public/content/${encodeURIComponent(siteId)}/${encodeURIComponent(slug)}`,
      baseUrl
    );
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return fallback;

    const data = (await response.json()) as CmsResponse;
    const entry = data.content?.[field];
    return entry?.type === "text" && typeof entry.value === "string" && entry.value.length > 0
      ? entry.value
      : fallback;
  } catch {
    return fallback;
  }
}
