import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/** CPC's monthly ENSO diagnostic discussion — carries the official alert status. */
export const ALERT_URL =
  "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml";

export type AlertStatus = {
  /** e.g. "El Niño Advisory" — verbatim from CPC. */
  status: string;
  /** Issue date as printed, e.g. "13 August 2026". */
  issued: string | null;
  /** CPC's one-paragraph synopsis, verbatim. */
  synopsis: string | null;
};

const ENTITIES: Record<string, string> = {
  "&ntilde;": "ñ", "&Ntilde;": "Ñ", "&nbsp;": " ", "&amp;": "&",
  "&deg;": "°", "&quot;": '"', "&lt;": "<", "&gt;": ">", "&percnt;": "%",
};

function decodeEntity(e: string): string {
  if (e in ENTITIES) return ENTITIES[e];
  const num = /^&#(x?)([0-9a-f]+);$/i.exec(e);
  if (num) return String.fromCodePoint(parseInt(num[2], num[1] ? 16 : 10));
  return " ";
}

function toText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, decodeEntity)
    .replace(/[ \t\r]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function parseAlert(html: string): AlertStatus | null {
  const text = toText(html);
  const flat = text.replace(/\n/g, " ");
  const status = /ENSO Alert System Status:\s*((?:El Niño|La Niña|Final El Niño|Final La Niña)?\s*(?:Watch|Advisory)|Not Active)/i.exec(flat);
  if (!status) return null;
  const before = flat.slice(0, status.index);
  const dates = before.match(/\d{1,2} [A-Z][a-z]+ \d{4}/g);
  // CPC's synopsis is one sentence; the discussion body follows it directly.
  const syn = /Synopsis:\s*(.+?[.!?])(?=\s+[A-Z]|$)/.exec(flat.slice(status.index));
  return {
    status: status[1].replace(/\s+/g, " ").trim(),
    issued: dates ? dates[dates.length - 1] : null,
    synopsis: syn ? syn[1].trim() : null,
  };
}

export async function getAlertStatus(): Promise<Result<AlertStatus>> {
  try {
    const html = await fetchText(ALERT_URL, REVALIDATE.daily);
    const parsed = parseAlert(html);
    if (!parsed) return fail("Alert status not found on CPC discussion page");
    return ok(parsed);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
