import "server-only";

type CmsResponse = {
  siteId?: string;
  slug?: string;
  content?: Record<string, { type?: string; value?: unknown }>;
};

/** Read fresh published content. Null lets the browser retain its last good copy. */
export async function getPublishedText(siteId: string, slug: string, field: string): Promise<string | null> {
  const baseUrl = process.env.CMS_BASE_URL;
  const apiKey = process.env.CMS_API_KEY;
  if (!baseUrl || !apiKey) return null;

  try {
    const endpoint = new URL(
      `/api/public/content/${encodeURIComponent(siteId)}/${encodeURIComponent(slug)}`,
      baseUrl
    );
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as CmsResponse;
    const entry = data.content?.[field];
    return entry?.type === "text" && typeof entry.value === "string" && entry.value.length > 0
      ? entry.value
      : null;
  } catch {
    return null;
  }
}
