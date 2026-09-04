import { NextResponse } from "next/server";
import { getToken } from "@/lib/sources/token";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getToken();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=300" },
  });
}
