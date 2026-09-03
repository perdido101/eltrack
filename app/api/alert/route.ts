import { NextResponse } from "next/server";
import { getAlertStatus } from "@/lib/sources/alertStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getAlertStatus();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
