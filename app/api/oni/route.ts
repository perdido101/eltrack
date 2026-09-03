import { NextResponse } from "next/server";
import { getOni } from "@/lib/sources/oni";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getOni();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
