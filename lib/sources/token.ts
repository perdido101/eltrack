import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";
import { PROJECT } from "@/config/project";

/** The token row: DexScreener by mint address, pump.fun as the fallback before graduation. */
export const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${PROJECT.token.address}`;
export const PUMPFUN_URL = `https://frontend-api-v3.pump.fun/coins/${PROJECT.token.address}`;
export const CHART_URL = `https://dexscreener.com/solana/${PROJECT.token.address}`;

export type TokenData = {
  priceUsd: number;
  change24h: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  chartUrl: string;
  venue: "dexscreener" | "pump.fun";
};

type DexPair = {
  url?: string; priceUsd?: string; priceChange?: { h24?: number }; marketCap?: number; fdv?: number;
  liquidity?: { usd?: number }; volume?: { h24?: number };
};

export async function getToken(): Promise<Result<TokenData>> {
  try {
    const text = await fetchText(DEXSCREENER_URL, REVALIDATE.market, 10_000);
    const pairs = (JSON.parse(text) as { pairs?: DexPair[] }).pairs ?? [];
    // The most liquid pair speaks for the token.
    const p = pairs.slice().sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
    if (p?.priceUsd) {
      return ok({
        priceUsd: Number(p.priceUsd),
        change24h: p.priceChange?.h24 ?? null,
        marketCapUsd: p.marketCap ?? p.fdv ?? null,
        liquidityUsd: p.liquidity?.usd ?? null,
        volume24hUsd: p.volume?.h24 ?? null,
        chartUrl: p.url ?? CHART_URL,
        venue: "dexscreener",
      });
    }
  } catch {
    // fall through to pump.fun
  }
  try {
    const text = await fetchText(PUMPFUN_URL, REVALIDATE.market, 10_000);
    const c = JSON.parse(text) as { usd_market_cap?: number; market_cap_usd?: number; total_supply?: number; base_decimals?: number };
    const cap = c.usd_market_cap ?? c.market_cap_usd;
    const supply = c.total_supply && c.base_decimals != null ? c.total_supply / 10 ** c.base_decimals : 1e9;
    if (cap == null) return fail("pump.fun returned no market cap");
    return ok({ priceUsd: cap / supply, change24h: null, marketCapUsd: cap, liquidityUsd: null, volume24hUsd: null, chartUrl: `https://pump.fun/coin/${PROJECT.token.address}`, venue: "pump.fun" });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
