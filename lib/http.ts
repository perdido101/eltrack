/** Server-side text fetch with a hard timeout and Next data-cache revalidation. */
export async function fetchText(
  url: string,
  revalidateSeconds: number,
  timeoutMs = 15_000,
): Promise<string> {
  const ctl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Race a timer as well as aborting: the patched fetch inside Next's data cache
  // does not always honour the signal, and a hung upstream must not hang the route.
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      ctl.abort();
      reject(new Error(`Timed out after ${timeoutMs} ms fetching ${new URL(url).host}`));
    }, timeoutMs);
  });
  try {
    const res = await Promise.race([
      fetch(url, {
        signal: ctl.signal,
        headers: { "user-agent": "sen-monitor/0.1 (+https://senmonitor.com)" },
        next: { revalidate: revalidateSeconds },
      }),
      timeout,
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
    return await Promise.race([res.text(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** Revalidation intervals per BRIEF §3, in seconds. */
export const REVALIDATE = {
  monthly: 6 * 3600,
  weekly: 3600,
  daily: 3600,
  news: 15 * 60,
  market: 30,
  onchain: 60,
} as const;
