import { NextResponse } from "next/server";
import { getPlume } from "@/lib/sources/plume";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const result = await getPlume();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
