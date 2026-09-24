import { NextResponse } from "next/server";
import cmsConfig from "../../../../cms.config";
import { getPublishedText } from "../../../../lib/cms";

const HERO_EYEBROW_FALLBACK = "A SLOWER STATE OF BEING";
const HOME_SLUG = "home";
const HERO_EYEBROW_FIELD = "hero.eyebrow";

export const dynamic = "force-dynamic";

export async function GET() {
  const fieldRule = cmsConfig.contentSchema[HOME_SLUG].fields[HERO_EYEBROW_FIELD];
  if (fieldRule.type !== "text") {
    return NextResponse.json(
      { heroEyebrow: HERO_EYEBROW_FALLBACK },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const heroEyebrow = await getPublishedText(
    cmsConfig.siteId,
    HOME_SLUG,
    HERO_EYEBROW_FIELD,
    HERO_EYEBROW_FALLBACK
  );
  return NextResponse.json(
    { heroEyebrow },
    { headers: { "Cache-Control": "no-store" } }
  );
}
