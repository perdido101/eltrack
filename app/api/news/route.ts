import { NextResponse } from "next/server";
import { getNews } from "@/lib/sources/news";

export const dynamic = "force-dynamic";
// Two GDELT attempts of 7 s each plus fallback assembly must fit inside this.
export const maxDuration = 30;

export async function GET() {
  const result = await getNews();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=900, stale-while-revalidate=3600" },
  });
}
