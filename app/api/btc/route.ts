import { NextResponse } from "next/server";
import { getBtc } from "@/lib/sources/btc";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const result = await getBtc();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
